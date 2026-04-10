/**
 * 层配置组件
 * Layer Configuration Component
 *
 * 可折叠的下拉面板，用于编辑单个层的所有配置属性
 * Collapsible dropdown panel for editing all configuration properties of a single layer
 */

import React, { useState, useCallback, useMemo } from 'react';
import type {
  RotateItemConfig,
  ValidationError,
  HandType,
  HandRotation,
  DisplayToggle,
  EnabledToggle,
  RotationWay,
} from './types';
import { FIELD_METADATA, validateField, CONSTRAINTS } from './validation';

/**
 * 组件属性接口
 * Component props interface
 */
interface LayerConfigProps {
  /** 层配置数据 */
  layer: RotateItemConfig;
  /** 层索引 */
  index: number;
  /** 是否展开 */
  isExpanded: boolean;
  /** 展开/折叠切换回调 */
  onToggle: () => void;
  /** 配置变更回调 */
  onChange: (updatedLayer: RotateItemConfig) => void;
  /** 所有层配置（用于验证） */
  allLayers: RotateItemConfig[];
  /** 当前层的验证错误 */
  errors: ValidationError[];
}

/**
 * 工具提示组件
 * Tooltip component
 */
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({
  content,
  children,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && <div className="tooltip-content">{content}</div>}
    </div>
  );
};

/**
 * 表单字段包装组件
 * Form field wrapper component
 */
const FormField: React.FC<{
  field: string;
  error?: ValidationError;
  children: React.ReactNode;
}> = ({ field, error, children }) => {
  const metadata = FIELD_METADATA[field];

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label className="form-label">
        <Tooltip content={metadata?.description || ''}>
          <span>{metadata?.label || field}</span>
        </Tooltip>
      </label>
      {children}
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );
};

/**
 * 文本输入组件
 * Text input component
 */
const TextInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ value, onChange, placeholder, disabled }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    className="text-input"
  />
);

/**
 * 数字输入组件
 * Number input component
 */
const NumberInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}> = ({ value, onChange, min, max, step = 1, disabled }) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    min={min}
    max={max}
    step={step}
    disabled={disabled}
    className="number-input"
  />
);

/**
 * 滑块组件
 * Slider component
 */
const Slider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
}> = ({ value, onChange, min, max, step = 1, disabled }) => (
  <div className="slider-container">
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className="slider-input"
    />
    <span className="slider-value">{value}</span>
  </div>
);

/**
 * 下拉选择组件
 * Select component
 */
const Select: React.FC<{
  value: string | null;
  onChange: (value: string | null) => void;
  options: { value: string | null; label: string }[];
  disabled?: boolean;
}> = ({ value, onChange, options, disabled }) => (
  <select
    value={value ?? ''}
    onChange={(e) => {
      const val = e.target.value;
      onChange(val === '' ? null : val);
    }}
    disabled={disabled}
    className="select-input"
  >
    {options.map((opt) => (
      <option key={opt.label} value={opt.value ?? ''}>
        {opt.label}
      </option>
    ))}
  </select>
);

/**
 * 切换按钮组件
 * Toggle component
 */
