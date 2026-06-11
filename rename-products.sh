#!/bin/bash
# =============================================================
# rename-products.sh
# Jalankan dari ROOT project (folder yang ada /public di dalamnya)
# Usage: bash rename-products.sh
# =============================================================

PRODUCTS_DIR="public/products"

if [ ! -d "$PRODUCTS_DIR" ]; then
  echo "❌ Folder '$PRODUCTS_DIR' tidak ditemukan."
  echo "   Pastikan kamu jalankan script ini dari root project."
  exit 1
fi

echo "📁 Memproses folder: $PRODUCTS_DIR"
echo ""

renamed=0
skipped=0

for filepath in "$PRODUCTS_DIR"/*; do
  filename=$(basename "$filepath")
  ext="${filename##*.}"
  basename_no_ext="${filename%.*}"

  # Ganti spasi dengan tanda hubung, ubah ke lowercase
  new_basename=$(echo "$basename_no_ext" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
  new_filename="${new_basename}.${ext}"
  new_filepath="$PRODUCTS_DIR/$new_filename"

  if [ "$filename" = "$new_filename" ]; then
    echo "⏭️  Skip (sudah benar): $filename"
    ((skipped++))
  else
    mv "$filepath" "$new_filepath"
    echo "✅ Renamed: $filename  →  $new_filename"
    ((renamed++))
  fi
done

echo ""
echo "============================================="
echo "✅ Selesai! $renamed file diubah, $skipped file di-skip."
echo "============================================="
