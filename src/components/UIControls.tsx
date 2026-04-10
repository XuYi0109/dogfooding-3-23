import React from 'react';
import { YesNoValue } from '../types/config';

interface ToggleGroupProps {
  value: YesNoValue;
  onChange: (value: YesNoValue) => void;
  options?: Array<{ value: YesNoValue; label: string }>;
  disabled?: boolean;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value,
  onChange,
  options = [
    { value: 'yes', label: '是' },
    { value: 'no', label: '否' },
    { value: '', label: '默认' },
  ],
  disabled = false,
}) => {
  return (
    <div className="toggle-group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`toggle-btn ${value === option.value ? (option.value === 'yes' ? 'yes-active' : option.value === 'no' ? 'no-active' : 'active') : ''}`}
          onClick={() => onChange(option.value)}
          disabled={disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

interface YesNoToggleProps {
  value: YesNoValue | null;
  onChange: (value: YesNoValue) => void;
  allowNull?: boolean;
  disabled?: boolean;
}

export const YesNoToggle: React.FC<YesNoToggleProps> = ({
  value,
  onChange,
  allowNull = false,
  disabled = false,
}) => {
  const options = allowNull
    ? [
        { value: 'yes' as YesNoValue, label: '是' },
        { value: 'no' as YesNoValue, label: '否' },
        { value: '' as YesNoValue, label: '空' },
      ]
    : [
        { value: 'yes' as YesNoValue, label: '是' },
        { value: 'no' as YesNoValue, label: '否' },
      ];

  return (
    <ToggleGroup
      value={value ?? ''}
      onChange={onChange}
      options={options}
      disabled={disabled}
    />
  );
};

interface SelectInputProps {
  value: string | null;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  value,
  onChange,
  options,
  placeholder = '请选择',
  disabled = false,
}) => {
  return (
    <select
      className="config-select"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  error?: boolean;
  unit?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  error = false,
  unit = '',
}) => {
  return (
    <div className="slider-container">
      <input
        type="number"
        className={`config-input ${error ? 'error' : ''}`}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
      {unit && <span className="slider-value">{unit}</span>}
    </div>
  );
};

interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  unit?: string;
  showValue?: boolean;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  unit = '',
  showValue = true,
}) => {
  return (
    <div className="slider-container">
      <input
        type="range"
        className="config-slider"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
      {showValue && (
        <span className="slider-value">
          {value}
          {unit}
        </span>
      )}
    </div>
  );
};

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  error = false,
}) => {
  return (
    <input
      type="text"
      className={`config-input ${error ? 'error' : ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

interface ConfigRowProps {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
  error?: string;
}

export const ConfigRow: React.FC<ConfigRowProps> = ({
  label,
  tooltip,
  children,
  error,
}) => {
  return (
    <>
      <div className="config-row">
        <label className="config-label">
          {label}
          {tooltip && (
            <span className="tooltip-icon" data-tooltip={tooltip}>
              ?
            </span>
          )}
        </label>
        {children}
      </div>
      {error && <div className="error-message">{error}</div>}
    </>
  );
};

interface ConfigSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({
  title,
  icon,
  children,
}) => {
  return (
    <div className="config-section">
      <div className="section-title">
        <span className="section-icon">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
};

export const handTypeOptions = [
  { value: 'hour', label: '时针' },
  { value: 'minute', label: '分针' },
  { value: 'second', label: '秒针' },
];

export const handRotationOptions = [
  { value: 'ROTATION1', label: '旋转1' },
  { value: 'ROTATION2', label: '旋转2' },
];

export const rotationWayOptions = [
  { value: '+', label: '顺时针 (+)' },
  { value: '-', label: '逆时针 (-)' },
  { value: 'no', label: '不旋转' },
  { value: '', label: '空' },
];
