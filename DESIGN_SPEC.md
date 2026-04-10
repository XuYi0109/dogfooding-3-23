# 旋转时钟配置编辑器 - 设计与实现规范

## 概述

本文档详细描述了用于编辑 `launcher_config.tsx` 中旋转时钟系统配置的 React TypeScript UI 组件的设计和实现规范。

## 组件结构层次

```
ConfigEditor (主编辑器)
├── EditorHeader (头部工具栏)
│   ├── ValidationStatus (验证状态显示)
│   ├── Import/Export Buttons (导入/导出按钮)
│   └── Dirty State Indicator (修改状态指示器)
│
├── ConfigPanel (配置面板 - 左侧)
│   ├── SearchBar (搜索栏)
│   │   ├── Text Search (文本搜索)
│   │   ├── Filter Toggles (过滤开关)
│   │   └── Hand Type Filter (指针类型过滤)
│   │
│   ├── LayersToolbar (层工具栏)
│   │   ├── Expand/Collapse All (展开/折叠全部)
│   │   ├── Selection Controls (选择控制)
│   │   └── Bulk Actions Menu (批量操作菜单)
│   │
│   └── LayersList (层列表)
│       └── LayerItem (层项)
│           ├── LayerCheckbox (层选择框)
│           └── LayerConfig (层配置组件)
│               ├── LayerHeader (层头部 - 可点击展开)
│               │   ├── LayerInfo (层信息)
│               │   └── LayerStatus (层状态徽章)
│               │
│               └── LayerContent (层内容)
│                   ├── Basic Properties Section (基本属性)
│                   ├── Clock Hand Section (时钟指针)
│                   ├── Timezone Section (时区配置)
│                   ├── Visual Effects Section (视觉效果)
│                   ├── Rotation1 Section (旋转配置1)
│                   └── Rotation2 Section (旋转配置2)
│
└── PreviewContainer (预览容器 - 右侧)
    └── PreviewPanel (预览面板)
        ├── PreviewHeader (预览头部)
        ├── PreviewCanvas (预览画布)
        └── PreviewLegend (预览图例)
```

## 状态管理方法

### 1. 配置状态 (Configuration State)

```typescript
const [config, setConfig] = useState<LauncherConfig>(defaultLauncherConfig);
```

- 使用 React `useState` 管理整个配置对象
- 每次层更新时创建新的配置对象（不可变更新）
- 通过 `useEffect` 监听配置变化并执行验证

### 2. UI 状态 (UI State)

```typescript
const [expandedLayers, setExpandedLayers] = useState<Set<number>>(new Set());
const [selectedLayers, setSelectedLayers] = useState<Set<number>>(new Set());
const [searchFilters, setSearchFilters] = useState<SearchFilters>({...});
```

- `expandedLayers`: 跟踪哪些层已展开
- `selectedLayers`: 批量操作时的选中层
- `searchFilters`: 搜索和过滤条件

### 3. 验证状态 (Validation State)

```typescript
const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
const [isDirty, setIsDirty] = useState(false);
```

- 实时验证配置，存储所有错误
- `isDirty` 标记是否有未保存的更改

### 4. 状态更新模式

```typescript
// 不可变更新示例
const updateLayer = useCallback((index: number, updatedLayer: RotateItemConfig) => {
  setConfig((prev) => {
    const newConfig = { ...prev };
    newConfig.rotateConfig = [...prev.rotateConfig];
    newConfig.rotateConfig[index] = updatedLayer;
    return newConfig;
  });
  setIsDirty(true);
}, []);
```

## UI 控件类型选择

### 文本输入 (TextInput)
- **用途**: `itemCode`, `itemName`, `itemPath`
- **类型**: `<input type="text">`
- **特性**: 占位符提示、禁用状态

### 数字输入 (NumberInput)
- **用途**: `itemLayer`, `itemSize`, `utcOffset`, `rotationSpeed`
- **类型**: `<input type="number">`
- **特性**: min/max 约束、step 增量

### 滑块 (Slider)
- **用途**: `itemSize`, `itemTiltPosition`, `itemAxisX/Y`, `itemPositionX/Y`
- **类型**: `<input type="range">`
- **特性**: 实时数值显示、视觉反馈

### 下拉选择 (Select)
- **用途**: `handType`, `handRotation`, `rotationWay`, `enabled` 状态
- **类型**: `<select>`
- **特性**: 支持 null 选项、分组选项

### 切换按钮组 (Toggle)
- **用途**: `itemDisplay`, `visualEffects` 开关、`use24Hour`
- **类型**: 自定义按钮组
- **特性**: 视觉激活状态、互斥选择

## 验证逻辑和错误处理

### 1. 约束常量

