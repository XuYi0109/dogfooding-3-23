/**
 * 启动器配置文件
 * Launcher Configuration File
 * 
 * 包含旋转时钟系统的20层配置
 * Contains 20-layer configuration for rotating clock system
 */

import type { LauncherConfig, RotateItemConfig } from './types';

/**
 * 创建默认旋转配置
 * Create default rotation configuration
 */
const createDefaultRotationConfig = () => ({
  enabled: null as 'yes' | 'no' | null,
  itemTiltPosition: 0,
  itemAxisX: 50,
  itemAxisY: 50,
  itemPositionX: 0,
  itemPositionY: 0,
  rotationSpeed: 1,
  rotationWay: null as '+' | '-' | 'no' | '' | null,
});

/**
 * 创建默认时区配置
 * Create default timezone configuration
 */
const createDefaultTimezoneConfig = () => ({
  enabled: 'no' as const,
  utcOffset: 0,
  use24Hour: 'yes' as const,
});

/**
 * 创建默认视觉效果配置
 * Create default visual effects configuration
 */
const createDefaultVisualEffects = () => ({
  shadow: 'no' as const,
  glow: 'no' as const,
  transparent: 'no' as const,
  pulse: 'no' as const,
  render: 'yes' as const,
});

/**
 * 创建默认层配置
 * Create default layer configuration
 */
const createDefaultLayerConfig = (index: number): RotateItemConfig => ({
  itemCode: `LAYER_${String(index + 1).padStart(2, '0')}`,
  itemName: `Layer ${index + 1}`,
  itemPath: '',
  itemLayer: index + 1,
  itemSize: 100,
  itemDisplay: 'yes',
  handType: null,
  handRotation: null,
  timezone: createDefaultTimezoneConfig(),
  visualEffects: createDefaultVisualEffects(),
  rotation1: createDefaultRotationConfig(),
  rotation2: createDefaultRotationConfig(),
});

/**
 * 示例配置数据 - 包含一些预设的时钟层
 * Sample configuration data with preset clock layers
 */
