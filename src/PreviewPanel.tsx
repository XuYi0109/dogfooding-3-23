/**
 * 实时预览面板组件
 * Real-time Preview Panel Component
 *
 * 可视化展示所有可见层的当前配置状态
 * Visualizes the current configuration state of all visible layers
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { RotateItemConfig, LauncherConfig } from './types';

/**
 * 预览面板属性接口
 * Preview panel props interface
 */
interface PreviewPanelProps {
  /** 当前配置 */
  config: LauncherConfig;
  /** 预览尺寸 */
  size?: number;
}

/**
 * 获取当前时间角度
 * Get current time angle based on hand type
 */
const getTimeAngle = (handType: string, utcOffset: number): number => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const localTime = new Date(utc + utcOffset * 3600000);

  switch (handType) {
    case 'hour':
      const hours = localTime.getHours() % 12;
      const minutes = localTime.getMinutes();
      return (hours * 30) + (minutes * 0.5) - 90; // -90 to start from 12 o'clock
    case 'minute':
      const mins = localTime.getMinutes();
      const seconds = localTime.getSeconds();
      return (mins * 6) + (seconds * 0.1) - 90;
    case 'second':
      const secs = localTime.getSeconds();
      const ms = localTime.getMilliseconds();
      return (secs * 6) + (ms * 0.006) - 90;
    default:
      return 0;
  }
};

/**
 * 计算层旋转角度
 * Calculate layer rotation angle
 */
const calculateRotation = (
  layer: RotateItemConfig,
  rotationConfig: 'rotation1' | 'rotation2',
  baseTime: number
): number => {
  const config = layer[rotationConfig];
  if (config.enabled !== 'yes') return 0;

  let angle = config.itemTiltPosition;

  // 如果是时钟指针，添加时间角度
  if (layer.handType && layer.handRotation === rotationConfig.toUpperCase()) {
    angle += getTimeAngle(layer.handType, layer.timezone.utcOffset);
  }

  // 添加基于速度的旋转
  if (config.rotationWay && config.rotationWay !== 'no') {
    const speed = config.rotationSpeed;
    const direction = config.rotationWay === '-' ? -1 : 1;
    const timeFactor = (baseTime / 1000) * speed * direction;
    angle += timeFactor % 360;
  }

  return angle;
};

/**
 * 绘制默认时钟表盘
 * Draw default clock face
 */
const drawClockFace = (ctx: CanvasRenderingContext2D, size: number) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.45;

  // 绘制外圆
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 绘制刻度
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const isHour = i % 5 === 0;
    const innerR = radius - (isHour ? 15 : 8);
    const outerR = radius - 2;

    ctx.beginPath();
    ctx.moveTo(
      centerX + Math.cos(angle) * innerR,
      centerY + Math.sin(angle) * innerR
    );
    ctx.lineTo(
      centerX + Math.cos(angle) * outerR,
      centerY + Math.sin(angle) * outerR
    );
    ctx.strokeStyle = isHour ? '#fff' : '#888';
    ctx.lineWidth = isHour ? 3 : 1;
    ctx.stroke();
  }

  // 绘制数字
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const numR = radius - 30;
    ctx.fillText(
      String(i),
      centerX + Math.cos(angle) * numR,
      centerY + Math.sin(angle) * numR
    );
  }
};

/**
 * 绘制时钟指针
 * Draw clock hand
 */
const drawHand = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  angle: number,
  length: number,
  width: number,
  color: string,
  glow: boolean = false
) => {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle * (Math.PI / 180));

  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
  }

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.restore();
};

/**
 * 绘制层内容（当没有图像时）
 * Draw layer content when no image
 */
