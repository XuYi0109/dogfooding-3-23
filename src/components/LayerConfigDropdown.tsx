import React, { memo } from 'react';
import {
  RotateItemConfig,
  ValidationError,
  YesNoValue,
  HandType,
  HandRotation,
  RotationWay,
} from '../types/config';
import {
  ConfigRow,
  ConfigSection,
  TextInput,
  NumberInput,
  SliderInput,
  SelectInput,
  YesNoToggle,
  handTypeOptions,
  handRotationOptions,
  rotationWayOptions,
} from './UIControls';
import { getFieldErrors } from '../utils/validator';

interface LayerConfigDropdownProps {
  layer: RotateItemConfig;
  index: number;
  isExpanded: boolean;
  errors: ValidationError[];
  onToggle: () => void;
  onUpdate: (index: number, updates: Partial<RotateItemConfig>) => void;
}

const LayerConfigDropdown: React.FC<LayerConfigDropdownProps> = memo(
  ({ layer, index, isExpanded, errors, onToggle, onUpdate }) => {
    const hasError = errors.some((e) => e.layerIndex === index);

    const updateField = <K extends keyof RotateItemConfig>(
      field: K,
      value: RotateItemConfig[K]
    ) => {
      onUpdate(index, { [field]: value });
    };

    const updateTimezone = (
      field: keyof RotateItemConfig['timezone'],
      value: string | number
    ) => {
      onUpdate(index, {
        timezone: { ...layer.timezone, [field]: value },
      });
    };

    const updateVisualEffect = (
      field: keyof RotateItemConfig['visualEffects'],
      value: YesNoValue
    ) => {
      onUpdate(index, {
        visualEffects: { ...layer.visualEffects, [field]: value },
      });
    };

    const updateRotation = (
      rotationKey: 'rotation1' | 'rotation2',
      field: keyof RotateItemConfig['rotation1'],
      value: string | number | null
    ) => {
      onUpdate(index, {
        [rotationKey]: { ...layer[rotationKey], [field]: value },
      });
    };

    const getFieldError = (field: string): string => {
      const fieldErrors = getFieldErrors(errors, index, field);
      return fieldErrors.length > 0 ? fieldErrors[0] : '';
    };

    return (
      <div className={`layer-dropdown ${hasError ? 'error' : ''}`}>
        <div className="dropdown-header" onClick={onToggle}>
          <div className="dropdown-header-left">
            <span className="layer-number">{layer.itemLayer}</span>
            <div>
              <div className="layer-name">{layer.itemName}</div>
              <div className="layer-code">{layer.itemCode}</div>
            </div>
          </div>
          <span className={`dropdown-toggle ${isExpanded ? 'open' : ''}`}>
            ▼
          </span>
        </div>

        {isExpanded && (
          <div className="dropdown-content">
            <ConfigSection title="基本属性" icon="⚙️">
              <ConfigRow
                label="itemCode"
                tooltip="唯一标识符，不可重复"
                error={getFieldError('itemCode')}
              >
                <TextInput
                  value={layer.itemCode}
                  onChange={(v) => updateField('itemCode', v)}
                  error={!!getFieldError('itemCode')}
                />
              </ConfigRow>

              <ConfigRow label="itemName" tooltip="图层名称">
                <TextInput
                  value={layer.itemName}
                  onChange={(v) => updateField('itemName', v)}
                  error={!!getFieldError('itemName')}
                />
              </ConfigRow>

              <ConfigRow label="itemPath" tooltip="图像资源路径">
                <TextInput
                  value={layer.itemPath}
                  onChange={(v) => updateField('itemPath', v)}
                />
              </ConfigRow>

              <ConfigRow
                label="itemLayer"
                tooltip="图层顺序 (1-20)"
                error={getFieldError('itemLayer')}
              >
                <NumberInput
                  value={layer.itemLayer}
                  onChange={(v) => updateField('itemLayer', v)}
                  min={1}
                  max={20}
                  error={!!getFieldError('itemLayer')}
                />
              </ConfigRow>

              <ConfigRow
                label="itemSize"
                tooltip="图层大小 (1-100%)"
                error={getFieldError('itemSize')}
              >
                <SliderInput
                  value={layer.itemSize}
                  onChange={(v) => updateField('itemSize', v)}
                  min={1}
                  max={100}
                  unit="%"
                />
              </ConfigRow>

              <ConfigRow label="itemDisplay" tooltip="是否显示此图层">
                <YesNoToggle
                  value={layer.itemDisplay}
                  onChange={(v) => updateField('itemDisplay', v)}
                />
              </ConfigRow>
            </ConfigSection>

            <ConfigSection title="时钟指针配置" icon="🕐">
              <ConfigRow label="handType" tooltip="指针类型">
                <SelectInput
                  value={layer.handType}
                  onChange={(v) =>
                    updateField('handType', v as HandType | null)
                  }
                  options={handTypeOptions}
                  placeholder="无"
                />
              </ConfigRow>

              <ConfigRow label="handRotation" tooltip="使用的旋转配置">
                <SelectInput
                  value={layer.handRotation}
                  onChange={(v) =>
                    updateField('handRotation', v as HandRotation | null)
                  }
                  options={handRotationOptions}
                  placeholder="无"
                />
              </ConfigRow>
            </ConfigSection>

            <ConfigSection title="时区配置" icon="🌍">
              <ConfigRow label="enabled" tooltip="是否启用时区设置">
                <YesNoToggle
                  value={layer.timezone.enabled}
                  onChange={(v) => updateTimezone('enabled', v)}
                />
              </ConfigRow>

              {layer.timezone.enabled === 'yes' && (
                <>
                  <ConfigRow
                    label="utcOffset"
                    tooltip="UTC偏移量 (-12 到 +12)"
                    error={getFieldError('timezone.utcOffset')}
                  >
                    <NumberInput
                      value={layer.timezone.utcOffset}
                      onChange={(v) => updateTimezone('utcOffset', v)}
                      min={-12}
                      max={12}
                      step={0.5}
                    />
                  </ConfigRow>

                  <ConfigRow label="use24Hour" tooltip="使用24小时制">
                    <YesNoToggle
                      value={layer.timezone.use24Hour}
                      onChange={(v) => updateTimezone('use24Hour', v)}
                    />
                  </ConfigRow>
                </>
              )}
            </ConfigSection>

            <ConfigSection title="视觉效果" icon="✨">
              <ConfigRow label="shadow" tooltip="是否显示阴影">
                <YesNoToggle
                  value={layer.visualEffects.shadow}
                  onChange={(v) => updateVisualEffect('shadow', v)}
                />
              </ConfigRow>

              <ConfigRow label="glow" tooltip="是否显示发光效果">
                <YesNoToggle
                  value={layer.visualEffects.glow}
                  onChange={(v) => updateVisualEffect('glow', v)}
                />
              </ConfigRow>

              <ConfigRow label="transparent" tooltip="是否透明">
                <YesNoToggle
                  value={layer.visualEffects.transparent}
                  onChange={(v) => updateVisualEffect('transparent', v)}
                />
              </ConfigRow>

              <ConfigRow label="pulse" tooltip="是否启用脉冲效果">
                <YesNoToggle
                  value={layer.visualEffects.pulse}
                  onChange={(v) => updateVisualEffect('pulse', v)}
                />
              </ConfigRow>

              <ConfigRow label="render" tooltip="是否渲染">
                <YesNoToggle
                  value={layer.visualEffects.render}
                  onChange={(v) => updateVisualEffect('render', v)}
                />
              </ConfigRow>
            </ConfigSection>

            <ConfigSection title="旋转配置 1" icon="🔄">
              <div className="rotation-config">
                <ConfigRow label="enabled" tooltip="是否启用旋转1">
                  <YesNoToggle
                    value={layer.rotation1.enabled}
                    onChange={(v) =>
                      updateRotation('rotation1', 'enabled', v)
                    }
                    allowNull
                  />
                </ConfigRow>

                {layer.rotation1.enabled === 'yes' && (
                  <>
                    <ConfigRow
                      label="itemTiltPosition"
                      tooltip="倾斜角度 (0-359°)"
                      error={getFieldError('rotation1.itemTiltPosition')}
                    >
                      <SliderInput
                        value={layer.rotation1.itemTiltPosition}
                        onChange={(v) =>
                          updateRotation('rotation1', 'itemTiltPosition', v)
                        }
                        min={0}
                        max={359}
                        unit="°"
                      />
                    </ConfigRow>

                    <ConfigRow
                      label="itemAxisX"
                      tooltip="旋转轴心X位置 (0-100%)"
                      error={getFieldError('rotation1.itemAxisX')}
                    >
                      <SliderInput
                        value={layer.rotation1.itemAxisX}
                        onChange={(v) =>
                          updateRotation('rotation1', 'itemAxisX', v)
                        }
                        min={0}
                        max={100}
                        unit="%"
                      />
                    </ConfigRow>

                    <ConfigRow
                      label="itemAxisY"
                      tooltip="旋转轴心Y位置 (0-100%)"
                      error={getFieldError('rotation1.itemAxisY')}
                    >
                      <SliderInput
                        value={layer.rotation1.itemAxisY}
                        onChange={(v) =>
                          updateRotation('rotation1', 'itemAxisY', v)
                        }
                        min={0}
                        max={100}
                        unit="%"
                      />
                    </ConfigRow>

                    <ConfigRow
                      label="itemPositionX"
                      tooltip="X位置偏移 (-100 到 +100%)"
                      error={getFieldError('rotation1.itemPositionX')}
                    >
                      <NumberInput
                        value={layer.rotation1.itemPositionX}
                        onChange={(v) =>
                          updateRotation('rotation1', 'itemPositionX', v)
                        }
                        min={-100}
                        max={100}
                      />
                    </ConfigRow>

                    <ConfigRow
                      label="itemPositionY"
                      tooltip="Y位置偏移 (-100 到 +100%)"
                      error={getFieldError('rotation1.itemPositionY')}
                    >
                      <NumberInput
                        value={layer.rotation1.itemPositionY}
                        onChange={(v) =>
                          updateRotation('rotation1', 'itemPositionY', v)
                        }
                        min={-100}
                        max={100}
                      />
                    </ConfigRow>

                    <ConfigRow
                      label="rotationSpeed"
                      tooltip="旋转速度 (必须大于0)"
                      error={getFieldError('rotation1.rotationSpeed')}
                    >
                      <NumberInput
                        value={layer.rotation1.rotationSpeed}
                        onChange={(v) =>
                          updateRotation('rotation1', 'rotationSpeed', v)
                        }
                        min={0.1}
                        step={0.1}
                      />
                    </ConfigRow>

                    <ConfigRow label="rotationWay" tooltip="旋转方向">
                      <SelectInput
                        value={layer.rotation1.rotationWay}
                        onChange={(v) =>
                          updateRotation(
                            'rotation1',
                            'rotationWay',
                            v as RotationWay
                          )
                        }
                        options={rotationWayOptions}
                        placeholder="选择方向"
                      />
                    </ConfigRow>
                  </>
                )}
              </div>
            </ConfigSection>

            <ConfigSection title="旋转配置 2" icon="🔃">
              <div className="rotation-config">
                <ConfigRow label="enabled" tooltip="是否启用旋转2">
                  <YesNoToggle
                    value={layer.rotation2.enabled}
                    onChange={(v) =>
                      updateRotation('rotation2', 'enabled', v)
                    }
                    allowNull
                  />
                </ConfigRow>

                {layer.rotation2.enabled === 'yes' && (
                  <>
                    <ConfigRow
                      label="itemTiltPosition"
                      tooltip="倾斜角度 (0-359°)"
                      error={getFieldError('rotation2.itemTiltPosition')}
                    >
                      <SliderInput
                        value={layer.rotation2.itemTiltPosition}
                        onChange={(v) =>
                          updateRotation('rotation2', 'itemTiltPosition', v)
                        }
                        min={0}
                        max={359}
                        unit="°"
                      />
                    </ConfigRow>

                    <ConfigRow
                      label="itemAxisX"
                      tooltip="旋转轴心X位置 (0-100%)"
                      error={getFieldError('rotation2.itemAxisX')}
                    >
                      <SliderInput
                        value={layer.rotation2.itemAxisX}
                        onChange={(v) =>
                          updateRotation('rotation2', 'itemAxisX', v)
                        }
                        min={0}
                        max={100}
                        unit="%"
                      />
                    </ConfigRow>

                    <ConfigRow
                      label="itemAxisY"
                      tooltip="旋转轴心Y位置 (0-100%)"
                      error={getFieldError('rotation2.itemAxisY')}
                    >
                      <SliderInput
                        value={layer.rotation2.itemAxisY}
                        onChange={(v) =>
                          updateRotation('rotation2', 'itemAxisY', v)
                        }
                        min={0}
                        max={100}
                        unit="%"
                      />
                    </ConfigRow>

                    <ConfigRow
                      label="itemPositionX"
                      tooltip="X位置偏移 (-100 到 +100%)"
                      error={getFieldError('rotation2.itemPositionX')}
                    >
                      <NumberInput
                        value={layer.rotation2.itemPositionX}
                        onChange={(v) =>
                          updateRotation('rotation2', 'itemPositionX', v)
                        }
                        min={-100}
                        max={100}
                      />
                    </ConfigRow>

                    <ConfigRow
                      label="itemPositionY"
                      tooltip="Y位置偏移 (-100 到 +100%)"
                      error={getFieldError('rotation2.itemPositionY')}
                    >
                      <NumberInput
                        value={layer.rotation2.itemPositionY}
                        onChange={(v) =>
                          updateRotation('rotation2', 'itemPositionY', v)
                        }
                        min={-100}
                        max={100}
                      />
                    </ConfigRow>

                    <ConfigRow
                      label="rotationSpeed"
                      tooltip="旋转速度 (必须大于0)"
                      error={getFieldError('rotation2.rotationSpeed')}
                    >
                      <NumberInput
                        value={layer.rotation2.rotationSpeed}
                        onChange={(v) =>
                          updateRotation('rotation2', 'rotationSpeed', v)
                        }
                        min={0.1}
                        step={0.1}
                      />
                    </ConfigRow>

                    <ConfigRow label="rotationWay" tooltip="旋转方向">
                      <SelectInput
                        value={layer.rotation2.rotationWay}
                        onChange={(v) =>
                          updateRotation(
                            'rotation2',
                            'rotationWay',
                            v as RotationWay
                          )
                        }
                        options={rotationWayOptions}
                        placeholder="选择方向"
                      />
                    </ConfigRow>
                  </>
                )}
              </div>
            </ConfigSection>
          </div>
        )}
      </div>
    );
  }
);

LayerConfigDropdown.displayName = 'LayerConfigDropdown';

export default LayerConfigDropdown;
