import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import { generateSizeSequence } from '../services/sizeCalculator';

const PanelContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const PanelHeader = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.gray[800]};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.gray[600]};
  margin: 0;
  line-height: 1.5;
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
`;

const SettingRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const CompactRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 80px 1fr;
  gap: 12px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.gray[700]};
  padding-top: 8px;
  white-space: nowrap;

  @media (max-width: 640px) {
    padding-top: 0;
    font-size: 12px;
  }
`;

const PreviewSection = styled(motion.div)`
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 16px;
  margin-bottom: 20px;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const SettingsControls = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
`;

const CompactControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;

  @media (max-width: 480px) {
    min-width: auto;
  }
`;

const PreviewTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.gray[700]};
  margin: 0;
`;

const SizePreview = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const SizeTag = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${props => props.theme.colors.primary}30;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 14px;
  margin-top: 8px;
  padding: 12px;
  background: ${props => props.theme.colors.error}10;
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.error}30;
`;

const StartValuesSection = styled(motion.div)`
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 16px;
  margin-bottom: 20px;
`;

const StartValuesGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const CategoryRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const CategoryIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.color || props.theme.colors.primary}20;
  color: ${props => props.color || props.theme.colors.primary};
  border: 2px solid ${props => props.color || props.theme.colors.primary}30;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.gray[800]};
  margin-bottom: 2px;
`;

const CategoryType = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.gray[500]};
`;

const ValueInput = styled(Input)`
  width: 100px;
  flex-shrink: 0;
`;

const UnitLabel = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.gray[600]};
  font-weight: 500;
`;

/**
 * 尺码设置面板组件
 */