const drawLayerContent = (
  ctx: CanvasRenderingContext2D,
  layer: RotateItemConfig,
  size: number,
  baseTime: number
) => {
  const centerX = size / 2;
  const centerY = size / 2;

  // 根据层类型绘制不同内容
  if (layer.handType) {
    // 绘制时钟指针
    const angle = getTimeAngle(layer.handType, layer.timezone.utcOffset);
    const length = size * 0.4 * (layer.itemSize / 100);
    const width = layer.handType === 'hour' ? 6 : layer.handType === 'minute' ? 4 : 2;
    const color = layer.handType === 'second' ? '#ff4444' : '#fff';
    const glow = layer.visualEffects.glow === 'yes';

    drawHand(ctx, centerX, centerY, angle, length, width, color, glow);
  } else if (layer.itemLayer === 1) {
    // 第一层绘制表盘
    drawClockFace(ctx, size);
  } else {
    // 其他层绘制占位图形
    const layerSize = (layer.itemSize / 100) * size * 0.8;
    const halfSize = layerSize / 2;

    ctx.save();

    // 应用旋转
    const rotation1Angle = calculateRotation(layer, 'rotation1', baseTime);
    const rotation2Angle = calculateRotation(layer, 'rotation2', baseTime);
    const totalRotation = rotation1Angle + rotation2Angle;

    ctx.translate(centerX, centerY);
    ctx.rotate(totalRotation * (Math.PI / 180));

    // 视觉效果
    if (layer.visualEffects.shadow === 'yes') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
    }

    if (layer.visualEffects.glow === 'yes') {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 15;
    }

    if (layer.visualEffects.transparent === 'yes') {
      ctx.globalAlpha = 0.7;
    }

    // 绘制占位矩形
    ctx.fillStyle = `hsl(${(layer.itemLayer * 30) % 360}, 70%, 50%)`;
    ctx.fillRect(-halfSize, -halfSize, layerSize, layerSize);

    // 绘制文字
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`L${layer.itemLayer}`, 0, 0);

    // 脉冲效果
    if (layer.visualEffects.pulse === 'yes') {
      const pulseScale = 1 + Math.sin(baseTime / 200) * 0.1;
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.3 * Math.abs(Math.sin(baseTime / 200));
      ctx.beginPath();
      ctx.arc(0, 0, halfSize * pulseScale, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(layer.itemLayer * 30) % 360}, 70%, 50%)`;
      ctx.fill();
    }

    ctx.restore();
  }
};

/**
 * 预览面板组件
 * Preview panel component
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  config,
  size = 400,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);

  // 按层排序的配置
  const sortedLayers = useMemo(() => {
    return [...config.rotateConfig]
      .filter((l) => l.itemDisplay === 'yes' && l.visualEffects.render === 'yes')
      .sort((a, b) => a.itemLayer - b.itemLayer);
  }, [config.rotateConfig]);

  // 加载图像
  const loadImage = useCallback((path: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      if (!path) {
        resolve(null);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = path;
    });
  }, []);

  // 渲染画布
  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布并绘制背景
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const baseTime = Date.now();

    // 绘制每个可见层
    for (const layer of sortedLayers) {
      const img = await loadImage(layer.itemPath);

      if (img) {
        // 使用图像
        ctx.save();

        // 计算位置
        const layerSize = (layer.itemSize / 100) * size;
        const scale = layerSize / Math.max(img.width, img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // 应用视觉效果
        if (layer.visualEffects.shadow === 'yes') {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
        }

        if (layer.visualEffects.glow === 'yes') {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 20;
        }

        if (layer.visualEffects.transparent === 'yes') {
          ctx.globalAlpha = 0.7;
        }

        // 计算旋转中心点
        const axisX = centerX + (layer.rotation1.itemAxisX / 100 - 0.5) * size;
        const axisY = centerY + (layer.rotation1.itemAxisY / 100 - 0.5) * size;

        // 应用位置偏移
        const offsetX = (layer.rotation1.itemPositionX / 100) * size;
        const offsetY = (layer.rotation1.itemPositionY / 100) * size;

        // 移动到旋转中心
        ctx.translate(axisX + offsetX, axisY + offsetY);

        // 应用旋转
        const rotation1Angle = calculateRotation(layer, 'rotation1', baseTime);
        const rotation2Angle = calculateRotation(layer, 'rotation2', baseTime);
        const totalRotation = (rotation1Angle + rotation2Angle) * (Math.PI / 180);
        ctx.rotate(totalRotation);

        // 绘制图像
        ctx.drawImage(
          img,
          -scaledWidth / 2,
          -scaledHeight / 2,
          scaledWidth,
          scaledHeight
        );

        // 绘制脉冲效果
        if (layer.visualEffects.pulse === 'yes') {
          const pulseScale = 1 + Math.sin(baseTime / 200) * 0.05;
          ctx.globalCompositeOperation = 'screen';
          ctx.globalAlpha = 0.3 * Math.abs(Math.sin(baseTime / 200));
          ctx.drawImage(
            img,
            (-scaledWidth / 2) * pulseScale,
            (-scaledHeight / 2) * pulseScale,
            scaledWidth * pulseScale,
            scaledHeight * pulseScale
          );
        }

        ctx.restore();
      } else {
        // 没有图像时绘制默认内容
        drawLayerContent(ctx, layer, size, baseTime);
      }
    }

    // 绘制中心点标记
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
  }, [sortedLayers, size, loadImage]);

  // 动画循环
  useEffect(() => {
    const animate = () => {
      render();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render]);

  // 处理鼠标移动以检测悬停
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 简单的碰撞检测
      const centerX = size / 2;
      const centerY = size / 2;

      for (let i = sortedLayers.length - 1; i >= 0; i--) {
        const layer = sortedLayers[i];
        const layerSizePx = (layer.itemSize / 100) * size;
        const halfSize = layerSizePx / 2;

        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= halfSize) {
          setHoveredLayer(layer.itemLayer);
          return;
        }
      }

      setHoveredLayer(null);
    },
    [sortedLayers, size]
  );

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h3>实时预览</h3>
        <div className="preview-info">
          <span>可见层: {sortedLayers.length}/20</span>
          {hoveredLayer && (
            <span className="hover-info">悬停: 层 {hoveredLayer}</span>
          )}
        </div>
      </div>
      <div className="preview-canvas-container">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="preview-canvas"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredLayer(null)}
        />
      </div>
      <div className="preview-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#ff0000' }} />
          <span>旋转中心</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#00ff00' }} />
          <span>悬停层</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 简化预览组件（用于层列表中的缩略图）
 * Simplified preview component for layer list thumbnails
 */
export const LayerThumbnail: React.FC<{
  layer: RotateItemConfig;
  size?: number;
}> = ({ layer, size = 60 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    // 绘制占位符
    const centerX = size / 2;
    const centerY = size / 2;

    // 背景
    ctx.fillStyle = layer.itemDisplay === 'yes' ? '#2a2a3e' : '#1a1a2e';
    ctx.fillRect(0, 0, size, size);

    // 层编号
    ctx.fillStyle = layer.itemDisplay === 'yes' ? '#fff' : '#666';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(layer.itemLayer), centerX, centerY - 8);

    // 状态指示
    ctx.font = '10px sans-serif';
    if (layer.handType) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillText(layer.handType, centerX, centerY + 8);
    } else if (layer.rotation1.enabled === 'yes' || layer.rotation2.enabled === 'yes') {
      ctx.fillStyle = '#2196F3';
      ctx.fillText('旋转', centerX, centerY + 8);
    } else {
      ctx.fillStyle = '#888';
      ctx.fillText('静态', centerX, centerY + 8);
    }

    // 边框
    ctx.strokeStyle = layer.itemDisplay === 'yes' ? '#4CAF50' : '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);
  }, [layer, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="layer-thumbnail"
    />
  );
};

export default PreviewPanel;
