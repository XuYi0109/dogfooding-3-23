/**
 * 主配置编辑器组件
 * Main Configuration Editor Component
 *
 * 整合所有子组件，提供完整的配置编辑界面
 * Integrates all sub-components to provide a complete configuration editing interface
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { LauncherConfig, RotateItemConfig, ValidationError } from './types';
import { LayerConfig } from './LayerConfig';
import { PreviewPanel } from './PreviewPanel';
import { validateConfig } from './validation';
import { defaultLauncherConfig } from './launcher_config';

/**
 * 搜索过滤器类型
 * Search filter type
 */
interface SearchFilters {
  text: string;
  showVisibleOnly: boolean;
  showWithErrorsOnly: boolean;
  handType: string | null;
}

/**
 * 批量操作类型
 * Bulk operation type
 */
type BulkOperation =
  | { type: 'setDisplay'; value: 'yes' | 'no' }
  | { type: 'setRender'; value: 'yes' | 'no' }
  | { type: 'clearEffects' }
  | { type: 'resetRotation' };

/**
 * 配置编辑器组件
 * Configuration editor component
 */
export const ConfigEditor: React.FC = () => {
  // 状态管理
  const [config, setConfig] = useState<LauncherConfig>(defaultLauncherConfig);
  const [expandedLayers, setExpandedLayers] = useState<Set<number>>(new Set());
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    text: '',
    showVisibleOnly: false,
    showWithErrorsOnly: false,
    handType: null,
  });
  const [selectedLayers, setSelectedLayers] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 验证配置
  useEffect(() => {
    const result = validateConfig(config);
    setValidationErrors(result.errors);
  }, [config]);

  // 切换层展开状态
  const toggleLayer = useCallback((index: number) => {
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

  // 展开所有层
  const expandAll = useCallback(() => {
    setExpandedLayers(new Set(config.rotateConfig.map((_, i) => i)));
  }, [config.rotateConfig]);

  // 折叠所有层
  const collapseAll = useCallback(() => {
    setExpandedLayers(new Set());
  }, []);

  // 更新层配置
  const updateLayer = useCallback((index: number, updatedLayer: RotateItemConfig) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      newConfig.rotateConfig = [...prev.rotateConfig];
      newConfig.rotateConfig[index] = updatedLayer;
      return newConfig;
    });
    setIsDirty(true);
  }, []);

  // 获取层的验证错误
  const getLayerErrors = useCallback(
    (index: number) => {
      return validationErrors.filter((e) => e.layerIndex === index);
    },
    [validationErrors]
  );

  // 过滤层
  const filteredLayers = useMemo(() => {
    return config.rotateConfig
      .map((layer, index) => ({ layer, index }))
      .filter(({ layer, index }) => {
        // 文本搜索
        if (searchFilters.text) {
          const searchLower = searchFilters.text.toLowerCase();
          const matchesText =
            layer.itemName.toLowerCase().includes(searchLower) ||
            layer.itemCode.toLowerCase().includes(searchLower) ||
            layer.itemPath.toLowerCase().includes(searchLower);
          if (!matchesText) return false;
        }

        // 仅显示可见
        if (searchFilters.showVisibleOnly && layer.itemDisplay !== 'yes') {
          return false;
        }

        // 仅显示有错误的
        if (searchFilters.showWithErrorsOnly) {
          const errors = getLayerErrors(index);
          if (errors.length === 0) return false;
        }

        // 指针类型过滤
        if (searchFilters.handType && layer.handType !== searchFilters.handType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.layer.itemLayer - b.layer.itemLayer);
  }, [config.rotateConfig, searchFilters, getLayerErrors]);

  // 批量选择
  const toggleLayerSelection = useCallback((index: number) => {
    setSelectedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedLayers.size === filteredLayers.length) {
      setSelectedLayers(new Set());
    } else {
      setSelectedLayers(new Set(filteredLayers.map(({ index }) => index)));
    }
  }, [filteredLayers, selectedLayers.size]);

  // 执行批量操作
  const executeBulkOperation = useCallback((operation: BulkOperation) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      newConfig.rotateConfig = prev.rotateConfig.map((layer, index) => {
        if (!selectedLayers.has(index)) return layer;

        const newLayer = { ...layer };

        switch (operation.type) {
          case 'setDisplay':
            newLayer.itemDisplay = operation.value;
            break;
          case 'setRender':
            newLayer.visualEffects = {
              ...layer.visualEffects,
              render: operation.value,
            };
            break;
          case 'clearEffects':
            newLayer.visualEffects = {
              ...layer.visualEffects,
              shadow: 'no',
              glow: 'no',
              pulse: 'no',
              transparent: 'no',
            };
            break;
          case 'resetRotation':
            newLayer.rotation1 = {
              ...layer.rotation1,
              enabled: 'no',
            };
            newLayer.rotation2 = {
              ...layer.rotation2,
              enabled: 'no',
            };
            break;
        }

        return newLayer;
      });
      return newConfig;
    });
    setIsDirty(true);
    setShowBulkActions(false);
  }, [selectedLayers]);

  // 导出配置
  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'launcher_config.json';
    link.click();
    URL.revokeObjectURL(url);
    setIsDirty(false);
  }, [config]);

  // 导入配置
  const importConfig = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as LauncherConfig;
        setConfig(imported);
        setIsDirty(true);
      } catch (err) {
        alert('配置文件格式错误');
      }
    };
    reader.readAsText(file);
  }, []);

  // 错误统计
  const errorStats = useMemo(() => {
    const errors = validationErrors.filter((e) => e.type === 'error').length;
    const warnings = validationErrors.filter((e) => e.type === 'warning').length;
    return { errors, warnings };
  }, [validationErrors]);

  return (
    <div className="config-editor">
      {/* 头部工具栏 */}
      <header className="editor-header">
        <h1>旋转时钟配置编辑器</h1>
        <div className="header-actions">
          <div className="validation-status">
            {errorStats.errors > 0 && (
              <span className="status-badge error">
                {errorStats.errors} 错误
              </span>
            )}
            {errorStats.warnings > 0 && (
              <span className="status-badge warning">
                {errorStats.warnings} 警告
              </span>
            )}
            {errorStats.errors === 0 && errorStats.warnings === 0 && (
              <span className="status-badge valid">✓ 有效</span>
            )}
            {isDirty && <span className="status-badge dirty">已修改</span>}
          </div>
          <label className="btn btn-secondary">
            导入
            <input
              type="file"
              accept=".json"
              hidden
              onChange={(e) => e.target.files?.[0] && importConfig(e.target.files[0])}
            />
          </label>
          <button className="btn btn-primary" onClick={exportConfig}>
            导出配置
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="editor-content">
        {/* 左侧配置面板 */}
        <div className="config-panel">
          {/* 搜索和过滤 */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="搜索层..."
              value={searchFilters.text}
              onChange={(e) =>
                setSearchFilters((prev) => ({ ...prev, text: e.target.value }))
              }
              className="search-input"
            />
            <div className="filter-toggles">
              <label className="filter-toggle">
                <input
                  type="checkbox"
                  checked={searchFilters.showVisibleOnly}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      showVisibleOnly: e.target.checked,
                    }))
                  }
                />
                仅可见
              </label>
              <label className="filter-toggle">
                <input
                  type="checkbox"
                  checked={searchFilters.showWithErrorsOnly}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      showWithErrorsOnly: e.target.checked,
                    }))
                  }
                />
                仅错误
              </label>
            </div>
            <select
              value={searchFilters.handType ?? ''}
              onChange={(e) =>
                setSearchFilters((prev) => ({
                  ...prev,
                  handType: e.target.value || null,
                }))
              }
              className="filter-select"
            >
              <option value="">所有类型</option>
              <option value="hour">时针</option>
              <option value="minute">分针</option>
              <option value="second">秒针</option>
            </select>
          </div>

          {/* 层控制工具栏 */}
          <div className="layers-toolbar">
            <div className="expand-controls">
              <button className="btn btn-small" onClick={expandAll}>
                展开全部
              </button>
              <button className="btn btn-small" onClick={collapseAll}>
                折叠全部
              </button>
            </div>
            <div className="selection-controls">
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={
                    selectedLayers.size === filteredLayers.length &&
                    filteredLayers.length > 0
                  }
                  onChange={toggleSelectAll}
                />
                全选
              </label>
              {selectedLayers.size > 0 && (
                <div className="bulk-actions">
                  <button
                    className="btn btn-small"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                  >
                    批量操作 ({selectedLayers.size})
                  </button>
                  {showBulkActions && (
                    <div className="bulk-menu">
                      <button
                        onClick={() =>
                          executeBulkOperation({ type: 'setDisplay', value: 'yes' })
                        }
                      >
                        显示选中层
                      </button>
                      <button
                        onClick={() =>
                          executeBulkOperation({ type: 'setDisplay', value: 'no' })
                        }
                      >
                        隐藏选中层
                      </button>
                      <button
                        onClick={() =>
                          executeBulkOperation({ type: 'setRender', value: 'yes' })
                        }
                      >
                        启用渲染
                      </button>
                      <button
                        onClick={() =>
                          executeBulkOperation({ type: 'clearEffects' })
                        }
                      >
                        清除效果
                      </button>
                      <button
                        onClick={() =>
                          executeBulkOperation({ type: 'resetRotation' })
                        }
                      >
                        重置旋转
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 层列表 */}
          <div className="layers-list">
            {filteredLayers.map(({ layer, index }) => (
              <div key={index} className="layer-item">
                <label className="layer-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedLayers.has(index)}
                    onChange={() => toggleLayerSelection(index)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
                <LayerConfig
                  layer={layer}
                  index={index}
                  isExpanded={expandedLayers.has(index)}
                  onToggle={() => toggleLayer(index)}
                  onChange={(updated) => updateLayer(index, updated)}
                  allLayers={config.rotateConfig}
                  errors={getLayerErrors(index)}
                />
              </div>
            ))}
            {filteredLayers.length === 0 && (
              <div className="no-results">没有找到匹配的层</div>
            )}
          </div>
        </div>

        {/* 右侧预览面板 */}
        <div className="preview-container">
          <PreviewPanel config={config} size={400} />
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor;
