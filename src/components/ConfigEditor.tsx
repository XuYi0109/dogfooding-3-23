import React, { useState, useCallback, useMemo } from 'react';
import { LauncherConfig, RotateItemConfig } from '../types/config';
import { defaultConfig } from '../data/initialConfig';
import { validateConfig } from '../utils/validator';
import LayerConfigDropdown from './LayerConfigDropdown';
import PreviewPanel from './PreviewPanel';

const ConfigEditor: React.FC = () => {
  const [config, setConfig] = useState<LauncherConfig>(defaultConfig);
  const [expandedLayers, setExpandedLayers] = useState<Set<number>>(new Set([0]));
  const [searchQuery, setSearchQuery] = useState('');

  const errors = useMemo(() => validateConfig(config), [config]);

  const handleToggleLayer = useCallback((index: number) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleUpdateLayer = useCallback(
    (index: number, updates: Partial<RotateItemConfig>) => {
      setConfig((prev) => ({
        ...prev,
        rotateConfig: prev.rotateConfig.map((layer, i) =>
          i === index ? { ...layer, ...updates } : layer
        ),
      }));
    },
    []
  );

  const handleExpandAll = useCallback(() => {
    setExpandedLayers(new Set(config.rotateConfig.map((_, i) => i)));
  }, [config.rotateConfig]);

  const handleCollapseAll = useCallback(() => {
    setExpandedLayers(new Set());
  }, []);

  const handleEnableAll = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      rotateConfig: prev.rotateConfig.map((layer) => ({
        ...layer,
        itemDisplay: 'yes' as const,
      })),
    }));
  }, []);

  const handleDisableAll = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      rotateConfig: prev.rotateConfig.map((layer) => ({
        ...layer,
        itemDisplay: 'no' as const,
      })),
    }));
  }, []);

  const filteredLayers = useMemo(() => {
    if (!searchQuery.trim()) {
      return config.rotateConfig;
    }
    const query = searchQuery.toLowerCase();
    return config.rotateConfig.filter(
      (layer) =>
        layer.itemName.toLowerCase().includes(query) ||
        layer.itemCode.toLowerCase().includes(query) ||
        layer.itemPath.toLowerCase().includes(query)
    );
  }, [config.rotateConfig, searchQuery]);

  const errorCount = errors.length;
  const layerWithErrorCount = new Set(errors.map((e) => e.layerIndex)).size;

  return (
    <div className="app-container">
      <div className="config-panel">
        <h1>旋转时钟配置编辑器</h1>

        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="搜索图层 (名称、代码、路径)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bulk-actions">
          <button className="bulk-btn" onClick={handleExpandAll}>
            展开全部
          </button>
          <button className="bulk-btn" onClick={handleCollapseAll}>
            折叠全部
          </button>
          <button className="bulk-btn" onClick={handleEnableAll}>
            启用全部
          </button>
          <button className="bulk-btn" onClick={handleDisableAll}>
            禁用全部
          </button>
        </div>

        {errorCount > 0 && (
          <div
            style={{
              padding: '10px 15px',
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '6px',
              marginBottom: '15px',
              color: '#ff6b6b',
              fontSize: '0.85rem',
            }}
          >
            发现 {errorCount} 个错误，涉及 {layerWithErrorCount} 个图层
          </div>
        )}

        <div style={{ marginBottom: '10px', color: '#888', fontSize: '0.85rem' }}>
          显示 {filteredLayers.length} / {config.rotateConfig.length} 个图层
        </div>

        <div>
          {filteredLayers.map((layer) => {
            const originalIndex = config.rotateConfig.findIndex(
              (l) => l.itemCode === layer.itemCode
            );
            return (
              <LayerConfigDropdown
                key={layer.itemCode}
                layer={layer}
                index={originalIndex}
                isExpanded={expandedLayers.has(originalIndex)}
                errors={errors}
                onToggle={() => handleToggleLayer(originalIndex)}
                onUpdate={handleUpdateLayer}
              />
            );
          })}
        </div>
      </div>

      <PreviewPanel config={config} />
    </div>
  );
};

export default ConfigEditor;
