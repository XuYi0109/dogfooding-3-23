export type YesNoValue = 'yes' | 'no' | '';
export type HandType = 'hour' | 'minute' | 'second' | null;
export type HandRotation = 'ROTATION1' | 'ROTATION2' | null;
export type RotationWay = '+' | '-' | 'no' | '' | null;

export interface RotationConfig {
  enabled: YesNoValue | null;
  itemTiltPosition: number;
  itemAxisX: number;
  itemAxisY: number;
  itemPositionX: number;
  itemPositionY: number;
  rotationSpeed: number;
  rotationWay: RotationWay;
}

export interface TimezoneConfig {
  enabled: YesNoValue;
  utcOffset: number;
  use24Hour: YesNoValue;
}

export interface VisualEffects {
  shadow: YesNoValue;
  glow: YesNoValue;
  transparent: YesNoValue;
  pulse: YesNoValue;
  render: YesNoValue;
}

export interface RotateItemConfig {
  itemCode: string;
  itemName: string;
  itemPath: string;
  itemLayer: number;
  itemSize: number;
  itemDisplay: YesNoValue;
  handType: HandType;
  handRotation: HandRotation;
  timezone: TimezoneConfig;
  visualEffects: VisualEffects;
  rotation1: RotationConfig;
  rotation2: RotationConfig;
}

export interface LauncherConfig {
  rotateConfig: RotateItemConfig[];
}

export interface ValidationError {
  field: string;
  message: string;
  layerIndex: number;
}

export interface ConfigState {
  config: LauncherConfig;
  errors: ValidationError[];
  expandedLayers: Set<number>;
  searchQuery: string;
}