const Toggle: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}> = ({ value, onChange, options, disabled }) => (
  <div className="toggle-group">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        className={`toggle-btn ${value === opt.value ? 'active' : ''}`}
        onClick={() => onChange(opt.value)}
        disabled={disabled}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

/**
 * 层配置组件
 * Layer configuration component
 */
export const LayerConfig: React.FC<LayerConfigProps> = ({
  layer,
  index,
  isExpanded,
  onToggle,
  onChange,
  allLayers,
  errors,
}) => {
  const [localErrors, setLocalErrors] = useState<ValidationError[]>([]);

  // 合并服务器端和本地验证错误
  const allErrors = useMemo(() => [...errors, ...localErrors], [errors, localErrors]);

  // 获取字段错误
  const getFieldError = useCallback(
    (field: string) => allErrors.find((e) => e.field === field),
    [allErrors]
  );

  // 更新层配置
  const updateLayer = useCallback(
    (path: string, value: unknown) => {
      const newLayer = { ...layer };
      const keys = path.split('.');
      let target: Record<string, unknown> = newLayer;

      for (let i = 0; i < keys.length - 1; i++) {
        target = target[keys[i]] as Record<string, unknown>;
      }
      target[keys[keys.length - 1]] = value;

      // 验证字段
      const error = validateField(newLayer, path, value, allLayers, index);
      setLocalErrors((prev) => {
        const filtered = prev.filter((e) => e.field !== path);
        return error ? [...filtered, error] : filtered;
      });

      onChange(newLayer as RotateItemConfig);
    },
    [layer, allLayers, index, onChange]
  );

  // 选项定义
  const handTypeOptions = [
    { value: null, label: '无' },
    { value: 'hour', label: '时针' },
    { value: 'minute', label: '分针' },
    { value: 'second', label: '秒针' },
  ];

  const handRotationOptions = [
    { value: null, label: '无' },
    { value: 'ROTATION1', label: '旋转1' },
    { value: 'ROTATION2', label: '旋转2' },
  ];

  const displayOptions = [
    { value: 'yes', label: '显示' },
    { value: 'no', label: '隐藏' },
    { value: '', label: '默认' },
  ];

  const enabledOptions = [
    { value: 'yes', label: '启用' },
    { value: 'no', label: '禁用' },
  ];

  const rotationEnabledOptions = [
    { value: null, label: '默认' },
    { value: 'yes', label: '启用' },
    { value: 'no', label: '禁用' },
  ];

  const rotationWayOptions = [
    { value: null, label: '无' },
    { value: '+', label: '顺时针' },
    { value: '-', label: '逆时针' },
    { value: 'no', label: '不旋转' },
    { value: '', label: '默认' },
  ];

  // 渲染旋转配置部分
  const renderRotationConfig = (prefix: 'rotation1' | 'rotation2') => {
    const config = layer[prefix];
    const isEnabled = config.enabled === 'yes';

    return (
      <div className={`rotation-config ${isEnabled ? 'enabled' : 'disabled'}`}>
        <FormField
          field={`${prefix}.enabled`}
          error={getFieldError(`${prefix}.enabled`)}
        >
          <Select
            value={config.enabled}
            onChange={(v) => updateLayer(`${prefix}.enabled`, v)}
            options={rotationEnabledOptions}
          />
        </FormField>

        {isEnabled && (
          <>
            <FormField
              field={`${prefix}.itemTiltPosition`}
              error={getFieldError(`${prefix}.itemTiltPosition`)}
            >
              <Slider
                value={config.itemTiltPosition}
                onChange={(v) => updateLayer(`${prefix}.itemTiltPosition`, v)}
                min={CONSTRAINTS.TILT_POSITION.min}
                max={CONSTRAINTS.TILT_POSITION.max}
              />
            </FormField>

            <div className="form-row">
              <FormField
                field={`${prefix}.itemAxisX`}
                error={getFieldError(`${prefix}.itemAxisX`)}
              >
                <Slider
                  value={config.itemAxisX}
                  onChange={(v) => updateLayer(`${prefix}.itemAxisX`, v)}
                  min={CONSTRAINTS.AXIS_POSITION.min}
                  max={CONSTRAINTS.AXIS_POSITION.max}
                />
              </FormField>
              <FormField
                field={`${prefix}.itemAxisY`}
                error={getFieldError(`${prefix}.itemAxisY`)}
              >
                <Slider
                  value={config.itemAxisY}
                  onChange={(v) => updateLayer(`${prefix}.itemAxisY`, v)}
                  min={CONSTRAINTS.AXIS_POSITION.min}
                  max={CONSTRAINTS.AXIS_POSITION.max}
                />
              </FormField>
            </div>

            <div className="form-row">
              <FormField
                field={`${prefix}.itemPositionX`}
                error={getFieldError(`${prefix}.itemPositionX`)}
              >
                <Slider
                  value={config.itemPositionX}
                  onChange={(v) => updateLayer(`${prefix}.itemPositionX`, v)}
                  min={CONSTRAINTS.POSITION_OFFSET.min}
                  max={CONSTRAINTS.POSITION_OFFSET.max}
                />
              </FormField>
              <FormField
                field={`${prefix}.itemPositionY`}
                error={getFieldError(`${prefix}.itemPositionY`)}
              >
                <Slider
                  value={config.itemPositionY}
                  onChange={(v) => updateLayer(`${prefix}.itemPositionY`, v)}
                  min={CONSTRAINTS.POSITION_OFFSET.min}
                  max={CONSTRAINTS.POSITION_OFFSET.max}
                />
              </FormField>
            </div>

            <FormField
              field={`${prefix}.rotationSpeed`}
              error={getFieldError(`${prefix}.rotationSpeed`)}
            >
              <NumberInput
                value={config.rotationSpeed}
                onChange={(v) => updateLayer(`${prefix}.rotationSpeed`, v)}
                min={0.001}
                step={0.1}
              />
            </FormField>

            <FormField
              field={`${prefix}.rotationWay`}
              error={getFieldError(`${prefix}.rotationWay`)}
            >
              <Select
                value={config.rotationWay}
                onChange={(v) => updateLayer(`${prefix}.rotationWay`, v as RotationWay)}
                options={rotationWayOptions}
              />
            </FormField>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`layer-config ${isExpanded ? 'expanded' : ''}`}>
      <div className="layer-header" onClick={onToggle}>
        <div className="layer-info">
          <span className="layer-number">#{layer.itemLayer}</span>
          <span className="layer-name">{layer.itemName}</span>
          <span className="layer-code">({layer.itemCode})</span>
        </div>
        <div className="layer-status">
          {layer.itemDisplay === 'yes' && (
            <span className="status-badge visible">可见</span>
          )}
          {layer.handType && (
            <span className="status-badge hand">{layer.handType}</span>
          )}
          {errors.length > 0 && (
            <span className="status-badge error">{errors.length} 错误</span>
          )}
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </div>
      </div>

      {isExpanded && (
        <div className="layer-content">
          {/* 基本属性 */}
          <section className="config-section">
            <h4>基本属性</h4>
            <FormField field="itemCode" error={getFieldError('itemCode')}>
              <TextInput
                value={layer.itemCode}
                onChange={(v) => updateLayer('itemCode', v)}
              />
            </FormField>

            <FormField field="itemName" error={getFieldError('itemName')}>
              <TextInput
                value={layer.itemName}
                onChange={(v) => updateLayer('itemName', v)}
              />
            </FormField>

            <FormField field="itemPath" error={getFieldError('itemPath')}>
              <TextInput
                value={layer.itemPath}
                onChange={(v) => updateLayer('itemPath', v)}
                placeholder="/assets/..."
              />
            </FormField>

            <div className="form-row">
              <FormField field="itemLayer" error={getFieldError('itemLayer')}>
                <NumberInput
                  value={layer.itemLayer}
                  onChange={(v) => updateLayer('itemLayer', v)}
                  min={CONSTRAINTS.ITEM_LAYER.min}
                  max={CONSTRAINTS.ITEM_LAYER.max}
                />
              </FormField>
              <FormField field="itemSize" error={getFieldError('itemSize')}>
                <Slider
                  value={layer.itemSize}
                  onChange={(v) => updateLayer('itemSize', v)}
                  min={CONSTRAINTS.ITEM_SIZE.min}
                  max={CONSTRAINTS.ITEM_SIZE.max}
                />
              </FormField>
            </div>

            <FormField field="itemDisplay" error={getFieldError('itemDisplay')}>
              <Toggle
                value={layer.itemDisplay}
                onChange={(v) => updateLayer('itemDisplay', v as DisplayToggle)}
                options={displayOptions}
              />
            </FormField>
          </section>

          {/* 时钟指针配置 */}
          <section className="config-section">
            <h4>时钟指针配置</h4>
            <FormField field="handType" error={getFieldError('handType')}>
              <Select
                value={layer.handType}
                onChange={(v) => updateLayer('handType', v as HandType)}
                options={handTypeOptions}
              />
            </FormField>
            <FormField field="handRotation" error={getFieldError('handRotation')}>
              <Select
                value={layer.handRotation}
                onChange={(v) => updateLayer('handRotation', v as HandRotation)}
                options={handRotationOptions}
              />
            </FormField>
          </section>

          {/* 时区配置 */}
          <section className="config-section">
            <h4>时区配置</h4>
            <FormField field="timezone.enabled" error={getFieldError('timezone.enabled')}>
              <Toggle
                value={layer.timezone.enabled}
                onChange={(v) =>
                  updateLayer('timezone.enabled', v as EnabledToggle)
                }
                options={enabledOptions}
              />
            </FormField>
            {layer.timezone.enabled === 'yes' && (
              <>
                <FormField
                  field="timezone.utcOffset"
                  error={getFieldError('timezone.utcOffset')}
                >
                  <NumberInput
                    value={layer.timezone.utcOffset}
                    onChange={(v) => updateLayer('timezone.utcOffset', v)}
                    min={CONSTRAINTS.UTC_OFFSET.min}
                    max={CONSTRAINTS.UTC_OFFSET.max}
                    step={0.5}
                  />
                </FormField>
                <FormField
                  field="timezone.use24Hour"
                  error={getFieldError('timezone.use24Hour')}
                >
                  <Toggle
                    value={layer.timezone.use24Hour}
                    onChange={(v) =>
                      updateLayer('timezone.use24Hour', v as EnabledToggle)
                    }
                    options={enabledOptions}
                  />
                </FormField>
              </>
            )}
          </section>

          {/* 视觉效果 */}
          <section className="config-section">
            <h4>视觉效果</h4>
            <div className="toggles-grid">
              {(
                [
                  'shadow',
                  'glow',
                  'transparent',
                  'pulse',
                  'render',
                ] as const
              ).map((effect) => (
                <FormField
                  key={effect}
                  field={`visualEffects.${effect}`}
                  error={getFieldError(`visualEffects.${effect}`)}
                >
                  <Toggle
                    value={layer.visualEffects[effect]}
                    onChange={(v) =>
                      updateLayer(`visualEffects.${effect}`, v as EnabledToggle)
                    }
                    options={enabledOptions}
                  />
                </FormField>
              ))}
            </div>
          </section>

          {/* 旋转配置1 */}
          <section className="config-section">
            <h4>旋转配置 1</h4>
            {renderRotationConfig('rotation1')}
          </section>

          {/* 旋转配置2 */}
          <section className="config-section">
            <h4>旋转配置 2</h4>
            {renderRotationConfig('rotation2')}
          </section>
        </div>
      )}
    </div>
  );
};

export default LayerConfig;
