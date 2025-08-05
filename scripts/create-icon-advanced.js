import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function createIconAdvanced() {
  try {
    console.log('🔧 高级图标创建开始...');
    
    // 检查源图标文件
    const iconPaths = [
      'icons/web/icon_16x16.png',
      'icons/web/icon_32x32.png', 
      'icons/web/icon_48x48.png',
      'icons/web/icon_64x64.png',
      'icons/web/icon_128x128.png',
      'icons/web/icon_256x256.png'
    ];

    console.log('检查源图标文件...');
    for (const iconPath of iconPaths) {
      if (!fs.existsSync(iconPath)) {
        throw new Error(`图标文件不存在: ${iconPath}`);
      }
      const stat = fs.statSync(iconPath);
      console.log(`✅ ${iconPath} (${stat.size} 字节)`);
    }

    // 确保build目录存在
    if (!fs.existsSync('build')) {
      fs.mkdirSync('build');
    }

    // 使用 png-to-ico 创建ICO文件
    const pngToIco = (await import('png-to-ico')).default;
    console.log('正在生成ICO文件...');
    
    const buf = await pngToIco(iconPaths);
    console.log(`ICO缓冲区大小: ${buf.length} 字节`);
    
    // 写入ICO文件
    fs.writeFileSync('build/icon.ico', buf);
    
    // 验证ICO文件
    const icoFile = fs.readFileSync('build/icon.ico');
    console.log(`ICO文件写入大小: ${icoFile.length} 字节`);
    
    // 检查ICO文件头
    const header = icoFile.subarray(0, 6);
    if (header[0] === 0 && header[1] === 0 && header[2] === 1 && header[3] === 0) {
      const iconCount = header[4] + (header[5] << 8);
      console.log(`✅ ICO文件格式正确，包含 ${iconCount} 个图标`);
    } else {
      throw new Error('ICO文件格式验证失败');
    }
    
    // 复制最大的PNG作为备用
    fs.copyFileSync('icons/web/icon_256x256.png', 'build/icon.png');
    console.log('✅ PNG备用图标复制成功');
    
    // 创建额外的图标副本（用于不同场景）
    fs.copyFileSync('build/icon.ico', 'build/app.ico');
    console.log('✅ 应用图标副本创建成功');
    
    console.log('🎉 高级图标创建完成！');
    
  } catch (error) {
    console.error('❌ 高级图标创建失败:', error);
    process.exit(1);
  }
}

createIconAdvanced();
