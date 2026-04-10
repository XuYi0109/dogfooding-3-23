import { LauncherConfig, ValidationError, RotateItemConfig } from '../types/config';

export class LauncherConfigValidator {
  static validateConfig(config: LauncherConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    this.validateUniqueItemCodes(config, errors);
    this.validateUniqueItemLayers(config, errors);

    config.rotateConfig.forEach((item, index) => {
      this.validateItem(item, index, errors);
    });

    return errors;
  }

  private static validateUniqueItemCodes(
    config: LauncherConfig,
    errors: ValidationError[]
  ): void {
    const codeMap = new Map<string, number[]>();

    config.rotateConfig.forEach((item, index) => {
      const code = item.itemCode.trim();
      if (!codeMap.has(code)) {
        codeMap.set(code, []);
      }
      codeMap.get(code)!.push(index);
    });

    codeMap.forEach((indices, code) => {
      if (indices.length > 1) {
        indices.forEach((index) => {
          errors.push({
            field: 'itemCode',
            message: `itemCode "${code}" 在图层 ${indices.map((i) => i + 1).join(', ')} 中重复`,
            layerIndex: index,
          });
        });
      }
    });
  }

  private static validateUniqueItemLayers(
    config: LauncherConfig,
    errors: ValidationError[]
  ): void {
    const layerMap = new Map<number, number[]>();

    config.rotateConfig.forEach((item, index) => {
      const layer = item.itemLayer;
      if (!layerMap.has(layer)) {
        layerMap.set(layer, []);
      }
      layerMap.get(layer)!.push(index);
    });

    layerMap.forEach((indices, layer) => {
      if (indices.length > 1) {
        indices.forEach((index) => {
          errors.push({
            field: 'itemLayer',
            message: `itemLayer "${layer}" 在图层 ${indices.map((i) => i + 1).join(', ')} 中重复`,
            layerIndex: index,
          });
        });
      }
    });
  }

  private static validateItem(
    item: RotateItemConfig,
    index: number,
    errors: ValidationError[]
  ): void {
    if (!item.itemCode || item.itemCode.trim() === '') {
      errors.push({
        field: 'itemCode',
        message: 'itemCode 不能为空',
        layerIndex: index,
      });
    }

    if (!item.itemName || item.itemName.trim() === '') {
      errors.push({
        field: 'itemName',
        message: 'itemName 不能为空',
        layerIndex: index,
      });
    }

    if (item.itemLayer < 1 || item.itemLayer > 20) {
      errors.push({
        field: 'itemLayer',
        message: 'itemLayer 必须在 1-20 之间',
        layerIndex: index,
      });
    }

    if (item.itemSize < 1 || item.itemSize > 100) {
      errors.push({
        field: 'itemSize',
        message: 'itemSize 必须在 1-100% 之间',
        layerIndex: index,
      });
    }

    this.validateTimezone(item, index, errors);
    this.validateRotation(item.rotation1, 'rotation1', index, errors);
    this.validateRotation(item.rotation2, 'rotation2', index, errors);
  }

  private static validateTimezone(
    item: RotateItemConfig,
    index: number,
    errors: ValidationError[]
  ): void {
    if (item.timezone.enabled === 'yes') {
      if (item.timezone.utcOffset < -12 || item.timezone.utcOffset > 12) {
        errors.push({
          field: 'timezone.utcOffset',
          message: 'utcOffset 必须在 -12 到 +12 之间',
          layerIndex: index,
        });
      }
    }
  }

  private static validateRotation(
    rotation: RotateItemConfig['rotation1'],
    rotationName: string,
    index: number,
    errors: ValidationError[]
  ): void {
    if (rotation.enabled === 'yes') {
      if (rotation.itemTiltPosition < 0 || rotation.itemTiltPosition > 359) {
        errors.push({
          field: `${rotationName}.itemTiltPosition`,
          message: 'itemTiltPosition 必须在 0-359 之间',
          layerIndex: index,
        });
      }

      if (rotation.itemAxisX < 0 || rotation.itemAxisX > 100) {
        errors.push({
          field: `${rotationName}.itemAxisX`,
          message: 'itemAxisX 必须在 0-100% 之间',
          layerIndex: index,
        });
      }

      if (rotation.itemAxisY < 0 || rotation.itemAxisY > 100) {
        errors.push({
          field: `${rotationName}.itemAxisY`,
          message: 'itemAxisY 必须在 0-100% 之间',
          layerIndex: index,
        });
      }

      if (rotation.itemPositionX < -100 || rotation.itemPositionX > 100) {
        errors.push({
          field: `${rotationName}.itemPositionX`,
          message: 'itemPositionX 必须在 -100 到 +100% 之间',
          layerIndex: index,
        });
      }

      if (rotation.itemPositionY < -100 || rotation.itemPositionY > 100) {
        errors.push({
          field: `${rotationName}.itemPositionY`,
          message: 'itemPositionY 必须在 -100 到 +100% 之间',
          layerIndex: index,
        });
      }

      if (rotation.rotationSpeed <= 0) {
        errors.push({
          field: `${rotationName}.rotationSpeed`,
          message: 'rotationSpeed 必须大于 0',
          layerIndex: index,
        });
      }
    }
  }

  static getFieldErrors(
    errors: ValidationError[],
    layerIndex: number,
    field: string
  ): string[] {
    return errors
      .filter((e) => e.layerIndex === layerIndex && e.field === field)
      .map((e) => e.message);
  }

  static hasFieldError(
    errors: ValidationError[],
    layerIndex: number,
    field: string
  ): boolean {
    return errors.some((e) => e.layerIndex === layerIndex && e.field === field);
  }

  static hasLayerError(errors: ValidationError[], layerIndex: number): boolean {
    return errors.some((e) => e.layerIndex === layerIndex);
  }
}

export const validateConfig = LauncherConfigValidator.validateConfig;
export const getFieldErrors = LauncherConfigValidator.getFieldErrors;
export const hasFieldError = LauncherConfigValidator.hasFieldError;
export const hasLayerError = LauncherConfigValidator.hasLayerError;
