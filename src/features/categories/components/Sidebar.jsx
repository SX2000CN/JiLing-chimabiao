import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../../../shared/ui/Input';
import Button from '../../../shared/ui/Button';
import SegmentedControl from '../../../shared/ui/SegmentedControl';
import { searchCategories } from '../../../services/dataManager';
import { useAppStore } from '../../../stores/useAppStore';

const SidebarContainer = styled.div`
  width: 240px;
  min-width: 240px;
  max-width: 240px;
  background: ${(props) => props.theme.colors.background.primary};
  border-right: 1px solid ${(props) => props.theme.colors.border.light};
  /* 底部分割线统一由 StatusBar 顶部绘制，避免局部遮挡 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  min-height: 0;
`;

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border.light};
`;

/* 模式选择器区域 */
const ModeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const ModeLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.gray[600]};
  white-space: nowrap;
`;

/* 设置按钮 - 位于模式选择器右侧 */
const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: ${(props) => props.theme.borderRadius.sm};
  cursor: pointer;
  color: ${(props) => props.theme.colors.gray[500]};
  transition: all 0.15s ease;
  margin-left: auto; /* 推到右侧 */
  flex-shrink: 0;
  outline: none;

  &:hover {
    background: ${(props) => props.theme.colors.gray[100]};
    color: ${(props) => props.theme.colors.gray[700]};
  }

  &:active {
    background: ${(props) => props.theme.colors.gray[200]};
  }

  &:focus {
    outline: none;
  }

  svg {
    width: 16px;
    height: 16px;
    stroke-width: 1.5;
  }
`;

/* 设置图标 - SVG 齿轮 */
const SettingsIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='12' cy='12' r='3' />
    <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' />
  </svg>
);

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const SectionContainer = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[600]};
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px; /* 从4px增加到6px，增加视觉呼吸感 */

  /* 高质量渲染 */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  contain: layout style paint;
`;

const CategoryItemContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px; /* 从8px增加到12px，给图标更多空间 */
  padding: 10px 14px; /* 从8px 12px增加到10px 14px */
  border-radius: ${(props) => props.theme.borderRadius.lg}; /* 使用更大的圆角 */
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); /* 更流畅的缓动 */
  user-select: none;
  position: relative;
  color: ${(props) =>
    props.theme.colors
      .gray[700]}; /* 添加默认文字颜色，从gray[600]改为gray[700]使其更清晰 */

  /* 高质量渲染基础 */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  will-change: transform, background-color;

  &:hover {
    background: ${(props) => props.theme.colors.gray[50]};
    color: ${(props) => props.theme.colors.gray[800]}; /* 悬停时文字更深一些 */
    transform: translateY(-1px) translateZ(0); /* 轻微上浮效果 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  ${(props) =>
    props.$selected &&
    `
    background: ${props.theme.colors.primary};
    color: white;
    box-shadow: 0 2px 12px rgba(0, 122, 255, 0.3);
    
    &:hover {
      background: ${props.theme.colors.primary}dd;
      color: white; /* 确保选中状态悬停时文字保持白色 */
      transform: translateY(-1px) translateZ(0);
      box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
    }
  `}

  &:active {
    transform: scale(0.98) translateZ(0);
    transition-duration: 0.1s;
  }
`;

const CategoryIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: ${(props) => props.theme.borderRadius.md};
  /* 统一使用低饱和度深灰蓝色 - 参考 macOS Finder 风格 */
  background: #64748b; /* slate-500 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px; /* 优化字号 */
  color: rgba(255, 255, 255, 0.95); /* 柔和白色 */
  font-weight: 700; /* 增强字重提高锐利度 */
  flex-shrink: 0;

  /* 高质量图标渲染 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;

  /* 图标内容优化 */
  font-family:
    'MiSans',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  letter-spacing: -0.01em;

  /* 预留图标扩展 */
  ${(props) =>
    props.$iconUrl &&
    `
    background-image: url(${props.$iconUrl});
    background-size: cover;
    background-position: center;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  `}

  /* 悬停效果 */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* 高DPI优化 */
  @media (-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi) {
    width: 30px;
    height: 30px;
    font-size: 12px;
    transform: translateZ(0);
  }
