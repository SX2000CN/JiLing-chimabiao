import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TableContainer = styled.div`
  width: 100%;
  overflow: auto;
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  background: ${props => props.theme.colors.background.primary};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  font-size: 14px;
`;

const TableHead = styled.thead`
  background: ${props => props.theme.colors.gray[50]};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const TableBody = styled.tbody``;

const TableRow = styled(motion.tr)`
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  transition: background-color 0.15s ease-out;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.colors.gray[25] || '#fafafa'};
  }

  ${props => props.$selected && `
    background: ${props.theme.colors.primary}1a;
    
    &:hover {
      background: ${props.theme.colors.primary}2a;
    }
  `}

  ${props => props.$clickable && `
    cursor: pointer;
  `}
`;

const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: ${props => props.$align || 'left'};
  font-weight: 600;
  color: ${props => props.theme.colors.gray[700]};
  background: ${props => props.theme.colors.gray[50]};
  white-space: nowrap;
  user-select: none;

  ${props => props.$sortable && `
    cursor: pointer;
    position: relative;
    
    &:hover {
      background: ${props.theme.colors.gray[100]};
    }
    
    &::after {
      content: '';
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      opacity: 0.3;
      
      ${props.$sortDirection === 'asc' && `
        border-bottom: 4px solid currentColor;
        opacity: 1;
      `}
      
      ${props.$sortDirection === 'desc' && `
        border-top: 4px solid currentColor;
        opacity: 1;
      `}
    }
  `}

  ${props => props.$width && `
    width: ${props.$width};
  `}
`;

const TableCell = styled.td`
  padding: 12px 16px;
  text-align: ${props => props.$align || 'left'};
  color: ${props => props.theme.colors.gray[600]};
  vertical-align: middle;
  
  ${props => props.$width && `
    width: ${props.$width};
  `}

  ${props => props.$bold && `
    font-weight: 600;
    color: ${props.theme.colors.gray[700]};
  `}

  ${props => props.$muted && `
    color: ${props.theme.colors.gray[400]};
    font-size: 13px;
  `}
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: ${props => props.theme.colors.gray[400]};
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
    color: ${props => props.theme.colors.gray[600]};
  }
  
  .description {
    font-size: 14px;
  }
`;

const LoadingState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: ${props => props.theme.colors.gray[400]};
  
  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid ${props => props.theme.colors.gray[200]};
    border-top: 2px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/**
 * macOS 风格表格组件
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  empty,
  sortable = false,
  selectable = false,
  selectedRows = [],
  onRowClick,
  onSort,
  className,
  ...props
}) => {
  const [sortColumn, setSortColumn] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');

  const handleSort = (column) => {
    if (!sortable || !column.sortable) {
      return;
    }

    let newDirection = 'asc';
    if (sortColumn === column.key) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortColumn(column.key);
    setSortDirection(newDirection);
    onSort?.(column.key, newDirection);
  };

  const handleRowClick = (row, index) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  const isRowSelected = (row, index) => {
    if (!selectable) {
      return false;
    }
    return selectedRows.includes(row.id || index);
  };

  // 渲染单元格内容
  const renderCellContent = (column, row, rowIndex) => {
    if (column.render) {
      return column.render(row[column.key], row, rowIndex);
    }
    return row[column.key];
  };

  // 空状态组件
  const EmptyComponent = () => (
    <EmptyState>
      <div className="icon">📊</div>
      <div className="title">暂无数据</div>
      <div className="description">
        {empty?.description || '当前没有可显示的数据'}
      </div>
    </EmptyState>
  );

  // 加载状态组件
  const LoadingComponent = () => (
    <LoadingState>
      <div className="spinner"></div>
      <div>加载中...</div>
    </LoadingState>
  );

  if (loading) {
    return (
      <TableContainer className={className} {...props}>
        <LoadingComponent />
      </TableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <TableContainer className={className} {...props}>
        <EmptyComponent />
      </TableContainer>
    );
  }

  return (
    <TableContainer className={className} {...props}>
      <StyledTable>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableHeader
                key={column.key}
                $align={column.align}
                $width={column.width}
                $sortable={sortable && column.sortable}
                $sortDirection={sortColumn === column.key ? sortDirection : null}
                onClick={() => handleSort(column)}
              >
                {column.title}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row.id || index}
              $selected={isRowSelected(row, index)}
              $clickable={Boolean(onRowClick)}
              onClick={() => handleRowClick(row, index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.02,
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
              whileHover={onRowClick ? { scale: 1.005 } : {}}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  $align={column.align}
                  $width={column.width}
                  $bold={column.bold}
                  $muted={column.muted}
                >
                  {renderCellContent(column, row, index)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};

export default Table;
