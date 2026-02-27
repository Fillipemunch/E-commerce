
export type Language = 'da' | 'en';

export interface ProductContent {
  danish: {
    title: string;
    description: string;
    seo_keywords: string[];
    meta_description: string;
  };
  english: {
    title: string;
    description: string;
    seo_keywords: string[];
    meta_description: string;
  };
  compliance_note: string;
}

export interface ExtractedProductData {
  sku: string;
  material: string;
  weight: string;
  detected_name: string;
  detected_price_dkk?: string;
}

export interface PromotionAnalysis {
  promotion_code: string;
  discount_rate: string;
  marketing_title_da: string;
  marketing_title_en: string;
  reasoning: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum Tab {
  DASHBOARD = 'dashboard',
  PRODUCT_GEN = 'product_gen',
  PROMO_ANALYST = 'promo_analyst',
  BUSINESS_TOOLS = 'business_tools',
  STOREFRONT = 'storefront',
  LANDING_PAGE = 'landing_page'
}

export interface MockSalesData {
  productId: string;
  name: string;
  stockLevel: number;
  salesLast30Days: number;
  category: string;
}

export interface StoreProduct {
  id: number;
  sku: string;
  name_en: string;
  name_da: string;
  description_en: string;
  description_da: string;
  price: string;
  img: string;
  stock: number;
  active: boolean;
  tags: string[];
  reviews?: string[];
}

export interface Pakkeshop {
  id: string;
  name: string;
  address: string;
  distance: string;
  carrier: 'PostNord' | 'GLS';
}

export interface ComplianceResult {
  is_compliant: boolean;
  issues: string[];
  suggestion_da: string;
  suggestion_en: string;
}

export interface ReviewSummary {
  pros_da: string[];
  cons_da: string[];
  pros_en: string[];
  cons_en: string[];
  overall_sentiment: 'Positive' | 'Neutral' | 'Negative';
}

export interface CompetitorInsight {
  competitor_name: string;
  competitor_price: string;
  suggestion: string;
}

// New Types for Advanced Features

export interface ShopLookItem {
  id: number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  product_id: number;
}

export interface ShopLookImage {
  id: number;
  imageUrl: string;
  items: ShopLookItem[];
  title: string;
}

export interface SocialResponse {
  formal: string;
  casual: string;
  optimistic: string;
}

export interface SmartCouponResult {
  code: string;
  discount: string;
  message_da: string;
  message_en: string;
  reasoning: string;
}

export interface DeliverySlot {
  id: string;
  time: string; // e.g., "18:00 - 20:00"
  date: string; // e.g., "Tomorrow"
  cost: string;
}

// Features 16-20
export interface FraudAnalysis {
  risk_level: 'Low' | 'Medium' | 'High';
  score: number; // 0-100
  reasons: string[];
  action_recommendation: string;
}

export interface ForecastRecommendation {
  product_name: string;
  action: 'Restock' | 'Discount' | 'Hold';
  quantity_suggestion: number;
  reasoning_da: string;
  reasoning_en: string;
}

export interface AccessibilityAudit {
  score: number;
  issues: string[];
  fixed_html_snippet?: string;
}

export interface VoiceCommandIntent {
  action: 'search_product' | 'update_stock' | 'navigate' | 'unknown';
  parameters: Record<string, any>; // e.g. { product: 'chair', quantity: 10 }
  confirmation_msg: string;
}

export interface StoreCustomization {
  logoText: string;
  logoImage: string | null;
  heroImage: string;
  heroTitle: string;
  heroAccentTitle: string;
  heroSubtitle: string;
  ctaBuyText: string;
  ctaExploreText: string;
  shopLookImage: string;
  sectionShopLookTitle: string;
  sectionNewTitle: string;
  footerDesc: string;
  uspData: Array<{ title: string; iconName: string }>;
  landingHero: string;
  landingSub: string;
  landingCta: string;
  landingHeroImage: string | null;
}
