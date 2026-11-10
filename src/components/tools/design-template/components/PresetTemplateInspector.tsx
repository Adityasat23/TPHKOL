import React from 'react';
import { FLAT_SWATCHES, TEXT_PRESETS } from '../constants';
import { AspectRatio, BgType, ColorStyle, TemplateId } from '../types';

interface PresetTemplateInspectorProps {
  selectedTemplate: TemplateId;
  contentType: 'text' | 'image';
  setContentType: (val: 'text' | 'image') => void;
  badgeText: string;
  setBadgeText: (val: string) => void;
  textSize: number;
  setTextSize: (val: number) => void;
  hasTextOutline: boolean;
  setHasTextOutline: (val: boolean) => void;
  textOutlineWidth: number;
  setTextOutlineWidth: (val: number) => void;
  customIconUrl: string;
  handleIconUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  bannerText: string;
  setBannerText: (val: string) => void;
  bannerTextSize: number;
  setBannerTextSize: (val: number) => void;
  bannerTextColor: string;
  setBannerTextColor: (val: string) => void;
  bannerLogoMode: 'upload' | 'none';
  setBannerLogoMode: (val: 'upload' | 'none') => void;
  bannerCustomLogoUrl: string;
  handleBannerLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearBannerLogo: () => void;
  bannerCornerRadius: number;
  setBannerCornerRadius: (val: number) => void;
  bannerStrokeEnabled: boolean;
  setBannerStrokeEnabled: (val: boolean) => void;
  bannerStrokeColor: string;
  setBannerStrokeColor: (val: string) => void;
  bannerStrokeWidth: number;
  setBannerStrokeWidth: (val: number) => void;
  buttonText: string;
  setButtonText: (val: string) => void;
  cartCount: number;
  setCartCount: (val: number) => void;
  boxTitle: string;
  setBoxTitle: (val: string) => void;
  boxSubtitle: string;
  setBoxSubtitle: (val: string) => void;
  points: number;
  setPoints: (val: number) => void;
  depthRatio: number;
  setDepthRatio: (val: number) => void;
  borderWidth: number;
  setBorderWidth: (val: number) => void;
  colorStyle: ColorStyle;
  setColorStyle: (val: ColorStyle) => void;
  solidColor: string;
  setSolidColor: (val: string) => void;
  gradientStart: string;
  setGradientStart: (val: string) => void;
  gradientEnd: string;
  setGradientEnd: (val: string) => void;
  gradientAngle: number;
  setGradientAngle: (val: number) => void;
  spinSpeed: number;
  setSpinSpeed: (val: number) => void;
  bgType: BgType;
  setBgType: (val: BgType) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (val: AspectRatio) => void;
  duration: number;
  setDuration: (val: number) => void;
  exportProgress: number | null;
  exportStatusText: string;
  onCancelExport: () => void;
  onExportMp4: () => void;
  onExportPng: () => void;
  fileInputClass: string;
}

