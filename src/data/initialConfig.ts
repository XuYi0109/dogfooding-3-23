import { RotateItemConfig, LauncherConfig } from '../types/config';

const createDefaultRotationConfig = () => ({
  enabled: null,
  itemTiltPosition: 0,
  itemAxisX: 50,
  itemAxisY: 50,
  itemPositionX: 0,
  itemPositionY: 0,
  rotationSpeed: 1,
  rotationWay: null,
});

const createDefaultLayer = (index: number): RotateItemConfig => ({
  itemCode: `LAYER_${String(index + 1).padStart(2, '0')}`,
  itemName: `图层 ${index + 1}`,
  itemPath: `/assets/layers/layer_${index + 1}.png`,
  itemLayer: index + 1,
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
    shadow: 'no',
    glow: 'no',
    transparent: 'no',
    pulse: 'no',
    render: 'yes',
  },
  rotation1: createDefaultRotationConfig(),
  rotation2: createDefaultRotationConfig(),
});

const createClockHandLayer = (
  index: number,
  handType: 'hour' | 'minute' | 'second',
  name: string
): RotateItemConfig => ({
  itemCode: `CLOCK_${handType.toUpperCase()}`,
  itemName: name,
  itemPath: `/assets/hands/${handType}_hand.png`,
  itemLayer: index + 1,
  itemSize: 100,
  itemDisplay: 'yes',
  handType,
  handRotation: 'ROTATION1',
  timezone: {
    enabled: 'yes',
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
    enabled: 'yes',
    itemTiltPosition: 0,
    itemAxisX: 50,
    itemAxisY: 100,
    itemPositionX: 0,
    itemPositionY: 0,
    rotationSpeed: handType === 'hour' ? 0.5 : handType === 'minute' ? 1 : 60,
    rotationWay: '+',
  },
  rotation2: createDefaultRotationConfig(),
});

export const createInitialConfig = (): LauncherConfig => {
  const layers: RotateItemConfig[] = [];

  layers.push({
    itemCode: 'CLOCK_FACE',
    itemName: '时钟表盘',
    itemPath: '/assets/clock_face.png',
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
      glow: 'yes',
      transparent: 'no',
      pulse: 'no',
      render: 'yes',
    },
    rotation1: createDefaultRotationConfig(),
    rotation2: createDefaultRotationConfig(),
  });

  layers.push(createClockHandLayer(2, 'hour', '时针'));
  layers.push(createClockHandLayer(3, 'minute', '分针'));
  layers.push(createClockHandLayer(4, 'second', '秒针'));

  layers.push({
    itemCode: 'CLOCK_FRAME',
    itemName: '时钟边框',
    itemPath: '/assets/clock_frame.png',
    itemLayer: 5,
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
    rotation1: createDefaultRotationConfig(),
    rotation2: createDefaultRotationConfig(),
  });

  for (let i = 5; i < 20; i++) {
    layers.push(createDefaultLayer(i));
  }

  return { rotateConfig: layers };
};

export const defaultConfig = createInitialConfig();
