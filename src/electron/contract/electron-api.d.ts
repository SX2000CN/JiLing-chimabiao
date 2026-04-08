export {};

declare global {
  interface ElectronAPI {
    platform?: string;
    exportSizeChart?: (sizeChart: unknown, options?: unknown) => Promise<unknown>;
    restart?: () => Promise<unknown>;
    logError?: (errorInfo: unknown) => Promise<unknown>;
    selectDirectory?: (options?: unknown) => Promise<{ canceled?: boolean; filePaths?: string[] }>;
    showNotification?: (options: unknown) => Promise<unknown>;
    fileExists?: (filePath: string) => Promise<unknown>;
    saveImageToPath?: (filePath: string, base64Data: string) => Promise<unknown>;
    window?: {
      close?: () => Promise<unknown>;
      minimize?: () => Promise<unknown>;
      toggleMaximize?: () => Promise<unknown>;
      isMaximized?: () => Promise<boolean>;
    };
    database?: {
      initialize?: () => Promise<{ success?: boolean; message?: string }>;
    };
  }

  interface Window {
    electronAPI?: ElectronAPI;
  }
}
