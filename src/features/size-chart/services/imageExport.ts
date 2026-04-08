import { formatSizeDataForTable } from '../../../services/sizeCalculator';
import { exportSizeTableToImage, downloadImage } from '../../../services/tableExporter';
import type { CategorySizeData } from '../../../shared/types';

const DEFAULT_TIP_TEXT = '温馨提示:由于手工测量会存在1-3cm误差，属于正常范围';

export interface ExportChartImageOptions {
  chartData: CategorySizeData[];
  exportPath?: string | null;
  mode?: 'normal' | 'sweater';
  filenamePrefix?: string;
}

export const formatChartDataForImageExport = (
  chartData: CategorySizeData[]
) => {
  if (!chartData || chartData.length === 0) {
    return [];
  }

  const { headers, rows } = formatSizeDataForTable(chartData);

  return rows.map((row) => {
    const result: Record<string, string | number> = {};

    headers.forEach((header, index) => {
      result[header] = row[index] || '';
    });

    return result;
  });
};

export const buildChartImageDataUrl = (
  chartData: CategorySizeData[],
  mode: 'normal' | 'sweater' = 'normal'
): string => {
  if (!chartData || chartData.length === 0) {
    throw new Error('请先生成尺码表数据');
  }

  const tableData = formatChartDataForImageExport(chartData);
  const tipText = mode === 'sweater' ? DEFAULT_TIP_TEXT : DEFAULT_TIP_TEXT;
  const imageDataUrl = exportSizeTableToImage(tableData, tipText);

  if (!imageDataUrl) {
    throw new Error('生成导出图片失败');
  }

  return imageDataUrl;
};

export const exportChartImage = async ({
  chartData,
  exportPath = null,
  mode = 'normal',
  filenamePrefix = '尺码表',
}: ExportChartImageOptions): Promise<string | null> => {
  if (!chartData || chartData.length === 0) {
    throw new Error('请先生成尺码表数据');
  }

  const imageDataUrl = buildChartImageDataUrl(chartData, mode);

  if (exportPath) {
    return downloadImage(imageDataUrl, exportPath, filenamePrefix);
  }

  const filename = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}`;
  return downloadImage(imageDataUrl, null, filename);
};
