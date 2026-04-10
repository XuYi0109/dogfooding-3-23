import React, { memo, useMemo, useEffect, useState } from 'react';
import { RotateItemConfig, LauncherConfig } from '../types/config';

interface PreviewPanelProps {
  config: LauncherConfig;
}

const PreviewPanel: React.FC<PreviewPanelProps> = memo(({ config }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const visibleLayers = useMemo(() => {
    return config.rotateConfig
      .filter((layer) => layer.itemDisplay === 'yes' && layer.visualEffects.render === 'yes')
      .sort((a, b) => a.itemLayer - b.itemLayer);
  }, [config.rotateConfig]);

  const calculateHandRotation = (layer: RotateItemConfig): number => {
    if (!layer.handType || layer.handRotation !== 'ROTATION1') return 0;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    switch (layer.handType) {
      case 'hour':
        return (hours % 12) * 30 + minutes * 0.5;
      case 'minute':
        return minutes * 6 + seconds * 0.1;
      case 'second':
        return seconds * 6;
      default:
        return 0;
    }
  };

  const getLayerStyle = (layer: RotateItemConfig): React.CSSProperties => {
    const size = (layer.itemSize / 100) * 400;
    const baseStyle: React.CSSProperties = {
      width: size,
      height: size,
      zIndex: layer.itemLayer,
    };

    const effects: React.CSSProperties = {};

    if (layer.visualEffects.shadow === 'yes') {
      effects.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    }

    if (layer.visualEffects.glow === 'yes') {
      effects.boxShadow = `0 0 20px rgba(102, 126, 234, 0.5), ${effects.boxShadow || ''}`;
    }

    if (layer.visualEffects.transparent === 'yes') {
      effects.opacity = 0.7;
    }

    if (layer.visualEffects.pulse === 'yes') {
      effects.animation = 'pulse 2s ease-in-out infinite';
    }

    if (layer.handType && layer.handRotation === 'ROTATION1') {
      const rotation = calculateHandRotation(layer);
      return {
        ...baseStyle,
        ...effects,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      };
    }

    if (layer.rotation1.enabled === 'yes') {
      const rotation = layer.rotation1.itemTiltPosition;
      const offsetX = (layer.rotation1.itemPositionX / 100) * 200;
      const offsetY = (layer.rotation1.itemPositionY / 100) * 200;
      return {
        ...baseStyle,
        ...effects,
        transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${rotation}deg)`,
      };
    }

    return {
      ...baseStyle,
      ...effects,
      transform: 'translate(-50%, -50%)',
    };
  };

  const renderClockHand = (layer: RotateItemConfig) => {
    if (!layer.handType) return null;

    const rotation = calculateHandRotation(layer);
    const handHeight = layer.handType === 'hour' ? 80 : layer.handType === 'minute' ? 120 : 140;
    const handWidth = layer.handType === 'hour' ? 6 : layer.handType === 'minute' ? 4 : 2;

    const color = layer.handType === 'hour' 
      ? 'linear-gradient(to top, #667eea, rgba(102, 126, 234, 0.7))'
      : layer.handType === 'minute'
      ? 'linear-gradient(to top, #764ba2, rgba(118, 75, 162, 0.7))'
      : 'linear-gradient(to top, #ff6b6b, rgba(255, 107, 107, 0.7))';

    return (
      <div
        key={layer.itemCode}
        className="clock-hand"
        style={{
          width: handWidth,
          height: handHeight,
          background: color,
          transform: `translateX(-50%) rotate(${rotation}deg)`,
          zIndex: layer.itemLayer,
          boxShadow: layer.visualEffects.shadow === 'yes' ? '0 2px 10px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      />
    );
  };

  const renderLayer = (layer: RotateItemConfig) => {
    if (layer.handType) {
      return renderClockHand(layer);
    }

    const style = getLayerStyle(layer);
    const isClockFace = layer.itemCode === 'CLOCK_FACE';
    const isClockFrame = layer.itemCode === 'CLOCK_FRAME';

    return (
      <div key={layer.itemCode} className="preview-layer" style={style}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isClockFace
              ? 'radial-gradient(circle, #2a2a4a 0%, #1a1a2e 100%)'
              : isClockFrame
              ? 'transparent'
              : 'rgba(255, 255, 255, 0.1)',
            border: isClockFrame ? '4px solid rgba(102, 126, 234, 0.5)' : 'none',
            position: 'relative',
          }}
        >
          {isClockFace && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '2px',
                    height: i % 3 === 0 ? '15px' : '8px',
                    background: i % 3 === 0 ? '#667eea' : 'rgba(255, 255, 255, 0.5)',
                    top: '10px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${i * 30}deg)`,
                    transformOrigin: 'center 180px',
                  }}
                />
              ))}
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={`min-${i}`}
                  style={{
                    position: 'absolute',
                    width: '1px',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    top: '15px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${i * 6}deg)`,
                    transformOrigin: 'center 175px',
                  }}
                />
              ))}
            </>
          )}
          {!isClockFace && !isClockFrame && (
            <div
              style={{
                width: '60%',
                height: '60%',
                borderRadius: '50%',
                background: 'rgba(102, 126, 234, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'center',
                padding: '10px',
              }}
            >
              {layer.itemName}
            </div>
          )}
        </div>
      </div>
    );
  };

  const stats = useMemo(() => {
    const total = config.rotateConfig.length;
    const visible = visibleLayers.length;
    const hidden = total - visible;
    const withErrors = 0;
    return { total, visible, hidden, withErrors };
  }, [config.rotateConfig, visibleLayers]);

  return (
    <div className="preview-panel">
      <h2>实时预览</h2>
      
      <div className="preview-container">
        {visibleLayers.map(renderLayer)}
        <div className="preview-center" />
      </div>

      <div className="preview-info">
        <h3>配置统计</h3>
        <p>总图层数: {stats.total}</p>
        <p>可见图层: {stats.visible}</p>
        <p>隐藏图层: {stats.hidden}</p>
        <p style={{ marginTop: '10px', color: '#667eea' }}>
          当前时间: {currentTime.toLocaleTimeString('zh-CN')}
        </p>
      </div>

      <div className="preview-info" style={{ marginTop: '10px' }}>
        <h3>图层顺序 (从底到顶)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
          {visibleLayers.map((layer) => (
            <span
              key={layer.itemCode}
              style={{
                padding: '4px 8px',
                background: 'rgba(102, 126, 234, 0.2)',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#a0a0a0',
              }}
            >
              {layer.itemLayer}: {layer.itemName}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

PreviewPanel.displayName = 'PreviewPanel';

export default PreviewPanel;
