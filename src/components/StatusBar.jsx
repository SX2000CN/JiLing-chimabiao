import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { calculateStatistics } from '../services/sizeCalculator';

const StatusBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  background: ${props => props.theme.colors.background.secondary};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  padding: 0 16px;
  font-size: 12px;
  color: ${props => props.theme.colors.gray[600]};
  user-select: none;
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusIcon = styled.span`
  font-size: 10px;
`;

const Separator = styled.div`
  width: 1px;
  height: 12px;
  background: ${props => props.theme.colors.border.light};
`;

const ProgressIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 6px;
  
  .spinner {
    width: 12px;
    height: 12px;
    border: 1px solid ${props => props.theme.colors.gray[300]};
    border-top: 1px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/**
 * 状态栏组件
 */
const StatusBar = ({ appState, exportStatus }) => {
  const { 
    selectedCategories, 
    chartData, 
    isGenerating,
    sizeSettings 
  } = appState;

  // 计算统计信息
  const stats = chartData ? calculateStatistics(chartData) : null;

  // 获取当前状态信息
  const getStatusInfo = () => {
    // 优先显示导出状态
    if (exportStatus && exportStatus.show) {
      return { 
        text: exportStatus.message, 
        type: exportStatus.type,
        isExport: true 
      };
    }
    
    if (isGenerating) {
      return { text: '正在生成尺码表...', type: 'generating' };
    }
    
    if (chartData) {
      return { text: '尺码表已生成', type: 'ready' };
    }
    
    if (selectedCategories.length === 0) {
      return { text: '请选择类别', type: 'idle' };
    }
    
    return { text: '准备生成', type: 'ready' };
  };

  const { text: statusText, type: statusType, isExport } = getStatusInfo();

  return (
    <StatusBarContainer>
      <StatusSection>
        {/* 当前状态 */}
        {isGenerating ? (
          <ProgressIndicator
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="spinner" />
            <span>{statusText}</span>
          </ProgressIndicator>
        ) : (
          <StatusItem>
            <StatusIcon>
              {isExport ? (
                statusType === 'success' ? '✅' : 
                statusType === 'error' ? '❌' : '📤'
              ) : (
                statusType === 'ready' ? '✅' : 
                statusType === 'idle' ? '⏸️' : '⚠️'
              )}
            </StatusIcon>
            <span style={{
              color: isExport && statusType === 'success' ? '#22c55e' :
                     isExport && statusType === 'error' ? '#ef4444' : 'inherit'
            }}>
              {statusText}
            </span>
          </StatusItem>
        )}

        <Separator />

        {/* 选择信息 */}
        <StatusItem>
          <StatusIcon>📋</StatusIcon>
          <span>{selectedCategories.length} 个类别</span>
        </StatusItem>

        {/* 尺码设置 */}
        <StatusItem>
          <StatusIcon>📏</StatusIcon>
          <span>
            {sizeSettings.startSize} 起 {sizeSettings.count} 码
          </span>
        </StatusItem>
      </StatusSection>

      <StatusSection>
        {/* 统计信息 */}
        {stats && (
          <>
            <StatusItem>
              <StatusIcon>📊</StatusIcon>
              <span>
                {stats.totalCategories} 类别 × {stats.totalSizes} 尺码
              </span>
            </StatusItem>

            {stats.sizeRange && (
              <>
                <Separator />
                <StatusItem>
                  <StatusIcon>🔢</StatusIcon>
                  <span>{stats.sizeRange}</span>
                </StatusItem>
              </>
            )}
          </>
        )}
      </StatusSection>
    </StatusBarContainer>
  );
};

export default StatusBar;
