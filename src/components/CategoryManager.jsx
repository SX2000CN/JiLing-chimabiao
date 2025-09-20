import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Modal from './Modal';
import { 
  createCategory, 
  validateCategory, 
  updateCategory, 
  deleteCategory 
} from '../services/dataManager';

const PanelContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.gray[800]};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary}; /* 使用主题的次要文本颜色，适配深色模式 */
  margin: 0;
`;

const CategoryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px; /* 参考侧栏的间距 */
`;

const StatusText = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${props => props.theme.colors.text.primary};
`;

const CategoryCard = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px; /* 参考侧栏的padding */
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: all 0.2s ease-out;
  user-select: none;

  &:hover {
    border-color: ${props => props.theme.colors.border.dark};
    background: ${props => props.theme.colors.gray[50]};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  ${props => props.$isCustom && `
    border-left: 4px solid ${props.theme.colors.primary};
  `}
`;

const CardHeader = styled.div`
  flex: 1;
  min-width: 0;
`;

const CategoryIcon = styled.div`
  width: 28px;  /* 减小图标尺寸 */
  height: 28px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => {
    switch (props.$type) {
      case 'chest': return '#FF6B6B';
      case 'waist': return '#4ECDC4';
      case 'hip': return '#45B7D1';
      case 'hem': return '#9C88FF';
      case 'shoulder': return '#96CEB4';
      case 'sleeve': return '#FECA57';
      case 'shoulderSleeve': return '#FF8A65';
      case 'length': return '#FF9FF3';
      case 'pantLength': return '#81C784';
      case 'skirtLength': return '#F48FB1';
      case 'backLength': return '#A1887F';
      case 'frontLength': return '#BCAAA4';
      default: return props.theme.colors.gray[400];
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px; /* 减小字体 */
  font-weight: 600;
  color: white;
  
  /* 预留图标扩展 */
  ${props => props.$iconUrl && `
    background-image: url(${props.$iconUrl});
    background-size: cover;
    background-position: center;
  `}
`;