`;

const CategoryInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CategoryName = styled.div`
  font-size: 15px; /* 从14px增加到15px */
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* 高质量文字渲染 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'liga', 'kern';
  letter-spacing: 0.01em; /* 轻微增加字母间距 */

  /* 高DPI优化 */
  @media (-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi) {
    font-size: 16px;
    font-weight: 500;
    text-rendering: geometricPrecision;
  }

  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    font-size: 17px;
  }
`;

const CategoryMeta = styled.div`
  font-size: 13px; /* 从12px增加到13px */
  opacity: 0.75; /* 从0.7增加到0.75，提高可读性 */
  display: flex;
  align-items: center;
  gap: 8px;

  /* 高质量文字渲染 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'tnum'; /* 表格数字 */

  /* 高DPI优化 */
  @media (-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi) {
    font-size: 14px;
  }
`;

const CategoryBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: 11px;
  font-weight: 500;
`;

const SelectionCounter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${(props) => props.theme.colors.gray[50]};
  /* 顶部分割线 - 与上方的类别列表分隔 */
  border-top: 1px solid ${(props) => props.theme.colors.border.light};
  font-size: 13px;
  color: ${(props) => props.theme.colors.gray[600]};
`;

const ClearButton = styled(Button)`
  font-size: 12px;
  padding: 4px 8px;