```typescript
export const CONSTRAINTS = {
  ITEM_LAYER: { min: 1, max: 20 },
  ITEM_SIZE: { min: 1, max: 100 },
  UTC_OFFSET: { min: -12, max: 12 },
  TILT_POSITION: { min: 0, max: 359 },
  AXIS_POSITION: { min: 0, max: 100 },
  POSITION_OFFSET: { min: -100, max: 100 },
  ROTATION_SPEED: { min: 0.001, max: 10000 },
};
```

### 2. 验证级别

- **Error (错误)**: 阻止保存的严重问题
  - 重复的 `itemCode`
  - 重复的 `itemLayer`
  - 超出范围的数值
  
- **Warning (警告)**: 建议修复但不阻止保存
  - 空的 `itemName`
  - 启用旋转但未设置方向
  - 设置指针类型但未设置旋转模式

### 3. 实时验证

```typescript
useEffect(() => {
  const result = validateConfig(config);
  setValidationErrors(result.errors);
}, [config]);
```

### 4. 字段级验证

```typescript
const validateField = (
  layer: RotateItemConfig,
  field: string,
  value: unknown,
  allLayers: RotateItemConfig[],
  layerIndex: number
): ValidationError | null
```

### 5. 错误显示

- 输入框边框变红
- 字段下方显示错误消息
- 层头部显示错误数量徽章

## 实时预览更新机制

### 1. 预览渲染流程

```
配置变更 → 触发重渲染 → Canvas 绘制 → 显示更新
```

### 2. 动画循环

```typescript
useEffect(() => {
  const animate = () => {
    render();
    animationRef.current = requestAnimationFrame(animate);
  };
  animate();
  
  return () => cancelAnimationFrame(animationRef.current);
}, [render]);
```

### 3. 旋转计算

```typescript
const calculateRotation = (
  layer: RotateItemConfig,
  rotationConfig: 'rotation1' | 'rotation2',
  baseTime: number
): number => {
  let angle = config.itemTiltPosition;
  
  // 添加时间角度（如果是时钟指针）
  if (layer.handType && layer.handRotation === rotationConfig.toUpperCase()) {
    angle += getTimeAngle(layer.handType, layer.timezone.utcOffset);
  }
  
  // 添加基于速度的旋转
  if (config.rotationWay && config.rotationWay !== 'no') {
    const timeFactor = (baseTime / 1000) * config.rotationSpeed * direction;
    angle += timeFactor % 360;
  }
  
  return angle;
};
```

### 4. 视觉效果渲染

- **阴影**: `ctx.shadowColor`, `ctx.shadowBlur`
- **发光**: 白色阴影 + 高模糊值
- **透明**: `ctx.globalAlpha`
- **脉冲**: 正弦波缩放动画

## 无障碍考虑

### 1. 键盘导航

- 所有交互元素可通过 Tab 键访问
- Enter/Space 激活按钮和折叠面板
- 箭头键在选项间导航

### 2. ARIA 属性

```tsx
<div
  role="region"
  aria-expanded={isExpanded}
  aria-label={`Layer ${layer.itemName} configuration`}
>
```

### 3. 焦点样式

```css
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### 4. 减少动画

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5. 高对比度模式

```css
@media (prefers-contrast: high) {
  --border-color: #666;
  --text-secondary: #ccc;
}
```

### 6. 工具提示

- 所有配置字段都有描述性工具提示
- 通过 `FIELD_METADATA` 提供字段说明

## 可选增强功能

### 1. 搜索/过滤层

已实现功能：
- 文本搜索（名称、代码、路径）
- 仅显示可见层
- 仅显示有错误的层
- 按指针类型过滤

### 2. 批量启用/禁用

已实现功能：
- 批量显示/隐藏层
- 批量启用/禁用渲染
- 批量清除视觉效果
- 批量重置旋转配置

### 3. 其他增强建议

- **撤销/重做**: 实现命令模式支持历史记录
- **配置模板**: 提供预设配置模板（模拟时钟、数字时钟等）
- **导入图像**: 拖放上传图像文件
- **预览缩放**: 允许调整预览面板大小
- **导出代码**: 直接生成可复制的配置代码
- **自动保存**: 本地存储自动保存配置
- **层重排序**: 拖放调整层顺序
- **配置对比**: 对比不同版本的配置差异

## 文件结构

```
project/
├── types.ts              # TypeScript 类型定义
├── validation.ts         # 验证逻辑和约束
├── launcher_config.tsx   # 示例配置数据
├── LayerConfig.tsx       # 层配置组件
├── PreviewPanel.tsx      # 预览面板组件
├── ConfigEditor.tsx      # 主编辑器组件
├── styles.css            # 样式文件
├── index.tsx             # 入口导出
├── App.tsx               # 应用入口
└── DESIGN_SPEC.md        # 本文档
```

## 使用示例

```tsx
import { ConfigEditor } from './ConfigEditor';

function App() {
  return <ConfigEditor />;
}
```

## 依赖要求

- React 18+
- TypeScript 4.5+
- 现代浏览器（支持 Canvas 2D Context）
