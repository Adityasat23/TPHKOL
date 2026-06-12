// compress-products.js
// Jalankan dari ROOT project: node compress-products.js
// Pastikan sharp terinstall dulu: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'public/products');
const QUALITY = 80; // 80 = sweet spot kualitas vs ukuran (bisa turunkan ke 70 kalau mau lebih kecil)
const MAX_WIDTH = 800; // Resize kalau lebih lebar dari ini (produk tidak perlu lebih besar)

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const supported = ['.jpg', '.jpeg', '.png', '.webp'];
  if (!supported.includes(ext)) return null;

  const originalSize = fs.statSync(filePath).size;
  const tempPath = filePath + '.tmp';

  try {
    let pipeline = sharp(filePath).resize({ width: MAX_WIDTH, withoutEnlargement: true });

    if (ext === '.png') {
      pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
    } else {
      pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
    }

    await pipeline.toFile(tempPath);

    const newSize = fs.statSync(tempPath).size;

    // Hanya replace kalau hasilnya lebih kecil
    if (newSize < originalSize) {
      fs.renameSync(tempPath, filePath);
      return { originalSize, newSize, saved: originalSize - newSize };
    } else {
      fs.unlinkSync(tempPath);
      return { originalSize, newSize: originalSize, saved: 0 };
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    throw err;
  }
}

async function main() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Folder tidak ditemukan: ${INPUT_DIR}`);
    console.error('   Pastikan kamu jalankan script ini dari root project.');
    process.exit(1);
  }

  const files = fs.readdirSync(INPUT_DIR).filter(f =>
    ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.log('⚠️  Tidak ada gambar yang ditemukan di public/products/');
    return;
  }

  console.log(`🔧 Memproses ${files.length} gambar...\n`);

  let totalOriginal = 0;
  let totalNew = 0;

  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    process.stdout.write(`  ${file.padEnd(55)}`);

    try {
      const result = await compressImage(filePath);
      if (!result) {
        console.log('⏭️  Skip (format tidak didukung)');
        continue;
      }

      const origKB = (result.originalSize / 1024).toFixed(1);
      const newKB = (result.newSize / 1024).toFixed(1);
      const savedKB = (result.saved / 1024).toFixed(1);
      const pct = result.originalSize > 0 ? Math.round((result.saved / result.originalSize) * 100) : 0;

      totalOriginal += result.originalSize;
      totalNew += result.newSize;

      if (result.saved > 0) {
        console.log(`✅ ${origKB}KB → ${newKB}KB  (-${savedKB}KB, ${pct}%)`);
      } else {
        console.log(`⏭️  ${origKB}KB (sudah optimal)`);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  const totalSavedKB = ((totalOriginal - totalNew) / 1024).toFixed(1);
  const totalSavedMB = ((totalOriginal - totalNew) / 1024 / 1024).toFixed(2);
  const totalPct = totalOriginal > 0 ? Math.round(((totalOriginal - totalNew) / totalOriginal) * 100) : 0;

  console.log('\n=============================================');
  console.log(`✅ Selesai!`);
  console.log(`   Sebelum : ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Sesudah : ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Hemat   : ${totalSavedMB} MB (${totalPct}%)`);
  console.log('=============================================');
}

main();
