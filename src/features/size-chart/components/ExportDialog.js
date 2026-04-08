import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { exportSizeTableToImage, downloadImage } from '../../../services/tableExporter';

const ExportPanel = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  min-width: 400px;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  z-index: 999;
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PreviewContainer = styled.div`
  width: 200px;
  height: 200px;
  border: 1px solid #e5e5e7;
  border-radius: 8px;
  margin: 16px 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007aff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled(motion.button)`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  ${props => props.primary ? `
    background: #007aff;
    color: white;
    
    &:hover {
      background: #0056cc;
    }
  ` : `
    background: #f2f2f7;
    color: #1d1d1f;
    
    &:hover {
      background: #e5e5ea;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExportDialog = ({ isOpen, onClose, tableData }) => {
  const [filename, setFilename] = useState('size-chart');
  const [tipText, setTipText] = useState('温馨提示:由于手工测量会存在1-3cm误差，属于正常范围');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 生成预览
  const generatePreview = async () => {
    if (!tableData || tableData.length === 0) {
      return;
    }
    
    setIsGenerating(true);
    try {
      const imageUrl = exportSizeTableToImage(tableData, tipText);
      setPreviewUrl(imageUrl);
    } catch (error) {
      console.error('生成预览失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载图片
  const handleDownload = () => {
    if (previewUrl) {
      downloadImage(previewUrl, `${filename}.jpg`);
    }
  };

  // 当对话框打开时自动生成预览
  React.useEffect(() => {
    if (isOpen && tableData) {
      generatePreview();
    }
  }, [isOpen, tableData, tipText]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <ExportPanel
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <Title>
          📸 导出尺码表
        </Title>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#86868b' }}>
            文件名
          </label>
          <Input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="请输入文件名"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#86868b' }}>
            温馨提示
          </label>
          <Input
            type="text"
            value={tipText}
            onChange={(e) => setTipText(e.target.value)}
            placeholder="请输入温馨提示文字"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#86868b' }}>
            预览 (600x600)
          </label>
          <PreviewContainer>
            {isGenerating ? (
              <div style={{ color: '#86868b', fontSize: '14px' }}>生成中...</div>
            ) : previewUrl ? (
              <PreviewImage src={previewUrl} alt="尺码表预览" />
            ) : (
              <div style={{ color: '#86868b', fontSize: '14px' }}>暂无预览</div>
            )}
          </PreviewContainer>
        </div>

        <div style={{ fontSize: '12px', color: '#86868b', lineHeight: '1.4' }}>
          • 图片尺寸：600x600像素<br/>
          • 单元格比例：10:6<br/>
          • 背景：白色，表头：黑底白字<br/>
          • 自动居中显示，左右或上下铺满
        </div>

        <ButtonGroup>
          <Button onClick={onClose}>
            取消
          </Button>
          <Button onClick={generatePreview} disabled={isGenerating}>
            重新生成
          </Button>
          <Button 
            primary 
            onClick={handleDownload}
            disabled={!previewUrl || isGenerating}
          >
            下载图片
          </Button>
        </ButtonGroup>
      </ExportPanel>
    </>
  );
};

export default ExportDialog;
