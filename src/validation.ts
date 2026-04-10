/**
 * 配置验证逻辑
 * Configuration Validation Logic
 * 
 * 提供与 LauncherConfigLogic.validateConfig 一致的验证功能
 * Provides validation functionality consistent with LauncherConfigLogic.validateConfig
 */

import type {
  RotateItemConfig,
  LauncherConfig,
  ValidationError,
  ValidationResult,
  RotationConfig,
  TimezoneConfig,
} from './types';

/**
 * 验证约束常量
 * Validation constraint constants
 */
export const CONSTRAINTS = {
  ITEM_LAYER: { min: 1, max: 20 },
  ITEM_SIZE: { min: 1, max: 100 },
  UTC_OFFSET: { min: -12, max: 12 },
  TILT_POSITION: { min: 0, max: 359 },
  AXIS_POSITION: { min: 0, max: 100 },
  POSITION_OFFSET: { min: -100, max: 100 },
  ROTATION_SPEED: { min: 0.001, max: 10000 },
} as const;

/**
 * 字段元数据映射
 * Field metadata mapping for tooltips and descriptions
 */
export const FIELD_METADATA: Record<string, { label: string; description: string }> = {
  itemCode: {
    label: '项目代码',
    description: '层的唯一标识符，用于区分不同的视觉组件',
  },
  itemName: {
    label: '项目名称',
    description: '层的显示名称，用于在UI中识别',
  },
  itemPath: {
    label: '图像路径',
    description: '图像资源的文件路径或URL',
  },
  itemLayer: {
    label: '层编号',
    description: '层的堆叠顺序，1为底层，20为顶层',
  },
  itemSize: {
    label: '大小',
    description: '图像显示大小百分比 (1-100%)',
  },
  itemDisplay: {
    label: '显示状态',
    description: '控制该层是否可见',
  },
  handType: {
    label: '指针类型',
    description: '将此层设置为时钟指针类型',
  },
  handRotation: {
    label: '旋转模式',
    description: '选择使用哪个旋转配置驱动指针',
  },
  'timezone.enabled': {
    label: '启用时区',
    description: '是否启用时区偏移计算',
  },
  'timezone.utcOffset': {
    label: 'UTC偏移',
    description: '时区偏移量，范围 -12 到 +12',
  },
  'timezone.use24Hour': {
    label: '24小时制',
    description: '是否使用24小时制显示',
  },
  'visualEffects.shadow': {
    label: '阴影效果',
    description: '为图像添加阴影效果',
  },
  'visualEffects.glow': {
    label: '发光效果',
    description: '为图像添加发光效果',
  },
  'visualEffects.transparent': {
    label: '透明效果',
    description: '使图像具有透明度',
  },
  'visualEffects.pulse': {
    label: '脉冲效果',
    description: '为图像添加脉冲动画效果',
  },
  'visualEffects.render': {
    label: '渲染',
    description: '是否渲染此层',
  },
  'rotation1.enabled': {
    label: '启用旋转1',
    description: '是否启用第一旋转配置',
  },
  'rotation1.itemTiltPosition': {
    label: '倾斜位置',
    description: '初始倾斜角度 (0-359度)',
  },
  'rotation1.itemAxisX': {
    label: 'X轴位置',
    description: '旋转中心X坐标 (0-100%)',
  },
  'rotation1.itemAxisY': {
    label: 'Y轴位置',
    description: '旋转中心Y坐标 (0-100%)',
  },
  'rotation1.itemPositionX': {
    label: 'X偏移',
    description: '水平偏移量 (-100% 到 +100%)',
  },
  'rotation1.itemPositionY': {
    label: 'Y偏移',
    description: '垂直偏移量 (-100% 到 +100%)',
  },
  'rotation1.rotationSpeed': {
    label: '旋转速度',
    description: '旋转速度值 (>0)',
  },
  'rotation1.rotationWay': {
    label: '旋转方向',
    description: '顺时针(+)、逆时针(-)或不旋转',
  },
  'rotation2.enabled': {
    label: '启用旋转2',
    description: '是否启用第二旋转配置',
  },
  'rotation2.itemTiltPosition': {
    label: '倾斜位置',
    description: '初始倾斜角度 (0-359度)',
  },
  'rotation2.itemAxisX': {
    label: 'X轴位置',
    description: '旋转中心X坐标 (0-100%)',
  },
  'rotation2.itemAxisY': {
    label: 'Y轴位置',
    description: '旋转中心Y坐标 (0-100%)',
  },
  'rotation2.itemPositionX': {
    label: 'X偏移',
    description: '水平偏移量 (-100% 到 +100%)',
  },
  'rotation2.itemPositionY': {
    label: 'Y偏移',
    description: '垂直偏移量 (-100% 到 +100%)',
  },
  'rotation2.rotationSpeed': {
    label: '旋转速度',
    description: '旋转速度值 (>0)',
  },
  'rotation2.rotationWay': {
    label: '旋转方向',
    description: '顺时针(+)、逆时针(-)或不旋转',
  },
};

