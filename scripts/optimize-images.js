const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const fs = require('fs-extra');
const path = require('path');

console.log('🖼️  Otimizando imagens...');

async function optimizeImages() {
  try {
    // Otimiza imagens da pasta src
    const files = await imagemin(['src/assets/images/*.{jpg,png,svg}'], {
      destination: 'src/assets/images/optimized',
      plugins: [
        imageminMozjpeg({
          quality: 80,
          progressive: true
        }),
        imageminPngquant({
          quality: [0.65, 0.80],
          speed: 4
        }),
        imageminSvgo({
          plugins: [
            { removeViewBox: false },
            { removeXMLNS: true },
            { cleanupIDs: false }
          ]
        })
      ]
    });

    console.log(`✅ ${files.length} imagens otimizadas:`);
    files.forEach(file => {
      const originalSize = fs.statSync(file.sourcePath).size;
      const optimizedSize = file.data.length;
      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      console.log(`   ${path.basename(file.sourcePath)}: ${(originalSize/1024).toFixed(1)}KB → ${(optimizedSize/1024).toFixed(1)}KB (${reduction}% menor)`);
    });

  } catch (error) {
    console.error('❌ Erro ao otimizar imagens:', error);
  }
}

optimizeImages();