`;

/**
 * 类别列表项组件
 */
const CategoryItem = ({ category, isSelected, onToggle, mode }) => {
  const handleClick = () => {
    onToggle(category.id);
  };

  // 计算在当前模式下的实际递增值
  const getActualIncrement = (category) => {
    let increment = category.baseIncrement;
    if (mode === 'sweater' && category.baseIncrement >= 4) {
      increment = category.baseIncrement / 2;
    }
    return increment;
  };

  // 获取类别显示内容（优化的图标字符）
  const getCategoryDisplay = (category) => {
    if (category.iconUrl) {
      return null; // 如果有图标URL则不显示文字
    }

    // 根据类别类型返回更清晰的图标字符
    switch (category.type) {
    case 'chest':
      return '胸';
    case 'waist':
      return '腰';
    case 'hip':
      return '臀';
    case 'hem':
      return '摆';
    case 'shoulder':
      return '肩';
    case 'sleeve':
      return '袖';
    case 'shoulderSleeve':
      return '肩袖';
    case 'length':
      return '衣';
    case 'pantLength':
      return '裤';
    case 'skirtLength':
      return '裙';
    case 'backLength':
      return '后';
    case 'frontLength':
      return '前';
    default:
      return category.name.charAt(0); // 默认显示首字母
    }
  };

  return (
    <CategoryItemContainer
      $selected={isSelected}
      onClick={handleClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <CategoryIcon $type={category.type} $iconUrl={category.iconUrl}>
        {getCategoryDisplay(category)}
      </CategoryIcon>

      <CategoryInfo>
        <CategoryName>{category.name}</CategoryName>
        <CategoryMeta>
          <span>基础 {category.baseValue}cm</span>
          <CategoryBadge>+{getActualIncrement(category)}cm</CategoryBadge>
        </CategoryMeta>
      </CategoryInfo>
    </CategoryItemContainer>
  );
};

/**
 * 类别区域组件
 */
const CategorySection = ({
  title,
  categories,
  selectedIds,
  onToggle,
  mode,
}) => {
  if (categories.length === 0) {
    return null;
  }

  return (
    <SectionContainer>
      <SectionTitle>{title}</SectionTitle>
      <CategoryList>
        <AnimatePresence>
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isSelected={selectedIds.includes(category.id)}
              onToggle={onToggle}
              mode={mode}
            />
          ))}
        </AnimatePresence>
      </CategoryList>
    </SectionContainer>
  );
};

/**
 * 侧边栏组件
 */
const Sidebar = ({ onSettings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const categories = useAppStore((state) => state.categories);
  const selectedCategories = useAppStore((state) => state.selectedCategories);
  const mode = useAppStore((state) => state.mode);
  const setMode = useAppStore((state) => state.setMode);
  const setSelectedCategories = useAppStore(
    (state) => state.setSelectedCategories
  );

  // 模式选项
  const modeOptions = [
    { label: '普通', value: 'normal' },
    { label: '毛衣', value: 'sweater' },
  ];

  // 处理模式切换
  const handleModeChange = useCallback(
    (newMode) => {
      setMode(newMode);
    },
    [setMode]
  );

  // 处理搜索
  const filteredCategories = searchCategories(categories, searchQuery);

  // 分组类别
  const presetCategories = filteredCategories.filter((cat) => !cat.isCustom);
  const customCategories = filteredCategories.filter((cat) => cat.isCustom);

  // 获取选中的类别 ID 列表
  const selectedIds = selectedCategories.map((cat) => cat.id);

  // 处理类别选择切换
  const handleToggleCategory = useCallback(
    (categoryId) => {
      const category = categories.find((cat) => cat.id === categoryId);
      if (!category) {
        return;
      }

      const isSelected = selectedIds.includes(categoryId);

      let newSelectedCategories;
      if (isSelected) {
        // 取消选择
        newSelectedCategories = selectedCategories.filter(
          (cat) => cat.id !== categoryId
        );
      } else {
        // 添加选择
        newSelectedCategories = [...selectedCategories, category];
      }

      setSelectedCategories(newSelectedCategories);
    },
    [categories, selectedIds, selectedCategories, setSelectedCategories]
  );

  // 清空选择
  const handleClearSelection = useCallback(() => {
    setSelectedCategories([]);
  }, [setSelectedCategories]);

  // 全选预设类别
  const handleSelectAllPreset = useCallback(() => {
    setSelectedCategories(presetCategories);
  }, [presetCategories, setSelectedCategories]);

  return (
    <SidebarContainer>
      <SidebarHeader>
        {/* 模式选择器和设置按钮 */}
        <ModeSection>
          <ModeLabel>模式:</ModeLabel>
          <SegmentedControl
            options={modeOptions}
            value={mode}
            onChange={handleModeChange}
            size='small'
          />
          <SettingsButton onClick={onSettings} title='设置'>
            <SettingsIcon />
          </SettingsButton>
        </ModeSection>

        {/* 搜索框 */}
        <Input
          placeholder='搜索类别...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon='🔍'
          size='small'
        />
      </SidebarHeader>

      <SidebarContent>
        <CategorySection
          title='预设类别'
          categories={presetCategories}
          selectedIds={selectedIds}
          onToggle={handleToggleCategory}
          mode={mode}
        />

        {customCategories.length > 0 && (
          <CategorySection
            title='自定义类别'
            categories={customCategories}
            selectedIds={selectedIds}
            onToggle={handleToggleCategory}
            mode={mode}
          />
        )}

        {filteredCategories.length === 0 && searchQuery && (
          <div
            style={{
              textAlign: 'center',
              color: '#6B7280',
              padding: '24px',
              fontSize: '14px',
            }}
          >
            未找到匹配的类别
          </div>
        )}
      </SidebarContent>

      <SelectionCounter>
        <span>已选择 {selectedCategories.length} 个类别</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {presetCategories.length > 0 && (
            <ClearButton
              variant='ghost'
              size='small'
              onClick={handleSelectAllPreset}
            >
              全选预设
            </ClearButton>
          )}
          {selectedCategories.length > 0 && (
            <ClearButton
              variant='ghost'
              size='small'
              onClick={handleClearSelection}
            >
              清空
            </ClearButton>
          )}
        </div>
      </SelectionCounter>
    </SidebarContainer>
  );
};

export default Sidebar;