/**
 * 验证旋转配置
 * Validate rotation configuration
 */
function validateRotationConfig(
  config: RotationConfig,
  prefix: string,
  layerIndex: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (config.enabled === 'yes') {
    if (config.itemTiltPosition < CONSTRAINTS.TILT_POSITION.min ||
        config.itemTiltPosition > CONSTRAINTS.TILT_POSITION.max) {
      errors.push({
        layerIndex,
        field: `${prefix}.itemTiltPosition`,
        message: `倾斜位置必须在 ${CONSTRAINTS.TILT_POSITION.min} 到 ${CONSTRAINTS.TILT_POSITION.max} 度之间`,
        type: 'error',
      });
    }

    if (config.itemAxisX < CONSTRAINTS.AXIS_POSITION.min ||
        config.itemAxisX > CONSTRAINTS.AXIS_POSITION.max) {
      errors.push({
        layerIndex,
        field: `${prefix}.itemAxisX`,
        message: `X轴位置必须在 ${CONSTRAINTS.AXIS_POSITION.min}% 到 ${CONSTRAINTS.AXIS_POSITION.max}% 之间`,
        type: 'error',
      });
    }

    if (config.itemAxisY < CONSTRAINTS.AXIS_POSITION.min ||
        config.itemAxisY > CONSTRAINTS.AXIS_POSITION.max) {
      errors.push({
        layerIndex,
        field: `${prefix}.itemAxisY`,
        message: `Y轴位置必须在 ${CONSTRAINTS.AXIS_POSITION.min}% 到 ${CONSTRAINTS.AXIS_POSITION.max}% 之间`,
        type: 'error',
      });
    }

    if (config.itemPositionX < CONSTRAINTS.POSITION_OFFSET.min ||
        config.itemPositionX > CONSTRAINTS.POSITION_OFFSET.max) {
      errors.push({
        layerIndex,
        field: `${prefix}.itemPositionX`,
        message: `X偏移必须在 ${CONSTRAINTS.POSITION_OFFSET.min}% 到 ${CONSTRAINTS.POSITION_OFFSET.max}% 之间`,
        type: 'error',
      });
    }

    if (config.itemPositionY < CONSTRAINTS.POSITION_OFFSET.min ||
        config.itemPositionY > CONSTRAINTS.POSITION_OFFSET.max) {
      errors.push({
        layerIndex,
        field: `${prefix}.itemPositionY`,
        message: `Y偏移必须在 ${CONSTRAINTS.POSITION_OFFSET.min}% 到 ${CONSTRAINTS.POSITION_OFFSET.max}% 之间`,
        type: 'error',
      });
    }

    if (config.rotationSpeed <= 0) {
      errors.push({
        layerIndex,
        field: `${prefix}.rotationSpeed`,
        message: '旋转速度必须大于 0',
        type: 'error',
      });
    }

    if (!config.rotationWay) {
      errors.push({
        layerIndex,
        field: `${prefix}.rotationWay`,
        message: '启用旋转时必须指定旋转方向',
        type: 'warning',
      });
    }
  }

  return errors;
}

/**
 * 验证时区配置
 * Validate timezone configuration
 */
