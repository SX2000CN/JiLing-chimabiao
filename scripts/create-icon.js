import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';

async function createIcon() {
  try {
    // 定义图标文件路径
    const iconPaths = [
      'icons/web/icon_16x16.png',
      'icons/web/icon_32x32.png', 
      'icons/web/icon_48x48.png',
      'icons/web/icon_64x64.png',
      'icons/web/icon_128x128.png',
      'icons/web/icon_256x256.png'
    ];

    console.log('开始创建ICO文件...');
    console.log('使用图标:', iconPaths);

    // 生成ICO文件
    const buf = await pngToIco(iconPaths);
    
    // 确保build目录存在
    if (!fs.existsSync('build')) {
      fs.mkdirSync('build');
    }
    
    // 写入ICO文件
    fs.writeFileSync('build/icon.ico', buf);
    
    console.log('✅ ICO文件创建成功: build/icon.ico');
    
    // 同时复制最大的PNG作为备用
    fs.copyFileSync('icons/web/icon_256x256.png', 'build/icon.png');
    console.log('✅ PNG图标复制成功: build/icon.png');
    
  } catch (error) {
    console.error('❌ 图标创建失败:', error);
    process.exit(1);
  }
}

createIcon();