export function PresetTemplateInspector(props: PresetTemplateInspectorProps) {
  const {
    selectedTemplate,
    contentType,
    setContentType,
    badgeText,
    setBadgeText,
    textSize,
    setTextSize,
    hasTextOutline,
    setHasTextOutline,
    textOutlineWidth,
    setTextOutlineWidth,
    customIconUrl,
    handleIconUpload,
    bannerText,
    setBannerText,
    bannerTextSize,
    setBannerTextSize,
    bannerTextColor,
    setBannerTextColor,
    bannerLogoMode,
    setBannerLogoMode,
    bannerCustomLogoUrl,
    handleBannerLogoUpload,
    onClearBannerLogo,
    bannerCornerRadius,
    setBannerCornerRadius,
    bannerStrokeEnabled,
    setBannerStrokeEnabled,
    bannerStrokeColor,
    setBannerStrokeColor,
    bannerStrokeWidth,
    setBannerStrokeWidth,
    buttonText,
    setButtonText,
    cartCount,
    setCartCount,
    boxTitle,
    setBoxTitle,
    boxSubtitle,
    setBoxSubtitle,
    points,
    setPoints,
    depthRatio,
    setDepthRatio,
    borderWidth,
    setBorderWidth,
    colorStyle,
    setColorStyle,
    solidColor,
    setSolidColor,
    gradientStart,
    setGradientStart,
    gradientEnd,
    setGradientEnd,
    gradientAngle,
    setGradientAngle,
    spinSpeed,
    setSpinSpeed,
    bgType,
    setBgType,
    aspectRatio,
    setAspectRatio,
    duration,
    setDuration,
    exportProgress,
    exportStatusText,
    onCancelExport,
    onExportMp4,
    onExportPng,
    fileInputClass,
  } = props;

  return (
    <div className="lg-panel p-4 sm:p-6 space-y-5 min-w-0">
      {/* Card 1: Content (Specific to template) */}
      <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
        <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
          1. Konten Teks
        </label>

        {/* Starburst Specific Controls */}
        {selectedTemplate === 'starburst' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--label-2)]">Tipe Konten:</span>
              <div className="lg-segmented grid-cols-2 gap-1 w-40">
                <button
                  type="button"
                  onClick={() => setContentType('text')}
                  data-active={contentType === 'text'}
                  className="lg-segment-btn py-1 text-xs"
                >
                  Teks
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('image')}
                  data-active={contentType === 'image'}
                  className="lg-segment-btn py-1 text-xs"
                >
                  Upload PNG
                </button>
              </div>
            </div>

            {contentType === 'text' ? (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1.5">
                    Preset Cepat:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TEXT_PRESETS.map((txt) => (
                      <button
                        key={txt}
                        type="button"
                        onClick={() => setBadgeText(txt)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          badgeText === txt
                            ? 'bg-[var(--tint)] text-white border-[var(--tint)] font-bold'
                            : 'border-[var(--separator)] text-[var(--label)] hover:bg-[var(--fill)]'
                        }`}
                      >
                        {txt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--label-2)] mb-1">
                    Teks Badge:
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="NEW / BARU / SALE"
                    className="w-full h-9 px-3 lg-input text-sm font-bold uppercase"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                    <span>Ukuran Teks</span>
                    <span className="tabular-nums font-semibold text-[var(--label)]">
                      {textSize}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={160}
                    step={5}
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="w-full accent-[var(--tint)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 items-center pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTextOutline}
                      onChange={(e) => setHasTextOutline(e.target.checked)}
                      className="w-4 h-4 accent-[var(--tint)] rounded"
                    />
                    <span className="text-xs text-[var(--label)]">Outline Teks</span>
                  </label>

                  {hasTextOutline && (
                    <div>
                      <div className="flex justify-between text-[11px] text-[var(--label-2)] mb-0.5">
                        <span>Tebal Outline</span>
                        <span className="tabular-nums font-semibold text-[var(--label)]">
                          {textOutlineWidth}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={6}
                        max={24}
                        step={2}
                        value={textOutlineWidth}
                        onChange={(e) => setTextOutlineWidth(Number(e.target.value))}
                        className="w-full accent-[var(--tint)]"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  onChange={handleIconUpload}
                  className={fileInputClass}
                />
                {customIconUrl && (
                  <div className="flex items-center gap-3 p-2 mt-2 bg-[var(--fill)] rounded-xl border border-[var(--separator)]">
                    <img src={customIconUrl} alt="Preview" className="w-9 h-9 object-contain" />
                    <span className="text-xs text-[var(--label)] font-medium">Icon dimuat</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Banner Text Controls */}
        {selectedTemplate === 'banner' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">
                Teks Banner
              </label>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="11.11 BIG SALE"
                className="w-full h-9 px-3 lg-input text-sm font-bold uppercase"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                <span>Ukuran Teks</span>
                <span className="tabular-nums font-semibold text-[var(--label)]">
                  {bannerTextSize}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={160}
                step={5}
                value={bannerTextSize}
                onChange={(e) => setBannerTextSize(Number(e.target.value))}
                className="w-full accent-[var(--tint)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">
                Warna Teks
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bannerTextColor}
                  onChange={(e) => setBannerTextColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-white/20"
                />
                <input
                  type="text"
                  value={bannerTextColor}
                  onChange={(e) => setBannerTextColor(e.target.value)}
                  className="w-24 h-8 px-2 lg-input text-xs font-mono uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* Button Text Controls */}
        {(selectedTemplate === 'interactive-button-trace' ||
          selectedTemplate === 'glass-button') && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">
                Teks Tombol:
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="CLAIM VOUCHER"
                className="w-full h-9 px-3 lg-input text-sm font-bold uppercase"
              />
            </div>
          </div>
        )}

        {/* View Cart Button Controls */}
        {selectedTemplate === 'view-cart-button' && (
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
              <span>Jumlah Item di Keranjang:</span>
              <span className="tabular-nums font-semibold text-[var(--label)]">
                {cartCount} Item
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={9}
              step={1}
              value={cartCount}
              onChange={(e) => setCartCount(Number(e.target.value))}
              className="w-full accent-[var(--tint)]"
            />
          </div>
        )}

        {/* Box Controls */}
        {selectedTemplate === 'box' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">
                Judul Box:
              </label>
              <input
                type="text"
                value={boxTitle}
                onChange={(e) => setBoxTitle(e.target.value)}
                className="w-full h-9 px-3 lg-input text-sm font-bold uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">
                Subjudul:
              </label>
              <input
                type="text"
                value={boxSubtitle}
                onChange={(e) => setBoxSubtitle(e.target.value)}
                className="w-full h-9 px-3 lg-input text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* BANNER LOGO: UPLOAD PNG/JPG OR TANPA ICON */}
      {selectedTemplate === 'banner' && (
        <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
          <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
            2. Logo Banner
          </label>

          <div className="lg-segmented grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setBannerLogoMode('upload')}
              data-active={bannerLogoMode === 'upload'}
              className="lg-segment-btn py-1.5 text-xs font-medium"
            >
              Upload PNG / JPG
            </button>
            <button
              type="button"
              onClick={() => setBannerLogoMode('none')}
              data-active={bannerLogoMode === 'none'}
              className="lg-segment-btn py-1.5 text-xs font-medium"
            >
              Tanpa Icon
            </button>
          </div>

          {bannerLogoMode === 'upload' && (
            <div className="space-y-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleBannerLogoUpload}
                className={fileInputClass}
              />
              {bannerCustomLogoUrl && (
                <div className="flex items-center justify-between p-2.5 bg-[var(--fill)] rounded-xl border border-[var(--separator)]">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={bannerCustomLogoUrl}
                      alt="Logo"
                      className="w-9 h-9 object-contain rounded-md"
                    />
                    <span className="text-xs text-[var(--label)] font-medium">Logo Aktif</span>
                  </div>
                  <button
                    type="button"
                    onClick={onClearBannerLogo}
                    className="text-xs text-red-500 hover:text-red-400 font-medium px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          )}

          {bannerLogoMode === 'none' && (
            <p className="text-[11px] text-[var(--label-3)]">
              Banner bersih tanpa gambar. Teks otomatis berada tepat di tengah.
            </p>
          )}
        </div>
      )}

      {/* BANNER SPECIFIC: CORNER RADIUS & STROKE OUTLINE */}
      {selectedTemplate === 'banner' && (
        <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
          <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
            3. Corner & Stroke
          </label>

          <div>
            <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
              <span>Corner Radius</span>
              <span className="tabular-nums font-semibold text-[var(--label)]">
                {bannerCornerRadius === 0
                  ? '0px (Sharp)'
                  : bannerCornerRadius >= 75
                  ? '75px (Pill)'
                  : `${bannerCornerRadius}px`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={75}
              step={1}
              value={bannerCornerRadius}
              onChange={(e) => setBannerCornerRadius(Number(e.target.value))}
              className="w-full accent-[var(--tint)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--label-3)] mt-0.5">
              <span>0px (Sharp)</span>
              <span>24px</span>
              <span>75px (Pill)</span>
            </div>
          </div>

          <div className="pt-1 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bannerStrokeEnabled}
                  onChange={(e) => setBannerStrokeEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[var(--tint)] rounded"
                />
                <span className="text-xs text-[var(--label)] font-medium">Stroke Outline</span>
              </label>

              {bannerStrokeEnabled && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bannerStrokeColor.startsWith('#') ? bannerStrokeColor : '#ffffff'}
                    onChange={(e) => setBannerStrokeColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-white/20"
                  />
                  <span className="text-xs font-mono text-[var(--label-2)]">
                    {bannerStrokeColor}
                  </span>
                </div>
              )}
            </div>

            {bannerStrokeEnabled && (
              <div>
                <div className="flex justify-between text-[11px] text-[var(--label-2)] mb-0.5">
                  <span>Ketebalan Stroke</span>
                  <span className="tabular-nums font-semibold text-[var(--label)]">
                    {bannerStrokeWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={16}
                  step={1}
                  value={bannerStrokeWidth}
                  onChange={(e) => setBannerStrokeWidth(Number(e.target.value))}
                  className="w-full accent-[var(--tint)]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Starburst Specific Geometry */}
      {selectedTemplate === 'starburst' && (
        <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
          <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
            2. Bentuk Gerigi
          </label>

          <div>
            <div className="flex justify-between text-xs text-[var(--label-2)] mb-1.5">
              <span>Jumlah Titik Gerigi</span>
              <span className="tabular-nums font-semibold text-[var(--label)]">
                {points} Titik
              </span>
            </div>
            <div className="lg-segmented grid-cols-5 gap-1">
              {[12, 16, 20, 24, 32].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPoints(num)}
                  data-active={points === num}
                  className="lg-segment-btn py-1.5 text-xs font-semibold"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
              <span>Ketajaman Gerigi</span>
              <span className="tabular-nums font-semibold text-[var(--label)]">
                {Math.round((1 - depthRatio) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.72}
              max={0.92}
              step={0.01}
              value={depthRatio}
              onChange={(e) => setDepthRatio(Number(e.target.value))}
              className="w-full accent-[var(--tint)]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
              <span>Border Putih Sticker</span>
              <span className="tabular-nums font-semibold text-[var(--label)]">
                {borderWidth}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={24}
              step={2}
              value={borderWidth}
              onChange={(e) => setBorderWidth(Number(e.target.value))}
              className="w-full accent-[var(--tint)]"
            />
          </div>
        </div>
      )}

      {/* COLOR SETTINGS */}
      <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
            {selectedTemplate === 'starburst'
              ? '3. Warna Badge'
              : selectedTemplate === 'banner'
              ? '4. Warna Banner'
              : '2. Warna Elemen'}
          </label>
          <div className="lg-segmented grid-cols-2 gap-1 w-44">
            <button
              type="button"
              onClick={() => setColorStyle('solid')}
              data-active={colorStyle === 'solid'}
              className="lg-segment-btn py-1 text-xs"
            >
              Solid
            </button>
            <button
              type="button"
              onClick={() => setColorStyle('gradient')}
              data-active={colorStyle === 'gradient'}
              className="lg-segment-btn py-1 text-xs"
            >
              Gradient
            </button>
          </div>
        </div>

        {colorStyle === 'solid' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {FLAT_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => setSolidColor(swatch.hex)}
                  className={`w-7 h-7 rounded-full border transition-transform ${
                    solidColor.toLowerCase() === swatch.hex.toLowerCase()
                      ? 'scale-110 ring-2 ring-[var(--tint)] border-white'
                      : 'border-black/15 hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                  title={swatch.name}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                value={solidColor}
                onChange={(e) => setSolidColor(e.target.value)}
                className="w-9 h-9 rounded-xl cursor-pointer border border-white/20 shrink-0"
              />
              <input
                type="text"
                value={solidColor}
                onChange={(e) => setSolidColor(e.target.value)}
                className="w-28 h-9 px-3 lg-input text-xs font-mono uppercase"
              />
              <span className="text-xs text-[var(--label-2)]">Hex Solid</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">
                  Start Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradientStart}
                    onChange={(e) => setGradientStart(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-white/20 shrink-0"
                  />
                  <input
                    type="text"
                    value={gradientStart}
                    onChange={(e) => setGradientStart(e.target.value)}
                    className="w-full h-8 px-2 lg-input text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">
                  End Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradientEnd}
                    onChange={(e) => setGradientEnd(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-white/20 shrink-0"
                  />
                  <input
                    type="text"
                    value={gradientEnd}
                    onChange={(e) => setGradientEnd(e.target.value)}
                    className="w-full h-8 px-2 lg-input text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                <span>Sudut Gradasi</span>
                <span className="tabular-nums font-semibold text-[var(--label)]">
                  {gradientAngle}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={gradientAngle}
                onChange={(e) => setGradientAngle(Number(e.target.value))}
                className="w-full accent-[var(--tint)]"
              />
            </div>

            <div className="flex items-center justify-between gap-1 pt-1">
              <div className="flex items-center gap-1">
                {[
                  { label: '0°', val: 0 },
                  { label: '90°', val: 90 },
                  { label: '45°', val: 45 },
                  { label: '135°', val: 135 },
                ].map((ang) => (
                  <button
                    key={ang.val}
                    type="button"
                    onClick={() => setGradientAngle(ang.val)}
                    data-active={gradientAngle === ang.val}
                    className="px-2 py-1 rounded text-[11px] border border-[var(--separator)] data-[active=true]:bg-[var(--tint)] data-[active=true]:text-white"
                  >
                    {ang.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const tmp = gradientStart;
                  setGradientStart(gradientEnd);
                  setGradientEnd(tmp);
                }}
                className="apple-nav-pill px-2.5 py-1 text-[11px] flex items-center gap-1"
                title="Balik arah warna"
              >
                <span>⇄ Swap</span>
              </button>
            </div>

            <div
              className="w-full h-3 rounded-full border border-[var(--separator)] shadow-inner"
              style={{
                background: `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`,
              }}
            />
          </div>
        )}
      </div>

      {/* Animation & Format */}
      <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
        <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
          {selectedTemplate === 'starburst' ? '4. Animasi & Format' : '5. Animasi & Format'}
        </label>

        {selectedTemplate === 'starburst' && (
          <div>
            <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
              <span>Kecepatan Putar</span>
              <span className="tabular-nums font-semibold text-[var(--label)]">
                {spinSpeed === 0 ? '0x' : `${spinSpeed.toFixed(1)}x`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2.5}
              step={0.1}
              value={spinSpeed}
              onChange={(e) => setSpinSpeed(Number(e.target.value))}
              className="w-full accent-[var(--tint)]"
            />
          </div>
        )}

        {/* Background Selector */}
        <div>
          <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">
            Background Output
          </label>
          <div className="lg-segmented grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setBgType('green')}
              data-active={bgType === 'green'}
              className="lg-segment-btn py-1.5 text-xs flex items-center justify-center gap-1.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF00] border border-black/20" />
              <span>Green Screen</span>
            </button>
            <button
              type="button"
              onClick={() => setBgType('transparent')}
              data-active={bgType === 'transparent'}
              className="lg-segment-btn py-1.5 text-xs"
            >
              Transparan
            </button>
          </div>
        </div>

        {/* Aspect Ratio & Durasi */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-[var(--label-2)] mb-1">
              Canvas Aspect
            </label>
            <div className="lg-segmented grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                data-active={aspectRatio === '1:1'}
                className="lg-segment-btn py-1 text-xs"
              >
                1:1 Square
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                data-active={aspectRatio === '9:16'}
                className="lg-segment-btn py-1 text-xs"
              >
                9:16 TikTok
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
              <span>Durasi</span>
              <span className="tabular-nums font-semibold text-[var(--label)]">
                {duration.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={1.5}
              max={6.0}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-[var(--tint)] mt-1"
            />
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="space-y-2 pt-1">
        {exportProgress !== null ? (
          <div className="space-y-2 p-3.5 rounded-2xl bg-[var(--fill)] border border-[var(--separator)]">
            <div className="flex justify-between text-xs text-[var(--label)]">
              <span className="font-semibold">{exportStatusText}</span>
              <span className="font-mono tabular-nums">{exportProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2997FF] to-[#A78BFA] transition-all duration-200"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <button
              type="button"
              onClick={onCancelExport}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors pt-1"
            >
              Batalkan export
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onExportMp4}
              className="lg-btn-primary py-3.5 text-xs font-semibold flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-black/20"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Generate MP4</span>
            </button>

            <button
              type="button"
              onClick={onExportPng}
              className="apple-nav-pill py-3.5 text-xs font-semibold flex items-center justify-center gap-1.5 rounded-2xl border border-[var(--separator)]"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download PNG Transparan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
