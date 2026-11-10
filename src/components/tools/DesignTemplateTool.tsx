'use client';

import { useCallback, useMemo, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import {
  type CustomTemplate,
  loadCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  updateCustomTemplateName,
  subscribeCustomTemplates,
} from '@/utils/templateStorage';

import {
  AspectRatio,
  BgType,
  ColorStyle,
  RenderState,
  TemplateId,
  TemplateMeta,
} from './design-template/types';
import { BASE_DIM, TEMPLATES } from './design-template/constants';
import { renderFrameScaled, renderTemplateNormalized } from './design-template/renderers/renderEngine';
import { PresetTemplateCard } from './design-template/components/PresetTemplateCard';
import { TeamTemplateCard } from './design-template/components/TeamTemplateCard';
import { UploadDesignSection } from './design-template/components/UploadDesignSection';
import { CustomTemplateViewer } from './design-template/components/CustomTemplateViewer';
import { PresetTemplateInspector } from './design-template/components/PresetTemplateInspector';
import { StagePreview } from './design-template/components/StagePreview';

export type { CustomTemplate, TemplateId, TemplateMeta, AspectRatio, BgType, ColorStyle };

export default function DesignTemplateTool() {
  // Navigation View: 'gallery' or 'editor'
  const [currentView, setCurrentView] = useState<'gallery' | 'editor'>('gallery');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('banner');

  // Custom User-Uploaded Templates (JPG, PNG, GIF, MP4)
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [currentCustomTemplate, setCurrentCustomTemplate] = useState<CustomTemplate | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [customBgType, setCustomBgType] = useState<'green' | 'transparent' | 'black' | 'white'>('transparent');
  const [customNameEdit, setCustomNameEdit] = useState<string>('');
  const customVideoRef = useRef<HTMLVideoElement>(null);
  const [exportingTemplateId, setExportingTemplateId] = useState<TemplateId | null>(null);

  // Load custom templates on mount & subscribe to realtime changes
  useEffect(() => {
    loadCustomTemplates()
      .then((items) => {
        setCustomTemplates(items);
      })
      .catch((err) => {
        console.warn('Gagal memuat custom templates:', err);
      });

    const unsubscribe = subscribeCustomTemplates(() => {
      loadCustomTemplates().then((items) => {
        setCustomTemplates(items);
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Canvas settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [bgType, setBgType] = useState<BgType>('transparent');
  const [duration, setDuration] = useState<number>(3.5);
  const [fps] = useState<60>(60);

  // Content Settings (General)
  const [contentType, setContentType] = useState<'text' | 'image'>('text');
  const [badgeText, setBadgeText] = useState('NEW');
  const [textSize, setTextSize] = useState<number>(100);
  const [textColor, setTextColor] = useState('#ffffff');
  const [hasTextOutline, setHasTextOutline] = useState(false);
  const [textOutlineColor] = useState('#000000');
  const [textOutlineWidth, setTextOutlineWidth] = useState<number>(14);
  const [rotateTextWithBadge] = useState(false);
  const [customIconUrl, setCustomIconUrl] = useState<string>('');
  const [customIconImg, setCustomIconImg] = useState<HTMLImageElement | null>(null);

  // BANNER SPECIFIC SETTINGS (Manual Corner Radius, Icon Mode, Stroke)
  const [bannerText, setBannerText] = useState('11.11 BIG SALE');
  const [bannerTextSize, setBannerTextSize] = useState<number>(100);
  const [bannerTextColor, setBannerTextColor] = useState('#ffffff');
  const [bannerCornerRadius, setBannerCornerRadius] = useState<number>(24);
  const [bannerStrokeEnabled, setBannerStrokeEnabled] = useState<boolean>(true);
  const [bannerStrokeColor, setBannerStrokeColor] = useState<string>('rgba(255, 255, 255, 0.25)');
  const [bannerStrokeWidth, setBannerStrokeWidth] = useState<number>(2);

  // Banner Logo mode: 'upload' | 'none'
  const [bannerLogoMode, setBannerLogoMode] = useState<'upload' | 'none'>('none');
  const [bannerCustomLogoUrl, setBannerCustomLogoUrl] = useState<string>('');
  const [bannerCustomLogoImg, setBannerCustomLogoImg] = useState<HTMLImageElement | null>(null);

  // Specific Template Texts
  const [buttonText, setButtonText] = useState('CLAIM VOUCHER');
  const [cartCount, setCartCount] = useState<number>(1);
  const [boxTitle, setBoxTitle] = useState('SPECIAL PROMO');
  const [boxSubtitle, setBoxSubtitle] = useState('Use code TIMEPHORIA at checkout');

  // Starburst Polygon Settings
  const [points, setPoints] = useState<number>(16);
  const [depthRatio, setDepthRatio] = useState<number>(0.84);
  const [borderWidth, setBorderWidth] = useState<number>(14);

  // Color Settings
  const [colorStyle, setColorStyle] = useState<ColorStyle>('solid');
  const [solidColor, setSolidColor] = useState<string>('#09090b');
  const [gradientStart, setGradientStart] = useState<string>('#ff0000');
  const [gradientEnd, setGradientEnd] = useState<string>('#990000');
  const [gradientAngle, setGradientAngle] = useState<number>(90);

  // Motion Settings
  const [spinSpeed, setSpinSpeed] = useState<number>(0);
  const [enableBurstParticles] = useState<boolean>(true);

  // Playback & Export State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [exportStatusText, setExportStatusText] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef<{ start: number; offset: number }>({ start: performance.now(), offset: 0 });
  const cancelExportRef = useRef(false);

  const canvasW = aspectRatio === '1:1' ? BASE_DIM : BASE_DIM;
  const canvasH = aspectRatio === '1:1' ? BASE_DIM : 1920;

  // Custom Icon Upload for Starburst
  const handleIconUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomIconUrl(url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setCustomIconImg(img);
      setContentType('image');
    };
  };

  // Custom Logo Upload for Banner
  const handleBannerLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBannerCustomLogoUrl(url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setBannerCustomLogoImg(img);
      setBannerLogoMode('upload');
    };
  };

  const handleClearBannerLogo = () => {
    setBannerCustomLogoUrl('');
    setBannerCustomLogoImg(null);
  };

  // Render State Object passed to pure render engine
  const currentRenderState: RenderState = useMemo(
    () => ({
      contentType,
      badgeText,
      textSize,
      textColor,
      hasTextOutline,
      textOutlineColor,
      textOutlineWidth,
      rotateTextWithBadge,
      customIconImg,
      bannerText,
      bannerTextSize,
      bannerTextColor,
      bannerCornerRadius,
      bannerStrokeEnabled,
      bannerStrokeColor,
      bannerStrokeWidth,
      bannerLogoMode,
      bannerCustomLogoImg,
      buttonText,
      cartCount,
      boxTitle,
      boxSubtitle,
      points,
      depthRatio,
      borderWidth,
      colorStyle,
      solidColor,
      gradientStart,
      gradientEnd,
      gradientAngle,
      spinSpeed,
      enableBurstParticles,
    }),
    [
      contentType,
      badgeText,
      textSize,
      textColor,
      hasTextOutline,
      textOutlineColor,
      textOutlineWidth,
      rotateTextWithBadge,
      customIconImg,
      bannerText,
      bannerTextSize,
      bannerTextColor,
      bannerCornerRadius,
      bannerStrokeEnabled,
      bannerStrokeColor,
      bannerStrokeWidth,
      bannerLogoMode,
      bannerCustomLogoImg,
      buttonText,
      cartCount,
      boxTitle,
      boxSubtitle,
      points,
      depthRatio,
      borderWidth,
      colorStyle,
      solidColor,
      gradientStart,
      gradientEnd,
      gradientAngle,
      spinSpeed,
      enableBurstParticles,
    ]
  );

  const renderFrame = useCallback(
    (templateId: TemplateId, ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
      renderFrameScaled(templateId, ctx, t, w, h, bgType, currentRenderState, duration);
    },
    [bgType, currentRenderState, duration]
  );

  const renderNormalized = useCallback(
    (templateId: TemplateId, ctx: CanvasRenderingContext2D, t: number, isThumb = false) => {
      renderTemplateNormalized(templateId, ctx, t, currentRenderState, duration, bgType, isThumb);
    },
    [currentRenderState, duration, bgType]
  );

  // Animation Loop via requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (isPlaying) {
        const elapsed = (performance.now() - clockRef.current.start) / 1000 + clockRef.current.offset;
        const loopedTime = elapsed % Math.max(0.1, duration);
        setCurrentTime(loopedTime);

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) renderFrame(selectedTemplate, ctx, loopedTime, canvasW, canvasH);
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, duration, renderFrame, selectedTemplate, canvasW, canvasH]);

  // Redraw when paused and params change
  useEffect(() => {
    if (!isPlaying && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) renderFrame(selectedTemplate, ctx, currentTime, canvasW, canvasH);
    }
  }, [isPlaying, currentTime, renderFrame, selectedTemplate, canvasW, canvasH]);

  // Handle Seek / Scrubber
  const handleSeek = (time: number) => {
    clockRef.current = { start: isPlaying ? performance.now() : 0, offset: time };
    setCurrentTime(time);
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (isPlaying) {
      const elapsed = (performance.now() - clockRef.current.start) / 1000 + clockRef.current.offset;
      clockRef.current = { start: 0, offset: elapsed % duration };
      setIsPlaying(false);
    } else {
      clockRef.current = { start: performance.now(), offset: currentTime };
      setIsPlaying(true);
    }
  };

  // File Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadError(null);
    if (!uploadName.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setUploadName(cleanName);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const newTemplate = await saveCustomTemplate(uploadFile, uploadName);
      setCustomTemplates((prev) => [newTemplate, ...prev]);
      setUploadFile(null);
      setUploadName('');
      const fileInput = document.getElementById('template-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'Terjadi kesalahan saat upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustomTemplate = async (id: string) => {
    if (!confirm('Hapus template ini dari Design Template?')) return;

    try {
      await deleteCustomTemplate(id);
      setCustomTemplates((prev) => prev.filter((item) => item.id !== id));
      if (currentCustomTemplate?.id === id) {
        setCurrentCustomTemplate(null);
        setCurrentView('gallery');
      }
    } catch (err) {
      console.error('Gagal menghapus template:', err);
    }
  };

  const handleCustomNameChange = async (newName: string) => {
    setCustomNameEdit(newName);
    if (currentCustomTemplate) {
      setCurrentCustomTemplate((prev) => (prev ? { ...prev, name: newName } : null));
      setCustomTemplates((prev) =>
        prev.map((t) => (t.id === currentCustomTemplate.id ? { ...t, name: newName } : t))
      );
      try {
        await updateCustomTemplateName(currentCustomTemplate.id, newName);
      } catch (err) {
        console.warn('Gagal memperbarui nama template:', err);
      }
    }
  };

  const handleSelectCustomTemplate = (item: CustomTemplate) => {
    setCurrentCustomTemplate(item);
    setCustomNameEdit(item.name);
    setCurrentView('editor');
  };

  const handleBackToGallery = () => {
    setCurrentCustomTemplate(null);
    setCurrentView('gallery');
  };

  const handleSelectTemplate = (id: TemplateId) => {
    setCurrentCustomTemplate(null);
    setSelectedTemplate(id);
    const meta = TEMPLATES.find((t) => t.id === id);
    if (meta) {
      setDuration(meta.defaultDuration);
      setSolidColor(meta.defaultSolidColor);
      setGradientStart(meta.defaultGradientStart);
      setGradientEnd(meta.defaultGradientEnd);
      setGradientAngle(meta.defaultGradientAngle);
    }
    setCurrentView('editor');
    handleSeek(0);
  };

  // 60FPS MP4 Export via WebCodecs + mp4-muxer
  const handleExportMp4 = async (overrideTemplateId?: TemplateId | React.MouseEvent) => {
    if (exportProgress !== null) return;
    cancelExportRef.current = false;
    setExportProgress(0);
    setExportStatusText('Menyiapkan MP4 encoder 60 FPS...');

    const wasPlaying = isPlaying;
    setIsPlaying(false);

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvasW;
      exportCanvas.height = canvasH;
      const exportCtx = exportCanvas.getContext('2d', { willReadFrequently: true });
      if (!exportCtx) throw new Error('Canvas 2D unavailable');

      const targetId =
        (typeof overrideTemplateId === 'string' ? overrideTemplateId : undefined) || selectedTemplate;
      const targetMeta = TEMPLATES.find((t) => t.id === targetId);
      const targetDuration = overrideTemplateId && targetMeta ? targetMeta.defaultDuration : duration;
      const totalFrames = Math.max(1, Math.round(targetDuration * fps));
      const frameDurationUs = Math.round(1_000_000 / fps);

      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width: canvasW,
          height: canvasH,
        },
        fastStart: 'in-memory',
      });

      let videoEncoder: VideoEncoder | null = null;
      let encoderError: Error | null = null;

      if (typeof window !== 'undefined' && 'VideoEncoder' in window) {
        videoEncoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => {
            encoderError = e;
          },
        });

        videoEncoder.configure({
          codec: 'avc1.640028',
          width: canvasW,
          height: canvasH,
          bitrate: 10_000_000,
          framerate: fps,
        });
      } else {
        throw new Error('WebCodecs VideoEncoder tidak didukung di browser ini.');
      }

      setExportStatusText('Merender frame 60 FPS...');

      for (let i = 0; i < totalFrames; i++) {
        if (cancelExportRef.current) throw new Error('Export dibatalkan.');

        const t = i / fps;
        renderFrame(targetId, exportCtx, t, canvasW, canvasH);

        if (videoEncoder && !encoderError) {
          const timestamp = i * frameDurationUs;
          const frame = new VideoFrame(exportCanvas, {
            timestamp,
            duration: frameDurationUs,
          });
          videoEncoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
          frame.close();
        }

        if (i % 5 === 0 || i === totalFrames - 1) {
          setExportProgress(Math.round(((i + 1) / totalFrames) * 92));
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      setExportStatusText('Finalisasi file MP4...');
      await videoEncoder.flush();
      muxer.finalize();

      const { buffer } = muxer.target;
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const dlUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = dlUrl;
      const dlName =
        (overrideTemplateId ? targetMeta?.name : selectedTemplate === 'banner' ? bannerText : badgeText) ||
        targetId;
      a.download = `${dlName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-60fps.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);

      setExportProgress(100);
      setExportStatusText('Selesai!');
      setTimeout(() => {
        setExportProgress(null);
        setExportStatusText('');
      }, 1200);
    } catch (err: any) {
      if (!cancelExportRef.current) {
        alert(err.message || 'Export gagal');
      }
      setExportProgress(null);
      setExportStatusText('');
    } finally {
      if (wasPlaying) setIsPlaying(true);
    }
  };

  const handleQuickDownloadPreset = async (templateId: TemplateId, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (exportProgress !== null || exportingTemplateId !== null) return;
    setExportingTemplateId(templateId);
    try {
      await handleExportMp4(templateId);
    } finally {
      setExportingTemplateId(null);
    }
  };

  // Export 1 Frame PNG
  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const fileInputClass =
    'text-xs block w-full file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border file:border-white/50 file:text-xs file:font-medium file:bg-white/60 file:text-[var(--label)] hover:file:bg-white/80 transition-colors cursor-pointer text-[var(--label-2)]';

  const activeTemplates = useMemo(() => TEMPLATES.filter((t) => !t.disabled), []);

  return (
    <div className="w-full space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--separator)] pb-4">
        <div className="flex items-center gap-3">
          {currentView === 'editor' && (
            <button
              type="button"
              onClick={handleBackToGallery}
              className="liquid-glass-chip w-9 h-9 rounded-full flex items-center justify-center text-[var(--label)] hover:text-[var(--tint)] shrink-0"
              title="Kembali ke Galeri Template"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--label)]">
              {currentView === 'gallery'
                ? 'Design Template'
                : currentCustomTemplate
                ? currentCustomTemplate.name
                : TEMPLATES.find((t) => t.id === selectedTemplate)?.name || 'Design Template'}
            </h2>
          </div>
        </div>

        {/* View Switcher / Quick Dropdown (Editor only) */}
        {currentView === 'editor' && (
          <div className="flex items-center gap-2">
            <select
              value={currentCustomTemplate ? `custom:${currentCustomTemplate.id}` : selectedTemplate}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('custom:')) {
                  const id = val.replace('custom:', '');
                  const found = customTemplates.find((t) => t.id === id);
                  if (found) handleSelectCustomTemplate(found);
                } else {
                  handleSelectTemplate(val as TemplateId);
                }
              }}
              className="h-9 px-3 lg-input text-xs font-semibold"
            >
              <optgroup label="Template Desain">
                {activeTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
              {customTemplates.length > 0 && (
                <optgroup label="Team Template">
                  {customTemplates.map((c) => (
                    <option key={c.id} value={`custom:${c.id}`}>
                      {c.name} ({c.fileName.split('.').pop()?.toUpperCase() || c.fileType})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            <button
              type="button"
              onClick={handleBackToGallery}
              className="apple-nav-pill py-2 px-3.5 text-xs font-semibold"
            >
              Semua Template
            </button>
          </div>
        )}
      </div>

      {/* VIEW A: GALLERY GRID */}
      {currentView === 'gallery' ? (
        <div className="space-y-8">
          {/* UPLOAD TEMPLATE SECTION */}
          <UploadDesignSection
            uploadName={uploadName}
            isUploading={isUploading}
            uploadError={uploadError}
            hasFile={Boolean(uploadFile)}
            fileInputClass={fileInputClass}
            onFileSelect={handleFileSelect}
            onNameChange={setUploadName}
            onSubmit={handleUploadSubmit}
          />

          {/* SECTION 1: PRESET TEMPLATES */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--label-2)] uppercase tracking-wider">
              Template Desain
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {activeTemplates.map((template) => (
                <PresetTemplateCard
                  key={template.id}
                  template={template}
                  exportingTemplateId={exportingTemplateId}
                  exportProgress={exportProgress}
                  onSelect={handleSelectTemplate}
                  onQuickDownload={handleQuickDownloadPreset}
                  renderTemplateNormalized={renderNormalized}
                />
              ))}
            </div>
          </div>

          {/* SECTION 2: CUSTOM USER UPLOADS */}
          {customTemplates.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-[var(--label-2)] uppercase tracking-wider">
                Team Template
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {customTemplates.map((item) => (
                  <TeamTemplateCard
                    key={item.id}
                    item={item}
                    onSelect={handleSelectCustomTemplate}
                    onDelete={handleDeleteCustomTemplate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : currentCustomTemplate ? (
        /* VIEW B-1: CUSTOM TEMPLATE VIEWER & EXPORTER */
        <CustomTemplateViewer
          template={currentCustomTemplate}
          customNameEdit={customNameEdit}
          customBgType={customBgType}
          videoRef={customVideoRef}
          onNameChange={handleCustomNameChange}
          onBgTypeChange={setCustomBgType}
          onDelete={handleDeleteCustomTemplate}
        />
      ) : (
        /* VIEW B-2: JITTER STUDIO EDITOR */
        <div className="w-full grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 items-start">
          <PresetTemplateInspector
            selectedTemplate={selectedTemplate}
            contentType={contentType}
            setContentType={setContentType}
            badgeText={badgeText}
            setBadgeText={setBadgeText}
            textSize={textSize}
            setTextSize={setTextSize}
            hasTextOutline={hasTextOutline}
            setHasTextOutline={setHasTextOutline}
            textOutlineWidth={textOutlineWidth}
            setTextOutlineWidth={setTextOutlineWidth}
            customIconUrl={customIconUrl}
            handleIconUpload={handleIconUpload}
            bannerText={bannerText}
            setBannerText={setBannerText}
            bannerTextSize={bannerTextSize}
            setBannerTextSize={setBannerTextSize}
            bannerTextColor={bannerTextColor}
            setBannerTextColor={setBannerTextColor}
            bannerLogoMode={bannerLogoMode}
            setBannerLogoMode={setBannerLogoMode}
            bannerCustomLogoUrl={bannerCustomLogoUrl}
            handleBannerLogoUpload={handleBannerLogoUpload}
            onClearBannerLogo={handleClearBannerLogo}
            bannerCornerRadius={bannerCornerRadius}
            setBannerCornerRadius={setBannerCornerRadius}
            bannerStrokeEnabled={bannerStrokeEnabled}
            setBannerStrokeEnabled={setBannerStrokeEnabled}
            bannerStrokeColor={bannerStrokeColor}
            setBannerStrokeColor={setBannerStrokeColor}
            bannerStrokeWidth={bannerStrokeWidth}
            setBannerStrokeWidth={setBannerStrokeWidth}
            buttonText={buttonText}
            setButtonText={setButtonText}
            cartCount={cartCount}
            setCartCount={setCartCount}
            boxTitle={boxTitle}
            setBoxTitle={setBoxTitle}
            boxSubtitle={boxSubtitle}
            setBoxSubtitle={setBoxSubtitle}
            points={points}
            setPoints={setPoints}
            depthRatio={depthRatio}
            setDepthRatio={setDepthRatio}
            borderWidth={borderWidth}
            setBorderWidth={setBorderWidth}
            colorStyle={colorStyle}
            setColorStyle={setColorStyle}
            solidColor={solidColor}
            setSolidColor={setSolidColor}
            gradientStart={gradientStart}
            setGradientStart={setGradientStart}
            gradientEnd={gradientEnd}
            setGradientEnd={setGradientEnd}
            gradientAngle={gradientAngle}
            setGradientAngle={setGradientAngle}
            spinSpeed={spinSpeed}
            setSpinSpeed={setSpinSpeed}
            bgType={bgType}
            setBgType={setBgType}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            duration={duration}
            setDuration={setDuration}
            exportProgress={exportProgress}
            exportStatusText={exportStatusText}
            onCancelExport={() => {
              cancelExportRef.current = true;
              setExportProgress(null);
            }}
            onExportMp4={() => handleExportMp4()}
            onExportPng={handleExportPng}
            fileInputClass={fileInputClass}
          />

          <StagePreview
            canvasRef={canvasRef}
            canvasW={canvasW}
            canvasH={canvasH}
            aspectRatio={aspectRatio}
            bgType={bgType}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            togglePlay={togglePlay}
            handleSeek={handleSeek}
          />
        </div>
      )}
    </div>
  );
}
