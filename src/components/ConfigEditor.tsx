import React, { useMemo, useState } from 'react';
import { RotateItemConfig, ValidationError } from '../launcher_config';
import { CollapsibleSection } from './CollapsibleSection';
import { LayerConfigPanel } from './LayerConfigPanel';

interface ConfigEditorProps {
  configs: RotateItemConfig[];
  onChange: (configs: RotateItemConfig[]) => void;
  errors: ValidationError[];
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ configs, onChange, errors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisplay, setFilterDisplay] = useState<'all' | 'visible' | 'hidden'>('all');

  const filteredConfigs = useMemo(() => {
    return configs
      .map((config, index) => ({ config, index }))
      .filter(({ config }) => {
        const matchesSearch = config.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              config.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterDisplay === 'all' ||
                              (filterDisplay === 'visible' && config.itemDisplay === 'yes') ||
                              (filterDisplay === 'hidden' && config.itemDisplay === 'no');
        return matchesSearch && matchesFilter;
      });
  }, [configs, searchTerm, filterDisplay]);

  const getLayerErrors = (layerIndex: number): ValidationError[] => {
    return errors.filter(e => e.layerIndex === layerIndex);
  };

  const updateLayer = (index: number, newConfig: RotateItemConfig) => {
    const newConfigs = [...configs];
    newConfigs[index] = newConfig;
    onChange(newConfigs);
  };

  const bulkToggleDisplay = (value: 'yes' | 'no') => {
    const newConfigs = configs.map((config, index) =>
      filteredConfigs.some(f => f.index === index)
        ? { ...config, itemDisplay: value }
        : config
    );
    onChange(newConfigs);
  };

  const bulkToggleRender = (value: 'yes' | 'no') => {
    const newConfigs = configs.map((config, index) =>
      filteredConfigs.some(f => f.index === index)
        ? { ...config, visualEffects: { ...config.visualEffects, render: value } }
        : config
    );
    onChange(newConfigs);
  };

  const errorCount = errors.length;

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            ⚙️ 图层配置
            {errorCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                {errorCount} 个错误
              </span>
            )}
          </h2>
        </div>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="🔍 搜索图层名称或代码..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={filterDisplay}
            onChange={(e) => setFilterDisplay(e.target.value as 'all' | 'visible' | 'hidden')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="all">全部图层</option>
            <option value="visible">仅显示</option>
            <option value="hidden">仅隐藏</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-gray-600 mr-2 self-center">批量操作:</span>
          <button
            onClick={() => bulkToggleDisplay('yes')}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
          >
            全部显示
          </button>
          <button
            onClick={() => bulkToggleDisplay('no')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            全部隐藏
          </button>
          <button
            onClick={() => bulkToggleRender('yes')}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
          >
            启用渲染
          </button>
          <button
            onClick={() => bulkToggleRender('no')}
            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors"
          >
            禁用渲染
          </button>
          <span className="text-sm text-gray-500 ml-auto self-center">
            显示 {filteredConfigs.length} / {configs.length} 个图层
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {filteredConfigs.map(({ config, index }) => {
          const layerErrors = getLayerErrors(index);
          const statusIcon = config.itemDisplay === 'yes' ? '👁️' : '👁️‍🗨️';
          
          return (
            <CollapsibleSection
              key={config.itemCode}
              title={`${statusIcon} ${config.itemName}`}
              subtitle={`Layer ${config.itemLayer} • ${config.itemCode}`}
              hasError={layerErrors.length > 0}
              defaultOpen={index < 3}
            >
              {layerErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium mb-2">⚠️ 验证错误:</p>
                  <ul className="text-red-600 text-xs space-y-1">
                    {layerErrors.map((error, i) => (
                      <li key={i}>• {error.field}: {error.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              <LayerConfigPanel
                config={config}
                onChange={(newConfig) => updateLayer(index, newConfig)}
                errors={layerErrors}
              />
            </CollapsibleSection>
          );
        })}

        {filteredConfigs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            没有找到匹配的图层
          </div>
        )}
      </div>
    </div>
  );
};