function validateTimezoneConfig(
  config: TimezoneConfig,
  layerIndex: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (config.enabled === 'yes') {
    if (config.utcOffset < CONSTRAINTS.UTC_OFFSET.min ||
        config.utcOffset > CONSTRAINTS.UTC_OFFSET.max) {
      errors.push({
        layerIndex,
        field: 'timezone.utcOffset',
        message: `UTC偏移必须在 ${CONSTRAINTS.UTC_OFFSET.min} 到 ${CONSTRAINTS.UTC_OFFSET.max} 之间`,
        type: 'error',
      });
    }
  }

  return errors;
}

/**
 * 验证单个层配置
 * Validate single layer configuration
 */
function validateLayer(
  layer: RotateItemConfig,
  layerIndex: number,
  allLayers: RotateItemConfig[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 验证 itemCode 唯一性
  const duplicateCodes = allLayers.filter(
    (l, i) => i !== layerIndex && l.itemCode === layer.itemCode
  );
  if (duplicateCodes.length > 0) {
    errors.push({
      layerIndex,
      field: 'itemCode',
      message: `项目代码 "${layer.itemCode}" 已被其他层使用`,
      type: 'error',
    });
  }

  // 验证 itemCode 格式
  if (!layer.itemCode || layer.itemCode.trim() === '') {
    errors.push({
      layerIndex,
      field: 'itemCode',
      message: '项目代码不能为空',
      type: 'error',
    });
  }

  // 验证 itemName
  if (!layer.itemName || layer.itemName.trim() === '') {
    errors.push({
      layerIndex,
      field: 'itemName',
      message: '项目名称不能为空',
      type: 'warning',
    });
  }

  // 验证 itemLayer 范围
  if (layer.itemLayer < CONSTRAINTS.ITEM_LAYER.min ||
      layer.itemLayer > CONSTRAINTS.ITEM_LAYER.max) {
    errors.push({
      layerIndex,
      field: 'itemLayer',
      message: `层编号必须在 ${CONSTRAINTS.ITEM_LAYER.min} 到 ${CONSTRAINTS.ITEM_LAYER.max} 之间`,
      type: 'error',
    });
  }

  // 验证 itemLayer 唯一性
  const duplicateLayers = allLayers.filter(
    (l, i) => i !== layerIndex && l.itemLayer === layer.itemLayer
  );
  if (duplicateLayers.length > 0) {
    errors.push({
      layerIndex,
      field: 'itemLayer',
      message: `层编号 ${layer.itemLayer} 已被其他层使用`,
      type: 'error',
    });
  }

  // 验证 itemSize
  if (layer.itemSize < CONSTRAINTS.ITEM_SIZE.min ||
      layer.itemSize > CONSTRAINTS.ITEM_SIZE.max) {
    errors.push({
      layerIndex,
      field: 'itemSize',
      message: `大小必须在 ${CONSTRAINTS.ITEM_SIZE.min}% 到 ${CONSTRAINTS.ITEM_SIZE.max}% 之间`,
      type: 'error',
    });
  }

  // 验证时区配置
  errors.push(...validateTimezoneConfig(layer.timezone, layerIndex));

  // 验证旋转配置
  errors.push(...validateRotationConfig(layer.rotation1, 'rotation1', layerIndex));
  errors.push(...validateRotationConfig(layer.rotation2, 'rotation2', layerIndex));

  // 验证时钟指针配置一致性
  if (layer.handType && !layer.handRotation) {
    errors.push({
      layerIndex,
      field: 'handRotation',
      message: '设置指针类型时必须选择旋转模式',
      type: 'warning',
    });
  }

  if (layer.handRotation && !layer.handType) {
    errors.push({
      layerIndex,
      field: 'handType',
      message: '选择旋转模式时必须设置指针类型',
      type: 'warning',
    });
  }

  return errors;
}

/**
 * 验证整个配置
 * Validate entire configuration
 */
export function validateConfig(config: LauncherConfig): ValidationResult {
  const errors: ValidationError[] = [];

  config.rotateConfig.forEach((layer, index) => {
    errors.push(...validateLayer(layer, index, config.rotateConfig));
  });

  return {
    isValid: !errors.some(e => e.type === 'error'),
    errors,
  };
}

/**
 * 验证单个字段
 * Validate single field
 */
export function validateField(
  _layer: RotateItemConfig,
  field: string,
  value: unknown,
  allLayers: RotateItemConfig[],
  layerIndex: number
): ValidationError | null {
  // 基本字段验证
  switch (field) {
    case 'itemCode':
      if (!value || String(value).trim() === '') {
        return {
          layerIndex,
          field,
          message: '项目代码不能为空',
          type: 'error',
        };
      }
      const duplicateCodes = allLayers.filter(
        (l, i) => i !== layerIndex && l.itemCode === value
      );
      if (duplicateCodes.length > 0) {
        return {
          layerIndex,
          field,
          message: `项目代码 "${value}" 已被其他层使用`,
          type: 'error',
        };
      }
      break;

    case 'itemLayer':
      const layerNum = Number(value);
      if (layerNum < CONSTRAINTS.ITEM_LAYER.min || layerNum > CONSTRAINTS.ITEM_LAYER.max) {
        return {
          layerIndex,
          field,
          message: `层编号必须在 ${CONSTRAINTS.ITEM_LAYER.min} 到 ${CONSTRAINTS.ITEM_LAYER.max} 之间`,
          type: 'error',
        };
      }
      const duplicateLayers = allLayers.filter(
        (l, i) => i !== layerIndex && l.itemLayer === layerNum
      );
      if (duplicateLayers.length > 0) {
        return {
          layerIndex,
          field,
          message: `层编号 ${layerNum} 已被其他层使用`,
          type: 'error',
        };
      }
      break;

    case 'itemSize':
      const size = Number(value);
      if (size < CONSTRAINTS.ITEM_SIZE.min || size > CONSTRAINTS.ITEM_SIZE.max) {
        return {
          layerIndex,
          field,
          message: `大小必须在 ${CONSTRAINTS.ITEM_SIZE.min}% 到 ${CONSTRAINTS.ITEM_SIZE.max}% 之间`,
          type: 'error',
        };
      }
      break;

    case 'timezone.utcOffset':
      const offset = Number(value);
      if (offset < CONSTRAINTS.UTC_OFFSET.min || offset > CONSTRAINTS.UTC_OFFSET.max) {
        return {
          layerIndex,
          field,
          message: `UTC偏移必须在 ${CONSTRAINTS.UTC_OFFSET.min} 到 ${CONSTRAINTS.UTC_OFFSET.max} 之间`,
          type: 'error',
        };
      }
      break;

    case 'rotation1.rotationSpeed':
    case 'rotation2.rotationSpeed':
      const speed = Number(value);
      if (speed <= 0) {
        return {
          layerIndex,
          field,
          message: '旋转速度必须大于 0',
          type: 'error',
        };
      }
      break;
  }

  // 旋转配置字段验证
  if (field.includes('rotation')) {
    const numValue = Number(value);
    if (field.includes('itemTiltPosition')) {
      if (numValue < CONSTRAINTS.TILT_POSITION.min || numValue > CONSTRAINTS.TILT_POSITION.max) {
        return {
          layerIndex,
          field,
          message: `倾斜位置必须在 ${CONSTRAINTS.TILT_POSITION.min} 到 ${CONSTRAINTS.TILT_POSITION.max} 度之间`,
          type: 'error',
        };
      }
    }
    if (field.includes('itemAxis')) {
      if (numValue < CONSTRAINTS.AXIS_POSITION.min || numValue > CONSTRAINTS.AXIS_POSITION.max) {
        return {
          layerIndex,
          field,
          message: `轴位置必须在 ${CONSTRAINTS.AXIS_POSITION.min}% 到 ${CONSTRAINTS.AXIS_POSITION.max}% 之间`,
          type: 'error',
        };
      }
    }
    if (field.includes('itemPosition')) {
      if (numValue < CONSTRAINTS.POSITION_OFFSET.min || numValue > CONSTRAINTS.POSITION_OFFSET.max) {
        return {
          layerIndex,
          field,
          message: `偏移量必须在 ${CONSTRAINTS.POSITION_OFFSET.min}% 到 ${CONSTRAINTS.POSITION_OFFSET.max}% 之间`,
          type: 'error',
        };
      }
    }
  }

  return null;
}

export default {
  validateConfig,
  validateField,
  CONSTRAINTS,
  FIELD_METADATA,
};
