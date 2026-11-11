export type TemplateId =
  | 'starburst'
  | 'banner'
  | 'safari-bar'
  | 'chat-bubble-pink'
  | 'blue-pin-banner'
  | 'attention-oval'
  | 'swag-badge'
  | 'chat-bubble-white'
  | 'retro-oval-badge'
  | 'pixel-megaphone'
  | 'chat-bubble-blue';

export type TemplateCategory = 'Badges' | 'Buttons' | 'Social' | 'Containers';

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  category: TemplateCategory;
  defaultDuration: number;
  thumbBg: string;
  defaultSolidColor: string;
  defaultGradientStart: string;
  defaultGradientMid?: string;
  defaultGradientEnd: string;
  defaultGradientAngle: number;
  disabled?: boolean;
}

export type AspectRatio = '1:1' | '9:16';
export type BgType = 'green' | 'transparent';
export type ColorStyle = 'solid' | 'gradient';

export interface Swatch {
  name: string;
  hex: string;
}

export interface RenderState {
  // General Content
  contentType: 'text' | 'image';
  badgeText: string;
  textSize: number;
  textColor: string;
  hasTextOutline: boolean;
  textOutlineColor: string;
  textOutlineWidth: number;
  rotateTextWithBadge: boolean;
  customIconImg: HTMLImageElement | null;

  // Banner Content
  bannerText: string;
  bannerTextSize: number;
  bannerTextColor: string;
  bannerCornerRadius: number;
  bannerStrokeEnabled: boolean;
  bannerStrokeColor: string;
  bannerStrokeWidth: number;
  bannerLogoMode: 'upload' | 'none';
  bannerCustomLogoImg: HTMLImageElement | null;

  // Specific Template Texts
  buttonText: string;
  cartCount: number;
  boxTitle: string;
  boxSubtitle: string;

  // New Sticker / Graphic Template Texts (Default: "Lorem Ipsum dolor")
  customText: string;
  customTextSecondary?: string;
  customTextSize: number;
  customTextColor: string;

  // Starburst Polygon Settings
  points: number;
  depthRatio: number;
  borderWidth: number;

  // Color Settings
  colorStyle: ColorStyle;
  solidColor: string;
  gradientStart: string;
  gradientMid?: string;
  gradientEnd: string;
  gradientAngle: number;

  // Motion Settings
  spinSpeed: number;
  enableBurstParticles: boolean;
}
