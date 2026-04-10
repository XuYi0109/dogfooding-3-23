import React, { useEffect, useRef, useState } from 'react';
import { RotateItemConfig } from '../launcher_config';

interface LivePreviewPanelProps {
  configs: RotateItemConfig[];
}

const layerColors = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
  '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
];

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({ configs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 16);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius + 5, 0, Math.PI * 2);
    ctx.fill();

    const visibleLayers = configs
      .filter(c => c.itemDisplay === 'yes' && c.visualEffects.render === 'yes')
      .sort((a, b) => a.itemLayer - b.itemLayer);

    visibleLayers.forEach((config) => {
      ctx.save();

      const size = config.itemSize / 100;
      const radius = baseRadius * size;

      let rotationAngle = 0;

      [config.rotation1, config.rotation2].forEach((rotation) => {
        if (rotation.enabled === 'yes') {
          const direction = rotation.rotationWay === '-' ? -1 : 1;
          const speed = rotation.rotationWay === 'no' ? 0 : rotation.rotationSpeed;
          const baseAngle = (rotation.itemTiltPosition * Math.PI) / 180;
          rotationAngle += baseAngle + ((time / 1000) * speed * direction * (Math.PI / 180));
        }
      });

      const posX = centerX + (config.rotation1.itemPositionX / 100) * radius;
      const posY = centerY + (config.rotation1.itemPositionY / 100) * radius;

      ctx.translate(posX, posY);
      ctx.rotate(rotationAngle);
      ctx.translate(-posX, -posY);

      const layerColor = layerColors[(config.itemLayer - 1) % 20];

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      if (config.visualEffects.shadow === 'yes') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
      }

      if (config.visualEffects.glow === 'yes') {
        ctx.shadowColor = layerColor;
        ctx.shadowBlur = 25;
      }

      if (config.visualEffects.transparent === 'yes') {
        ctx.globalAlpha = 0.5;
      }

      if (config.visualEffects.pulse === 'yes') {
        const pulseScale = 1 + Math.sin(time / 300) * 0.05;
        ctx.translate(posX, posY);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-posX, -posY);
      }

      ctx.fillStyle = layerColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      if (config.clockHand.handType) {
        const handLength = radius * 0.8;
        const handWidth = config.clockHand.handType === 'hour' ? 8 :
                          config.clockHand.handType === 'minute' ? 5 : 2;

        ctx.beginPath();
        ctx.moveTo(posX, posY);
        ctx.lineTo(posX, posY - handLength);
        ctx.lineWidth = handWidth;
        ctx.strokeStyle = layerColor;
        ctx.lineCap = 'round';
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(posX, posY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.fillText(config.itemCode, posX, posY);
      }

      ctx.restore();
    });

    const currentTime = new Date();
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      currentTime.toLocaleTimeString('zh-CN'),
      centerX,
      canvas.height - 20
    );

  }, [configs, time]);

  const visibleCount = configs.filter(c => c.itemDisplay === 'yes').length;

  return (
    <div className="bg-gray-900 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">🔮 实时预览</h3>
        <span className="text-gray-400 text-sm">
          显示 {visibleCount} / {configs.length} 层
        </span>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-lg border border-gray-700"
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {configs.filter(c => c.itemDisplay === 'yes').slice(0, 8).map((config) => (
          <div
            key={config.itemCode}
            className="flex items-center gap-2 text-xs text-gray-300"
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: layerColors[(config.itemLayer - 1) % 20] }}
            />
            <span className="truncate">{config.itemName}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-gray-500 text-xs text-center">
        旋转动画正在运行 • Canvas 实时渲染
      </div>
    </div>
  );
};
