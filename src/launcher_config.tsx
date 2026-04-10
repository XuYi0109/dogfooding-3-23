export type HandType = 'hour' | 'minute' | 'second' | null;
export type RotationType = 'ROTATION1' | 'ROTATION2' | null;
export type YesNo = 'yes' | 'no' | '';
export type YesNoNull = 'yes' | 'no' | null;
export type RotationWay = '+' | '-' | 'no' | '' | null;

export interface RotationConfig {
  enabled: YesNoNull;
  itemTiltPosition: number;
  itemAxisX: number;
  itemAxisY: number;
  itemPositionX: number;
  itemPositionY: number;
  rotationSpeed: number;
  rotationWay: RotationWay;
}

export interface TimezoneConfig {
  enabled: YesNo;
  utcOffset: number;
  use24Hour: YesNo;
}

export interface VisualEffectsConfig {
  shadow: YesNo;
  glow: YesNo;
  transparent: YesNo;
  pulse: YesNo;
  render: YesNo;
}

export interface ClockHandConfig {
  handType: HandType;
  handRotation: RotationType;
}

export interface RotateItemConfig {
  itemCode: string;
  itemName: string;
  itemPath: string;
  itemLayer: number;
  itemSize: number;
  itemDisplay: YesNo;
  clockHand: ClockHandConfig;
  timezone: TimezoneConfig;
  visualEffects: VisualEffectsConfig;
  rotation1: RotationConfig;
  rotation2: RotationConfig;
}

export const createDefaultRotation = (): RotationConfig => ({
  enabled: null,
  itemTiltPosition: 0,
  itemAxisX: 50,
  itemAxisY: 50,
  itemPositionX: 0,
  itemPositionY: 0,
  rotationSpeed: 1,
  rotationWay: '+'
});

export const createDefaultItem = (index: number): RotateItemConfig => ({
  itemCode: `LAYER_${String(index).padStart(2, '0')}`,
  itemName: `图层 ${index}`,
  itemPath: `/images/layer_${index}.svg`,
  itemLayer: index,
  itemSize: 100,
  itemDisplay: index <= 5 ? 'yes' : 'no',
  clockHand: {
    handType: null,
    handRotation: null
  },
  timezone: {
    enabled: 'no',
    utcOffset: 8,
    use24Hour: 'yes'
  },
  visualEffects: {
    shadow: 'no',
    glow: 'no',
    transparent: 'no',
    pulse: 'no',
    render: 'yes'
  },
  rotation1: createDefaultRotation(),
  rotation2: createDefaultRotation()
});

export const initialRotateConfig: RotateItemConfig[] = Array.from({ length: 20 }, (_, i) => {
  const item = createDefaultItem(i + 1);
  
  if (i === 0) {
    item.itemName = '表盘背景';
    item.itemDisplay = 'yes';
    item.visualEffects.shadow = 'yes';
  } else if (i === 1) {
    item.itemName = '刻度环';
    item.itemDisplay = 'yes';
    item.itemSize = 95;
  } else if (i === 2) {
    item.itemName = '时针';
    item.itemDisplay = 'yes';
    item.itemSize = 60;
    item.clockHand.handType = 'hour';
    item.clockHand.handRotation = 'ROTATION1';
    item.rotation1.enabled = 'yes';
    item.rotation1.rotationSpeed = 0.5;
  } else if (i === 3) {
    item.itemName = '分针';
    item.itemDisplay = 'yes';
    item.itemSize = 75;
    item.clockHand.handType = 'minute';
    item.clockHand.handRotation = 'ROTATION1';
    item.rotation1.enabled = 'yes';
    item.rotation1.rotationSpeed = 6;
  } else if (i === 4) {
    item.itemName = '秒针';
    item.itemDisplay = 'yes';
    item.itemSize = 85;
    item.clockHand.handType = 'second';
    item.clockHand.handRotation = 'ROTATION1';
    item.rotation1.enabled = 'yes';
    item.rotation1.rotationSpeed = 36;
    item.visualEffects.glow = 'yes';
  } else if (i === 5) {
    item.itemName = '中心装饰';
    item.itemDisplay = 'yes';
    item.itemSize = 15;
    item.visualEffects.glow = 'yes';
  } else if (i === 6) {
    item.itemName = '时区环 - UTC';
    item.timezone.enabled = 'yes';
    item.timezone.utcOffset = 0;
    item.rotation1.enabled = 'yes';
    item.rotation1.rotationSpeed = 0.25;
  } else if (i === 7) {
    item.itemName = '装饰齿轮 1';
    item.rotation1.enabled = 'yes';
    item.rotation1.rotationSpeed = 2;
    item.rotation1.rotationWay = '-';
  } else if (i === 8) {
    item.itemName = '装饰齿轮 2';
    item.rotation1.enabled = 'yes';
    item.rotation1.rotationSpeed = 3;
    item.rotation2.enabled = 'yes';
    item.rotation2.rotationSpeed = 1;
    item.rotation2.rotationWay = '-';
  } else if (i === 9) {
    item.itemName = '脉冲效果层';
    item.visualEffects.pulse = 'yes';
  }
  
  return item;
});

