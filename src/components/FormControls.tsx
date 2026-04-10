import React from 'react';
import { fieldDescriptions } from '../launcher_config';

interface FormFieldProps {
  label: string;
  field: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, field, error, children }) => {
  const description = fieldDescriptions[field] || fieldDescriptions[field.replace(/rotation\d/, 'rotation')];
  
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <span className="tooltip" data-tooltip={description || ''}>
          {label}
          {description && <span className="text-gray-400 ml-1">ⓘ</span>}
        </span>
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

interface InputProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: boolean;
  placeholder?: string;
  readOnly?: boolean;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  type = 'text',
  min,
  max,
  step,
  error,
  placeholder,
  readOnly
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    min={min}
    max={max}
    step={step}
    placeholder={placeholder}
    readOnly={readOnly}
    className={`w-full px-3 py-2 border rounded-md text-sm transition-colors
      ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}
      ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
  />
);

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({ value, onChange, min, max, step = 1 }) => (
  <div className="flex items-center gap-3">
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
    <span className="w-12 text-sm text-gray-600 text-right font-mono">{value}</span>
  </div>
);

interface SelectProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

export function Select<T extends string | number | null>({ value, onChange, options }: SelectProps<T>) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange((e.target.value || null) as T)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
    >
      {options.map((opt) => (
        <option key={String(opt.value) || 'null'} value={opt.value ?? ''}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface ToggleProps {
  value: string;
  onChange: (value: 'yes' | 'no') => void;
  labels?: [string, string];
}

export const Toggle: React.FC<ToggleProps> = ({ value, onChange, labels = ['是', '否'] }) => (
  <div className="flex gap-1">
    <button
      onClick={() => onChange('yes')}
      className={`flex-1 px-3 py-2 text-sm rounded-l-md transition-colors
        ${value === 'yes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
      {labels[0]}
    </button>
    <button
      onClick={() => onChange('no')}
      className={`flex-1 px-3 py-2 text-sm rounded-r-md transition-colors
        ${value === 'no' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
      {labels[1]}
    </button>
  </div>
);

interface ToggleNullableProps {
  value: string | null;
  onChange: (value: 'yes' | 'no' | null) => void;
}

export const ToggleNullable: React.FC<ToggleNullableProps> = ({ value, onChange }) => (
  <div className="flex gap-1">
    <button
      onClick={() => onChange('yes')}
      className={`flex-1 px-2 py-2 text-xs rounded-l-md transition-colors
        ${value === 'yes' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
      启用
    </button>
    <button
      onClick={() => onChange('no')}
      className={`flex-1 px-2 py-2 text-xs transition-colors
        ${value === 'no' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
      禁用
    </button>
    <button
      onClick={() => onChange(null)}
      className={`flex-1 px-2 py-2 text-xs rounded-r-md transition-colors
        ${value === null ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
      未设置
    </button>
  </div>
);
