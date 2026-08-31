const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Target folder public tempat kamu menyimpan wmp1.png, phone1.png, dst.
const folderPath = path.join(__dirname, 'public');

// Daftar file yang mau di-compress
const filesToCompress = ['wmp1.png', 'wmp2.png', 'phone1.png', 'phone2.png'];

async function compressImages() {
  console.log('Mulai memproses template UI...');

  for (const file of filesToCompress) {
    const inputPath = path.join(folderPath, file);
    // Kita buat file sementara dulu agar tidak langsung menimpa kalau error
    const tempPath = path.join(folderPath, `temp-${file}`);

    if (fs.existsSync(inputPath)) {
      try {
        const originalSize = fs.statSync(inputPath).size;

        await sharp(inputPath)
          .png({ 
            quality: 70, // Menurunkan ukuran file tanpa merusak detail terlalu parah
            compressionLevel: 9, // Kompresi maksimal untuk PNG
            palette: true // Menjaga transparansi tetap mulus
          })
          .toFile(tempPath);

        const newSize = fs.statSync(tempPath).size;

        // Timpa file asli dengan hasil compress
        fs.renameSync(tempPath, inputPath);

        console.log(`✅ ${file}: ${(originalSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB`);
      } catch (error) {
        console.error(`❌ Gagal memproses ${file}:`, error);
      }
    } else {
      console.log(`⚠️ File dilewati: ${file} tidak ditemukan di folder public/`);
    }
  }
  console.log('Selesai!');
}

compressImages();