/**
 * 旋转时钟系统配置类型定义
 * Rotate Clock System Configuration Types
 */

// 旋转方向类型
export type RotationWay = '+' | '-' | 'no' | '' | null;

// 时钟指针类型
export type HandType = 'hour' | 'minute' | 'second' | null;

// 旋转模式类型
export type HandRotation = 'ROTATION1' | 'ROTATION2' | null;

// 显示状态类型
export type DisplayToggle = 'yes' | 'no' | '';

// 启用状态类型
export type EnabledToggle = 'yes' | 'no';

// 旋转配置
export interface RotationConfig {
  /** 是否启用此旋转配置 */
  enabled: 'yes' | 'no' | null;
  /** 项目倾斜位置 (0-359度) */
  itemTiltPosition: number;
  /** X轴位置 (0-100%) */
  itemAxisX: number;
  /** Y轴位置 (0-100%) */
  itemAxisY: number;
  /** X轴偏移 (-100% 到 +100%) */
  itemPositionX: number;
  /** Y轴偏移 (-100% 到 +100%) */
  itemPositionY: number;
  /** 旋转速度 (>0) */
  rotationSpeed: number;
  /** 旋转方向 */
  rotationWay: RotationWay;
}

// 时区配置
export interface TimezoneConfig {
  /** 是否启用时区 */
  enabled: EnabledToggle;
  /** UTC偏移量 (-12 到 +12) */
  utcOffset: number;
  /** 是否使用24小时制 */
  use24Hour: EnabledToggle;
}

// 视觉效果配置
export interface VisualEffects {
  /** 阴影效果 */
  shadow: EnabledToggle;
  /** 发光效果 */
  glow: EnabledToggle;
  /** 透明效果 */
  transparent: EnabledToggle;
  /** 脉冲效果 */
  pulse: EnabledToggle;
  /** 是否渲染 */
  render: EnabledToggle;
}

// 旋转项目配置
export interface RotateItemConfig {
  /** 项目唯一代码 */
  itemCode: string;
  /** 项目名称 */
  itemName: string;
  /** 图像路径 */
  itemPath: string;
  /** 层编号 (1-20) */
  itemLayer: number;
  /** 大小百分比 (1-100%) */
  itemSize: number;
  /** 是否显示 */
  itemDisplay: DisplayToggle;
  
  // 时钟指针配置
  /** 指针类型 */
  handType: HandType;
  /** 旋转模式 */
  handRotation: HandRotation;
  
  // 时区配置
  /** 时区设置 */
  timezone: TimezoneConfig;
  
  // 视觉效果
  /** 视觉效果设置 */
  visualEffects: VisualEffects;
  
  // 旋转配置
  /** 第一旋转配置 */
  rotation1: RotationConfig;
  /** 第二旋转配置 */
  rotation2: RotationConfig;
}

// 启动器配置
export interface LauncherConfig {
  /** 配置版本 */
  version: string;
  /** 旋转配置数组 (20层) */
  rotateConfig: RotateItemConfig[];
}

// 验证错误
export interface ValidationError {
  /** 层索引 */
  layerIndex: number;
  /** 字段路径 */
  field: string;
  /** 错误消息 */
  message: string;
  /** 错误类型 */
  type: 'error' | 'warning';
}

// 验证结果
export interface ValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 错误列表 */
  errors: ValidationError[];
}

// 字段约束
export interface FieldConstraints {
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  pattern?: RegExp;
  options?: string[];
}

// 字段元数据
export interface FieldMetadata {
  /** 字段标签 */
  label: string;
  /** 字段描述 */
  description: string;
  /** 字段类型 */
  type: 'text' | 'number' | 'select' | 'toggle' | 'slider';
  /** 约束条件 */
  constraints?: FieldConstraints;
  /** 选项列表 (用于select类型) */
  options?: { value: string; label: string }[];
}