export interface ValidationError {
  layerIndex: number;
  field: string;
  message: string;
}

export class LauncherConfigLogic {
  static validateConfig(config: RotateItemConfig[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const itemCodes = new Set<string>();
    const itemLayers = new Set<number>();

    config.forEach((item, index) => {
      if (itemCodes.has(item.itemCode)) {
        errors.push({
          layerIndex: index,
          field: 'itemCode',
          message: `itemCode '${item.itemCode}' 已被使用`
        });
      }
      itemCodes.add(item.itemCode);

      if (itemLayers.has(item.itemLayer)) {
        errors.push({
          layerIndex: index,
          field: 'itemLayer',
          message: `层级 ${item.itemLayer} 已被使用`
        });
      }
      itemLayers.add(item.itemLayer);

      if (item.itemLayer < 1 || item.itemLayer > 20) {
        errors.push({
          layerIndex: index,
          field: 'itemLayer',
          message: '层级必须在 1-20 之间'
        });
      }

      if (item.itemSize < 1 || item.itemSize > 100) {
        errors.push({
          layerIndex: index,
          field: 'itemSize',
          message: '大小必须在 1-100% 之间'
        });
      }

      if (item.timezone.enabled === 'yes') {
        if (item.timezone.utcOffset < -12 || item.timezone.utcOffset > 12) {
          errors.push({
            layerIndex: index,
            field: 'timezone.utcOffset',
            message: '时区偏移必须在 -12 到 +12 之间'
          });
        }
      }

      [item.rotation1, item.rotation2].forEach((rotation, rotIndex) => {
        const prefix = `rotation${rotIndex + 1}`;
        
        if (rotation.enabled === 'yes') {
          if (rotation.itemTiltPosition < 0 || rotation.itemTiltPosition > 359) {
            errors.push({
              layerIndex: index,
              field: `${prefix}.itemTiltPosition`,
              message: '倾斜角度必须在 0-359° 之间'
            });
          }
          if (rotation.itemAxisX < 0 || rotation.itemAxisX > 100) {
            errors.push({
              layerIndex: index,
              field: `${prefix}.itemAxisX`,
              message: 'X轴位置必须在 0-100% 之间'
            });
          }
          if (rotation.itemAxisY < 0 || rotation.itemAxisY > 100) {
            errors.push({
              layerIndex: index,
              field: `${prefix}.itemAxisY`,
              message: 'Y轴位置必须在 0-100% 之间'
            });
          }
          if (rotation.itemPositionX < -100 || rotation.itemPositionX > 100) {
            errors.push({
              layerIndex: index,
              field: `${prefix}.itemPositionX`,
              message: 'X偏移必须在 -100 到 +100 之间'
            });
          }
          if (rotation.itemPositionY < -100 || rotation.itemPositionY > 100) {
            errors.push({
              layerIndex: index,
              field: `${prefix}.itemPositionY`,
              message: 'Y偏移必须在 -100 到 +100 之间'
            });
          }
          if (rotation.rotationSpeed <= 0) {
            errors.push({
              layerIndex: index,
              field: `${prefix}.rotationSpeed`,
              message: '旋转速度必须大于 0'
            });
          }
        }
      });
    });

    return errors;
  }
}

export const fieldDescriptions: Record<string, string> = {
  itemCode: '图层唯一标识符，用于代码引用',
  itemName: '图层显示名称，便于识别',
  itemPath: '图像资源文件路径',
  itemLayer: '渲染层级顺序，数值越大越在上层',
  itemSize: '图层缩放大小百分比',
  itemDisplay: '是否在预览中显示该图层',
  'clockHand.handType': '指定该图层作为时钟指针类型',
  'clockHand.handRotation': '使用哪个旋转系统驱动该指针',
  'timezone.enabled': '启用时区时间计算',
  'timezone.utcOffset': '相对于UTC的时区偏移量',
  'timezone.use24Hour': '使用24小时制显示',
  'visualEffects.shadow': '添加投影效果',
  'visualEffects.glow': '添加发光效果',
  'visualEffects.transparent': '半透明显示',
  'visualEffects.pulse': '脉冲动画效果',
  'visualEffects.render': '是否渲染该图层',
  'rotation.enabled': '启用该旋转系统',
  'rotation.itemTiltPosition': '初始倾斜角度',
  'rotation.itemAxisX': '旋转中心X轴位置',
  'rotation.itemAxisY': '旋转中心Y轴位置',
  'rotation.itemPositionX': '水平方向偏移',
  'rotation.itemPositionY': '垂直方向偏移',
  'rotation.rotationSpeed': '每秒旋转度数',
  'rotation.rotationWay': '旋转方向：顺时针+，逆时针-，或停止'
};
