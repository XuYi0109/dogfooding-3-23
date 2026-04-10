import React from 'react';
import { RotateItemConfig, YesNo, YesNoNull, HandType, RotationType, RotationWay, RotationConfig } from '../launcher_config';
import { FormField, Input, Slider, Select, Toggle, ToggleNullable } from './FormControls';
import { SectionGroup } from './CollapsibleSection';
import { ValidationError } from '../launcher_config';

interface LayerConfigPanelProps {
  config: RotateItemConfig;
  onChange: (config: RotateItemConfig) => void;
  errors: ValidationError[];
}

const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  return errors.find(e => e.field === field)?.message;
};

export const LayerConfigPanel: React.FC<LayerConfigPanelProps> = ({ config, onChange, errors }) => {
  const update = <K extends keyof RotateItemConfig>(key: K, value: RotateItemConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const updateClockHand = <K extends keyof RotateItemConfig['clockHand']>(
    key: K,
    value: RotateItemConfig['clockHand'][K]
  ) => {
    onChange({ ...config, clockHand: { ...config.clockHand, [key]: value } });
  };

  const updateTimezone = <K extends keyof RotateItemConfig['timezone']>(
    key: K,
    value: RotateItemConfig['timezone'][K]
  ) => {
    onChange({ ...config, timezone: { ...config.timezone, [key]: value } });
  };

  const updateVisualEffects = <K extends keyof RotateItemConfig['visualEffects']>(
    key: K,
    value: RotateItemConfig['visualEffects'][K]
  ) => {
    onChange({ ...config, visualEffects: { ...config.visualEffects, [key]: value } });
  };

  const updateRotation = (
    rotationKey: 'rotation1' | 'rotation2',
    key: keyof RotationConfig,
    value: RotationConfig[keyof RotationConfig]
  ) => {
    onChange({
      ...config,
      [rotationKey]: { ...config[rotationKey], [key]: value }
    });
  };

  const RotationSection: React.FC<{
    title: string;
    rotationKey: 'rotation1' | 'rotation2';
    rotation: RotationConfig;
  }> = ({ title, rotationKey, rotation }) => (
    <SectionGroup title={title}>
      <FormField label="启用状态" field={`${rotationKey}.enabled`} error={getFieldError(errors, `${rotationKey}.enabled`)}>
        <ToggleNullable
          value={rotation.enabled}
          onChange={(v) => updateRotation(rotationKey, 'enabled', v as YesNoNull)}
        />
      </FormField>
      <FormField label="倾斜角度" field={`${rotationKey}.itemTiltPosition`} error={getFieldError(errors, `${rotationKey}.itemTiltPosition`)}>
        <Slider
          value={rotation.itemTiltPosition}
          onChange={(v) => updateRotation(rotationKey, 'itemTiltPosition', v)}
          min={0}
          max={359}
        />
      </FormField>
      <FormField label="旋转中心 X" field={`${rotationKey}.itemAxisX`} error={getFieldError(errors, `${rotationKey}.itemAxisX`)}>
        <Slider
          value={rotation.itemAxisX}
          onChange={(v) => updateRotation(rotationKey, 'itemAxisX', v)}
          min={0}
          max={100}
        />
      </FormField>
      <FormField label="旋转中心 Y" field={`${rotationKey}.itemAxisY`} error={getFieldError(errors, `${rotationKey}.itemAxisY`)}>
        <Slider
          value={rotation.itemAxisY}
          onChange={(v) => updateRotation(rotationKey, 'itemAxisY', v)}
          min={0}
          max={100}
        />
      </FormField>
      <FormField label="位置偏移 X" field={`${rotationKey}.itemPositionX`} error={getFieldError(errors, `${rotationKey}.itemPositionX`)}>
        <Slider
          value={rotation.itemPositionX}
          onChange={(v) => updateRotation(rotationKey, 'itemPositionX', v)}
          min={-100}
          max={100}
        />
      </FormField>
      <FormField label="位置偏移 Y" field={`${rotationKey}.itemPositionY`} error={getFieldError(errors, `${rotationKey}.itemPositionY`)}>
        <Slider
          value={rotation.itemPositionY}
          onChange={(v) => updateRotation(rotationKey, 'itemPositionY', v)}
          min={-100}
          max={100}
        />
      </FormField>
      <FormField label="旋转速度" field={`${rotationKey}.rotationSpeed`} error={getFieldError(errors, `${rotationKey}.rotationSpeed`)}>
        <Input
          type="number"
          value={rotation.rotationSpeed}
          onChange={(v) => updateRotation(rotationKey, 'rotationSpeed', parseFloat(v) || 0)}
          min={0.01}
          step={0.1}
        />
      </FormField>
      <FormField label="旋转方向" field={`${rotationKey}.rotationWay`}>
        <Select<RotationWay>
          value={rotation.rotationWay}
          onChange={(v) => updateRotation(rotationKey, 'rotationWay', v)}
          options={[
            { value: '+', label: '顺时针 (+)' },
            { value: '-', label: '逆时针 (-)' },
            { value: 'no', label: '不旋转' },
            { value: null, label: '未设置' }
          ]}
        />
      </FormField>
    </SectionGroup>
  );

  return (
    <div className="space-y-4">
      <SectionGroup title="📋 基本属性">
        <FormField label="Item Code" field="itemCode" error={getFieldError(errors, 'itemCode')}>
          <Input
            value={config.itemCode}
            onChange={(v) => update('itemCode', v)}
            error={!!getFieldError(errors, 'itemCode')}
          />
        </FormField>
        <FormField label="图层名称" field="itemName">
          <Input
            value={config.itemName}
            onChange={(v) => update('itemName', v)}
          />
        </FormField>
        <FormField label="资源路径" field="itemPath">
          <Input
            value={config.itemPath}
            onChange={(v) => update('itemPath', v)}
            placeholder="/images/..."
          />
        </FormField>
        <FormField label="层级" field="itemLayer" error={getFieldError(errors, 'itemLayer')}>
          <Input
            type="number"
            value={config.itemLayer}
            onChange={(v) => update('itemLayer', parseInt(v) || 1)}
            min={1}
            max={20}
            error={!!getFieldError(errors, 'itemLayer')}
          />
        </FormField>
        <FormField label="大小 (%)" field="itemSize" error={getFieldError(errors, 'itemSize')}>
          <Slider
            value={config.itemSize}
            onChange={(v) => update('itemSize', v)}
            min={1}
            max={100}
          />
        </FormField>
        <FormField label="显示" field="itemDisplay">
          <Select<YesNo>
            value={config.itemDisplay}
            onChange={(v) => update('itemDisplay', v)}
            options={[
              { value: 'yes', label: '显示' },
              { value: 'no', label: '隐藏' },
              { value: '', label: '默认' }
            ]}
          />
        </FormField>
      </SectionGroup>

      <SectionGroup title="⏰ 时钟指针配置">
        <FormField label="指针类型" field="clockHand.handType">
          <Select<HandType>
            value={config.clockHand.handType}
            onChange={(v) => updateClockHand('handType', v)}
            options={[
              { value: null, label: '不是指针' },
              { value: 'hour', label: '时针' },
              { value: 'minute', label: '分针' },
              { value: 'second', label: '秒针' }
            ]}
          />
        </FormField>
        <FormField label="旋转系统" field="clockHand.handRotation">
          <Select<RotationType>
            value={config.clockHand.handRotation}
            onChange={(v) => updateClockHand('handRotation', v)}
            options={[
              { value: null, label: '未设置' },
              { value: 'ROTATION1', label: 'Rotation 1' },
              { value: 'ROTATION2', label: 'Rotation 2' }
            ]}
          />
        </FormField>
      </SectionGroup>

      <SectionGroup title="🌍 时区配置">
        <FormField label="启用时区" field="timezone.enabled">
          <Toggle
            value={config.timezone.enabled}
            onChange={(v) => updateTimezone('enabled', v)}
          />
        </FormField>
        <FormField label="UTC 偏移" field="timezone.utcOffset" error={getFieldError(errors, 'timezone.utcOffset')}>
          <Input
            type="number"
            value={config.timezone.utcOffset}
            onChange={(v) => updateTimezone('utcOffset', parseFloat(v) || 0)}
            min={-12}
            max={12}
            step={0.5}
          />
        </FormField>
        <FormField label="24小时制" field="timezone.use24Hour">
          <Toggle
            value={config.timezone.use24Hour}
            onChange={(v) => updateTimezone('use24Hour', v)}
            labels={['24h', '12h']}
          />
        </FormField>
      </SectionGroup>

      <SectionGroup title="✨ 视觉效果">
        <FormField label="阴影" field="visualEffects.shadow">
          <Toggle
            value={config.visualEffects.shadow}
            onChange={(v) => updateVisualEffects('shadow', v)}
          />
        </FormField>
        <FormField label="发光" field="visualEffects.glow">
          <Toggle
            value={config.visualEffects.glow}
            onChange={(v) => updateVisualEffects('glow', v)}
          />
        </FormField>
        <FormField label="透明" field="visualEffects.transparent">
          <Toggle
            value={config.visualEffects.transparent}
            onChange={(v) => updateVisualEffects('transparent', v)}
          />
        </FormField>
        <FormField label="脉冲" field="visualEffects.pulse">
          <Toggle
            value={config.visualEffects.pulse}
            onChange={(v) => updateVisualEffects('pulse', v)}
          />
        </FormField>
        <FormField label="渲染" field="visualEffects.render">
          <Toggle
            value={config.visualEffects.render}
            onChange={(v) => updateVisualEffects('render', v)}
          />
        </FormField>
      </SectionGroup>

      <RotationSection title="🔄 Rotation 1 配置" rotationKey="rotation1" rotation={config.rotation1} />
      <RotationSection title="🔄 Rotation 2 配置" rotationKey="rotation2" rotation={config.rotation2} />
    </div>
  );
};