export const defaultLauncherConfig: LauncherConfig = {
  version: '1.0.0',
  rotateConfig: [
    // Layer 1: 时钟表盘背景
    {
      itemCode: 'CLOCK_FACE',
      itemName: 'Clock Face Background',
      itemPath: '/assets/clock/face.png',
      itemLayer: 1,
      itemSize: 100,
      itemDisplay: 'yes',
      handType: null,
      handRotation: null,
      timezone: {
        enabled: 'no',
        utcOffset: 0,
        use24Hour: 'yes',
      },
      visualEffects: {
        shadow: 'yes',
        glow: 'no',
        transparent: 'no',
        pulse: 'no',
        render: 'yes',
      },
      rotation1: {
        enabled: 'no',
        itemTiltPosition: 0,
        itemAxisX: 50,
        itemAxisY: 50,
        itemPositionX: 0,
        itemPositionY: 0,
        rotationSpeed: 0,
        rotationWay: null,
      },
      rotation2: {
        enabled: 'no',
        itemTiltPosition: 0,
        itemAxisX: 50,
        itemAxisY: 50,
        itemPositionX: 0,
        itemPositionY: 0,
        rotationSpeed: 0,
        rotationWay: null,
      },
    },
    // Layer 2: 时针
    {
      itemCode: 'HOUR_HAND',
      itemName: 'Hour Hand',
      itemPath: '/assets/clock/hour_hand.png',
      itemLayer: 2,
      itemSize: 80,
      itemDisplay: 'yes',
      handType: 'hour',
      handRotation: 'ROTATION1',
      timezone: {
        enabled: 'yes',
        utcOffset: 8,
        use24Hour: 'no',
      },
      visualEffects: {
        shadow: 'yes',
        glow: 'no',
        transparent: 'no',
        pulse: 'no',
        render: 'yes',
      },
      rotation1: {
        enabled: 'yes',
        itemTiltPosition: 0,
        itemAxisX: 50,
        itemAxisY: 85,
        itemPositionX: 0,
        itemPositionY: 0,
        rotationSpeed: 1,
        rotationWay: '+',
      },
      rotation2: {
        enabled: 'no',
        itemTiltPosition: 0,
        itemAxisX: 50,
        itemAxisY: 50,
        itemPositionX: 0,
        itemPositionY: 0,
        rotationSpeed: 0,
        rotationWay: null,
      },
    },
    // Layer 3: 分针
    {
      itemCode: 'MINUTE_HAND',
      itemName: 'Minute Hand',
      itemPath: '/assets/clock/minute_hand.png',
      itemLayer: 3,
      itemSize: 90,
      itemDisplay: 'yes',
      handType: 'minute',
      handRotation: 'ROTATION1',
      timezone: {
        enabled: 'yes',
        utcOffset: 8,
        use24Hour: 'no',
      },
      visualEffects: {
        shadow: 'yes',
        glow: 'no',
        transparent: 'no',
        pulse: 'no',
        render: 'yes',
      },
      rotation1: {
        enabled: 'yes',
        itemTiltPosition: 0,
        itemAxisX: 50,
        itemAxisY: 90,
        itemPositionX: 0,
        itemPositionY: 0,
        rotationSpeed: 12,
        rotationWay: '+',
      },
      rotation2: {
        enabled: 'no',
        itemTiltPosition: 0,
        itemAxisX: 50,
        itemAxisY: 50,
        itemPositionX: 0,
        itemPositionY: 0,
        rotationSpeed: 0,
        rotationWay: null,
      },
    },
    // Layer 4: 秒针
    {
      itemCode: 'SECOND_HAND',
      itemName: 'Second Hand',
      itemPath: '/assets/clock/second_hand.png',
      itemLayer: 4,
      itemSize: 95,
      itemDisplay: 'yes',
      handType: 'second',
      handRotation: 'ROTATION1',
      timezone: {
        enabled: 'yes',
        utcOffset: 8,
        use24Hour: 'no',
      },
      visualEffects: {
        shadow: 'yes',
        glow: 'yes',
        transparent: 'no',
        pulse: 'yes',
        render: 'yes',
      },
      rotation1: {
        enabled: 'yes',
        itemTiltPosition: 0,
        itemAxisX: 50,
        itemAxisY: 92,
        itemPositionX: 0,
        itemPositionY: 0,
        rotationSpeed: 720,
        rotationWay: '+',
      },
      rotation2: {
        enabled: 'no',
        itemTiltPosition: 0,
        itemAxisX: 50,
        itemAxisY: 50,
        itemPositionX: 0,
        itemPositionY: 0,
        rotationSpeed: 0,
        rotationWay: null,
      },
    },
    // Layer 5: 中心装饰
    {
      itemCode: 'CENTER_CAP',
      itemName: 'Center Cap',
      itemPath: '/assets/clock/center_cap.png',
      itemLayer: 5,
      itemSize: 15,
      itemDisplay: 'yes',
      handType: null,
      handRotation: null,
      timezone: {
        enabled: 'no',
        utcOffset: 0,
        use24Hour: 'yes',
      },
      visualEffects: {
        shadow: 'yes',
        glow: 'yes',
        transparent: 'no',
        pulse: 'no',
        render: 'yes',
      },
      rotation1: {
        enabled: 'no',
        itemTiltPosition: 0,
        itemAxisX: 50,
        itemAxisY: 50,
        itemPositionX: 0,
        itemPositionY: 0,
        rotationSpeed: 0,
        rotationWay: null,
      },
      rotation2: {
        enabled: 'no',
        itemTiltPosition: 0,
        itemAxisX: 50,
        itemAxisY: 50,
        itemPositionX: 0,
        itemPositionY: 0,
        rotationSpeed: 0,
        rotationWay: null,
      },
    },
    // Layers 6-20: 空层模板
    ...Array.from({ length: 15 }, (_, i) => createDefaultLayerConfig(i + 5)),
  ],
};

export default defaultLauncherConfig;