const SizeSettings = ({ appState, setAppState }) => {
  const { sizeSettings, selectedCategories, categoryStartValues, categories, mode } = appState;
  const { startSize, count } = sizeSettings;
  
  // Tab键焦点循环处理
  const handleStartValueKeyDown = (event, currentIndex) => {
    if (event.key === 'Tab') {
      event.preventDefault();

      const inputElements = document.querySelectorAll('[data-start-value-input]');
      const totalInputs = inputElements.length;

      if (totalInputs === 0) return;

      let nextIndex;
      if (event.shiftKey) {
        // Shift+Tab: 向前循环
        nextIndex = currentIndex === 0 ? totalInputs - 1 : currentIndex - 1;
      } else {
        // Tab: 向后循环
        nextIndex = currentIndex === totalInputs - 1 ? 0 : currentIndex + 1;
      }

      // 聚焦到下一个输入框并全选内容
      const nextInput = inputElements[nextIndex];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  // 输入框获得焦点时全选内容
  const handleStartValueFocus = (event) => {
    event.target.select();
  };

  // 输入框失去焦点时，如果内容为空则恢复默认值
  const handleStartValueBlur = (categoryId) => {
    const savedValue = categoryStartValues[categoryId];
    // 如果值为空字符串，删除自定义值以使用默认值
    if (savedValue === '') {
      setAppState(prev => {
        const newStartValues = { ...prev.categoryStartValues };
        delete newStartValues[categoryId];
        return {
          ...prev,
          categoryStartValues: newStartValues
        };
      });
    }
  };
  
  // 计算在当前模式下的实际递增值
  const getActualIncrement = (category) => {
    let increment = category.baseIncrement;
    if (mode === 'sweater' && category.baseIncrement >= 4) {
      increment = category.baseIncrement / 2;
    }
    return increment;
  };
  
  const [errors, setErrors] = useState({});

  // 尺码选项
  const sizeOptions = [
    { label: 'XS', value: 'XS' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: '2XL', value: '2XL' },
    { label: '3XL', value: '3XL' },
    { label: '4XL', value: '4XL' }
  ];

  // 更新尺码设置
  const updateSizeSettings = useCallback((updates) => {
    const newSettings = { ...sizeSettings, ...updates };
    
    setAppState(prev => ({
      ...prev,
      sizeSettings: newSettings
    }));

    // 清除相关错误
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      if (newErrors[key]) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  }, [sizeSettings, errors, setAppState]);

  // 更新类别起始值
  const updateCategoryStartValue = useCallback((categoryId, value) => {
    // 直接存储字符串值，允许用户输入过程中的中间状态
    const newStartValues = { ...categoryStartValues };

    if (value === '') {
      // 允许空字符串作为中间状态（用户正在清空输入框）
      // 只在失去焦点(onBlur)时才恢复默认值
      newStartValues[categoryId] = '';
    } else {
      // 验证输入是否为有效的数字格式（包括中间状态如 "9." "9.5"）
      const isValidInput = /^\d*\.?\d*$/.test(value) && value !== '.';

      if (isValidInput) {
        // 如果是完整的有效数字，存储数值；否则保持字符串状态
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value.slice(-1) !== '.') {
          newStartValues[categoryId] = numValue;
        } else {
          // 保持输入状态（如用户正在输入 "9." 这样的中间状态）
          newStartValues[categoryId] = value;
        }
      }
    }

    setAppState(prev => ({
      ...prev,
      categoryStartValues: newStartValues
    }));
  }, [categoryStartValues, setAppState]);

  // 获取类别的当前起始值
  const getCategoryStartValue = useCallback((category) => {
    const savedValue = categoryStartValues[category.id];
    if (savedValue !== undefined) {
      // 如果是字符串类型（输入中间状态），直接返回
      if (typeof savedValue === 'string') {
        return savedValue;
      }
      // 如果是数字类型，返回数字
      return savedValue;
    }
    // 没有自定义值时，返回默认值
    return category.baseValue;
  }, [categoryStartValues]);

  // 获取类别图标文字
  const getCategoryIcon = (category) => {
    const name = category.name;
    if (name.length >= 2) {
      return name.substring(0, 2);
    }
    return name.charAt(0).toUpperCase() || '?';
  };

  // 生成尺码序列预览
  const generatedSizes = useMemo(() => {
    try {
      return generateSizeSequence(startSize, count);
    } catch (error) {
      return [];
    }
  }, [startSize, count]);

  // 重置设置
  const handleReset = useCallback(() => {
    updateSizeSettings({
      startSize: 'S',
      count: 4
    });
    // 同时清空自定义起始值
    setAppState(prev => ({
      ...prev,
      categoryStartValues: {}
    }));
    setErrors({});
  }, [updateSizeSettings, setAppState]);

  return (
    <PanelContainer>
      {/* 尺码预览 - 合并设置功能 */}
      <PreviewSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PreviewHeader>
          <PreviewTitle>尺码设置</PreviewTitle>
          <SettingsControls>
            <CompactControlGroup>
              <Label>起始尺码</Label>
              <Select
                placeholder="选择起始尺码"
                options={sizeOptions}
                value={startSize}
                onChange={(value) => updateSizeSettings({ startSize: value })}
                error={errors.startSize}
                size="small"
              />
            </CompactControlGroup>
            <CompactControlGroup>
              <Label>尺码数量</Label>
              <Input
                type="number"
                placeholder="输入数量"
                value={count}
                onChange={(e) => updateSizeSettings({ count: parseInt(e.target.value) || 1 })}
                min={1}
                max={8}
                error={errors.count}
                size="small"
              />
            </CompactControlGroup>
          </SettingsControls>
        </PreviewHeader>
        
        {generatedSizes.length > 0 && (
          <SizePreview>
            {generatedSizes.map((size, index) => (
              <SizeTag
                key={size}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                {size}
              </SizeTag>
            ))}
          </SizePreview>
        )}
      </PreviewSection>

      {/* 类别起始值设置 */}
      {selectedCategories.length > 0 && (
        <StartValuesSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <PreviewTitle>类别起始值设置</PreviewTitle>
          <StartValuesGrid>
            {selectedCategories.map((category, index) => (
              <CategoryRow
                key={category.id}
                as={motion.div}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                <CategoryIcon color={category.color}>
                  {getCategoryIcon(category)}
                </CategoryIcon>
                
                <CategoryInfo>
                  <CategoryName>{category.name}</CategoryName>
                  <CategoryType>递增：{getActualIncrement(category)}cm</CategoryType>
                </CategoryInfo>
                
                <ValueInput
                  type="number"
                  step="0.5"
                  min="0"
                  max="200"
                  value={getCategoryStartValue(category)}
                  onChange={(e) => updateCategoryStartValue(category.id, e.target.value)}
                  onKeyDown={(e) => handleStartValueKeyDown(e, index)}
                  onFocus={handleStartValueFocus}
                  onBlur={() => handleStartValueBlur(category.id)}
                  placeholder={`默认 ${category.baseValue}`}
                  size="small"
                  autoComplete="off"
                  data-start-value-input
                />
                
                <UnitLabel>cm</UnitLabel>
              </CategoryRow>
            ))}
          </StartValuesGrid>
        </StartValuesSection>
      )}

      {/* 错误信息 */}
      {Object.keys(errors).length > 0 && (
        <ErrorMessage>
          <strong>设置错误：</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </ErrorMessage>
      )}
    </PanelContainer>
  );
};

export default SizeSettings;