const CardTitle = styled.h3`
  font-size: 15px; /* 参考侧栏字体大小 */
  font-weight: 500;
  color: ${props => props.theme.colors.gray[800]};
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardContent = styled.div`
  font-size: 13px; /* 参考侧栏meta字体大小 */
  color: ${props => props.theme.colors.gray[600]};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardActions = styled.div`
  display: flex;
  gap: 6px; /* 减小按钮间距 */
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${props => props.theme.colors.gray[500]};
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: ${props => props.theme.colors.gray[700]};
  }
  
  .description {
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

/**
 * 类别卡片组件
 */
const CategoryCardComponent = ({ category, onEdit, onDelete }) => {
  // 获取类别首字母用于显示（暂时替代图标）
  const getCategoryDisplay = (category) => {
    if (category.iconUrl) {
      return null; // 如果有图标URL则不显示文字
    }
    return category.name.charAt(0); // 显示首字母
  };

  return (
    <CategoryCard
      $isCustom={category.isCustom}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -1 }}
    >
      <CategoryIcon $type={category.type} $iconUrl={category.iconUrl}>
        {getCategoryDisplay(category)}
      </CategoryIcon>
      
      <CardHeader>
        <CardTitle>{category.name}</CardTitle>
        <CardContent>
          <span>{category.baseValue}cm</span>
          <span>+{category.baseIncrement}cm</span>
          <span>{category.isCustom ? '自定义' : '预设'}</span>
        </CardContent>
      </CardHeader>

      <CardActions>
        {category.isCustom && (
          <>
            <Button
              variant="outline"
              size="small"
              onClick={() => onEdit(category)}
              icon="✏️"
            >
              编辑
            </Button>
            <Button
              variant="danger"
              size="small"
              onClick={() => onDelete(category)}
              icon="🗑️"
            >
              删除
            </Button>
          </>
        )}
      </CardActions>
    </CategoryCard>
  );
};

/**
 * 类别管理面板组件
 */
const CategoryManager = ({ 
  appState, 
  setAppState, 
  onCategoryAdd, 
  onCategoryEdit, 
  onCategoryDelete,
  showHeader = true 
}) => {
  const { categories } = appState;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    baseValue: '',
    baseIncrement: '',
    description: '',
    iconUrl: '' // 添加图标URL字段
  });
  const [formErrors, setFormErrors] = useState({});

  // 类型选项 - 已移除用户选择，改为根据名称自动判断
  const getAutoType = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('胸') || lowerName.includes('chest')) return 'chest';
    if (lowerName.includes('腰') || lowerName.includes('waist')) return 'waist';
    if (lowerName.includes('臀') || lowerName.includes('hip')) return 'hip';
    if (lowerName.includes('下摆') || lowerName.includes('hem')) return 'hem';
    if (lowerName.includes('肩宽') || lowerName.includes('肩') || lowerName.includes('shoulder')) return 'shoulder';
    if (lowerName.includes('袖长') || lowerName.includes('袖') || lowerName.includes('sleeve')) return 'sleeve';
    if (lowerName.includes('肩袖长') || lowerName.includes('肩袖')) return 'shoulderSleeve';
    if (lowerName.includes('衣长') || lowerName.includes('身长')) return 'length';
    if (lowerName.includes('裤长') || lowerName.includes('pant')) return 'pantLength';
    if (lowerName.includes('裙长') || lowerName.includes('skirt')) return 'skirtLength';
    if (lowerName.includes('中后长') || lowerName.includes('后长')) return 'backLength';
    if (lowerName.includes('中前长') || lowerName.includes('前长')) return 'frontLength';
    if (lowerName.includes('长') || lowerName.includes('length')) return 'length';
    return 'other';
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      baseValue: '',
      baseIncrement: '',
      description: '',
      iconUrl: '' // 添加图标URL字段
    });
    setFormErrors({});
  };

  // 处理添加类别
  const handleAddCategory = () => {
    resetForm();
    setEditingCategory(null);
    setShowAddModal(true);
  };

  // 处理编辑类别
  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
      baseValue: category.baseValue.toString(),
      baseIncrement: category.baseIncrement.toString(),
      description: category.description || '',
      iconUrl: category.iconUrl || '' // 添加图标URL字段
    });
    setEditingCategory(category);
    setShowAddModal(true);
  };

  // 处理删除类别
  const handleDeleteCategory = (category) => {
    if (confirm(`确定要删除类别"${category.name}"吗？`)) {
      if (onCategoryDelete) {
        onCategoryDelete(category.id);
      } else {
        // 回退到直接修改state的方式
        const updatedCategories = deleteCategory(categories, category.id);
        setAppState(prev => ({
          ...prev,
          categories: updatedCategories,
          selectedCategories: prev.selectedCategories.filter(cat => cat.id !== category.id)
        }));
      }
    }
  };

  // 保存类别
  const handleSaveCategory = () => {
    const validation = validateCategory(formData);
    setFormErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    try {
      if (editingCategory) {
        // 更新现有类别
        const updatedData = {
          name: formData.name.trim(),
          type: getAutoType(formData.name.trim()), // 自动判断类型
          baseValue: Number(formData.baseValue),
          baseIncrement: Number(formData.baseIncrement),
          description: formData.description.trim(),
          iconUrl: formData.iconUrl.trim() || null // 处理图标URL
        };
        
        if (onCategoryEdit) {
          onCategoryEdit(editingCategory.id, updatedData);
        } else {
          // 回退到直接修改state的方式
          const updatedCategories = updateCategory(categories, editingCategory.id, updatedData);
          setAppState(prev => ({
            ...prev,
            categories: updatedCategories
          }));
        }
      } else {
        // 创建新类别
        const newCategory = createCategory({
          ...formData,
          name: formData.name.trim(),
          type: getAutoType(formData.name.trim()), // 自动判断类型
          baseValue: Number(formData.baseValue),
          baseIncrement: Number(formData.baseIncrement),
          description: formData.description.trim(),
          iconUrl: formData.iconUrl.trim() || null
        });
        
        if (onCategoryAdd) {
          onCategoryAdd(newCategory);
        } else {
          // 回退到直接修改state的方式
          setAppState(prev => ({
            ...prev,
            categories: [...prev.categories, newCategory]
          }));
        }
      }

      setShowAddModal(false);
      resetForm();
      setEditingCategory(null);
    } catch (error) {
      setFormErrors({ general: error.message });
    }
  };

  const customCategories = categories.filter(cat => cat.isCustom);
  const presetCategories = categories.filter(cat => !cat.isCustom);

  return (
    <PanelContainer>
      {showHeader && (
        <PanelHeader>
          <HeaderContent>
            <Title>类别管理</Title>
            <Subtitle>
              管理尺码类别，包括预设类别和自定义类别。
              当前共有 {categories.length} 个类别。
            </Subtitle>
          </HeaderContent>
          
          <Button
            variant="primary"
            onClick={handleAddCategory}
            icon="➕"
            style={{ minWidth: 'auto', flexShrink: 0 }}
          >
            新建类别
          </Button>
        </PanelHeader>
      )}

      {!showHeader && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <StatusText>
            当前共有 {categories.length} 个类别
          </StatusText>
          <Button
            variant="primary"
            size="small"
            onClick={handleAddCategory}
            icon="➕"
            style={{ minWidth: 'auto', flexShrink: 0 }}
          >
            新建类别
          </Button>
        </div>
      )}

      {/* 自定义类别 */}
      {customCategories.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <SectionTitle>
            自定义类别 ({customCategories.length})
          </SectionTitle>
          <CategoryGrid>
            <AnimatePresence>
              {customCategories.map(category => (
                <CategoryCardComponent
                  key={category.id}
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              ))}
            </AnimatePresence>
          </CategoryGrid>
        </div>
      )}

      {/* 预设类别 */}
      <div>
        <SectionTitle>
          预设类别 ({presetCategories.length})
        </SectionTitle>
        <CategoryGrid>
          {presetCategories.map(category => (
            <CategoryCardComponent
              key={category.id}
              category={category}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
        </CategoryGrid>
      </div>

      {categories.length === 0 && (
        <EmptyState>
          <div className="icon">📁</div>
          <div className="title">暂无类别</div>
          <div className="description">
            还没有任何尺码类别，点击上方按钮创建第一个类别。
          </div>
          <Button
            variant="primary"
            onClick={handleAddCategory}
            icon="➕"
          >
            创建类别
          </Button>
        </EmptyState>
      )}

      {/* 添加/编辑类别模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
          setEditingCategory(null);
        }}
        title={editingCategory ? '编辑类别' : '新建类别'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="类别名称"
            placeholder="输入类别名称（如：胸围、腰围、袖长等）"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={formErrors.name}
            help="系统会根据名称自动识别类别类型"
          />

          <Input
            label="基础数值 (cm)"
            type="number"
            placeholder="输入基础数值"
            value={formData.baseValue}
            onChange={(e) => setFormData(prev => ({ ...prev, baseValue: e.target.value }))}
            error={formErrors.baseValue}
          />

          <Input
            label="递增数值 (cm)"
            type="number"
            placeholder="输入递增数值"
            value={formData.baseIncrement}
            onChange={(e) => setFormData(prev => ({ ...prev, baseIncrement: e.target.value }))}
            error={formErrors.baseIncrement}
          />

          <Input
            label="描述 (可选)"
            placeholder="输入类别描述"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />

          {/* 预留：高级选项区域，暂时隐藏图标设置 */}
          {false && (
            <Input
              label="图标URL (可选)"
              placeholder="输入图标图片的URL地址"
              value={formData.iconUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
              help="留空将显示首字母，支持 jpg、png、svg 格式"
            />
          )}

          {formErrors.general && (
            <div style={{ color: '#EF4444', fontSize: '14px' }}>
              {formErrors.general}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
                setEditingCategory(null);
              }}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveCategory}
            >
              {editingCategory ? '保存' : '创建'}
            </Button>
          </div>
        </div>
      </Modal>
    </PanelContainer>
  );
};

export default CategoryManager;
