
import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { ProductContent, PromotionAnalysis, ExtractedProductData, StoreProduct, ComplianceResult, ReviewSummary, CompetitorInsight, SocialResponse, SmartCouponResult, FraudAnalysis, ForecastRecommendation, AccessibilityAudit, VoiceCommandIntent } from "@/types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to encode image file to base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 1. Product Content Generator
export const generateProductContent = async (
  productName: string,
  price: string,
  imageFile?: File
): Promise<ProductContent | null> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        danish: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            seo_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            meta_description: { type: Type.STRING },
          },
          required: ['title', 'description', 'seo_keywords', 'meta_description'],
        },
        english: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            seo_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            meta_description: { type: Type.STRING },
          },
          required: ['title', 'description', 'seo_keywords', 'meta_description'],
        },
        compliance_note: { type: Type.STRING },
      },
      required: ['danish', 'english', 'compliance_note'],
    };

    const parts: any[] = [];
    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }
    
    parts.push({
      text: `You are the 'Content Creator', an expert marketing agent for Danish e-commerce.
      Generate optimized product content based on the input.
      Input Product: "${productName}", Price: ${price} DKK.
      
      Requirements:
      1. Create titles and descriptions in BOTH Danish and English.
      2. Include SEO keywords for both markets.
      3. Include a specific compliance note about the 14-day return policy (fortrydelsesret) in Danish.
      4. Use a professional, inviting tone suitable for a Nordic brand.`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ProductContent;
    }
    return null;

  } catch (error) {
    console.error("Gemini Product Gen Error:", error);
    throw error;
  }
};

// 2. Promotion Analyst
export const analyzePromotions = async (inventoryData: string): Promise<PromotionAnalysis | null> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        promotion_code: { type: Type.STRING },
        discount_rate: { type: Type.STRING },
        marketing_title_da: { type: Type.STRING },
        marketing_title_en: { type: Type.STRING },
        reasoning: { type: Type.STRING }
      },
      required: ['promotion_code', 'discount_rate', 'marketing_title_da', 'marketing_title_en', 'reasoning'],
    };

    const prompt = `You are the 'Pricing Advisor'. Analyze the following inventory data and suggest a localized promotion strategy.
    
    Data:
    ${inventoryData}
    
    Task:
    Identify a product or category that needs a sales boost (e.g., high stock, low recent sales).
    Suggest a creative Danish promotion code (e.g., relating to season/hygge).
    Create a catchy marketing title in both Danish and English (max 50 chars).
    Explain your reasoning briefly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PromotionAnalysis;
    }
    return null;

  } catch (error) {
    console.error("Gemini Promo Analysis Error:", error);
    throw error;
  }
};

// 3. Product Scanner (Multimodal)
export const extractProductDataFromImage = async (imageFile: File): Promise<ExtractedProductData | null> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        sku: { type: Type.STRING, description: "Any visible code or generate a hash" },
        material: { type: Type.STRING, description: "Primary material inferred from image" },
        weight: { type: Type.STRING, description: "Estimated weight in kg" },
        detected_name: { type: Type.STRING, description: "A simple name for the product" },
        detected_price_dkk: { type: Type.STRING, description: "Estimated price if visible or based on type" }
      },
      required: ['sku', 'material', 'weight', 'detected_name'],
    };

    const imagePart = await fileToGenerativePart(imageFile);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            imagePart,
            { text: "Analyze this product image/label. Extract or infer technical details useful for e-commerce listing." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ExtractedProductData;
    }
    return null;
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw error;
  }
};

// 4. Smart Search (Storefront)
export const searchProductsWithAI = async (query: string, availableProducts: any[]): Promise<number[]> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        matched_ids: { type: Type.ARRAY, items: { type: Type.NUMBER } },
      },
      required: ['matched_ids']
    };

    const prompt = `You are a smart search engine for a Danish design store.
    User Query: "${query}" (Could be Danish or English).
    
    Available Products:
    ${JSON.stringify(availableProducts.map(p => ({ id: p.id, name: p.name, tags: p.tags })))}
    
    Task: Return a list of Product IDs that match the user's INTENT. Even if keywords don't match exactly, match the vibe/category.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.matched_ids;
    }
    return [];
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

// 5. Predictive Recommendations
export const getRecommendations = async (currentProductName: string, availableProducts: any[]): Promise<number[]> => {
  try {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          recommended_ids: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        },
        required: ['recommended_ids']
      };
  
      const prompt = `User is viewing: "${currentProductName}".
      Suggest 2 related products from the list below to cross-sell (e.g. if chair, suggest throw or vase).
      Available: ${JSON.stringify(availableProducts.map(p => ({ id: p.id, name: p.name })))}`;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      });
  
      if (response.text) {
        const data = JSON.parse(response.text);
        return data.recommended_ids;
      }
      return [];
  } catch (error) {
    return [2, 3]; // Fallback
  }
};

// 6. Compliance Checker
export const checkCompliance = async (text: string): Promise<ComplianceResult | null> => {
    try {
        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                is_compliant: { type: Type.BOOLEAN },
                issues: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestion_da: { type: Type.STRING },
                suggestion_en: { type: Type.STRING },
            },
            required: ['is_compliant', 'issues', 'suggestion_da', 'suggestion_en']
        };

        const prompt = `You are a Legal Compliance Expert for Danish E-commerce (GDPR, Consumer Contracts Act).
        Analyze the following text for compliance issues (e.g. missing return policy info, misleading claims).
        
        Text: "${text}"
        
        Output JSON: is_compliant (bool), issues (list of strings), and suggestions for improvement in DA and EN.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as ComplianceResult;
        }
        return null;
    } catch (e) {
        console.error("Compliance Check Error", e);
        return null;
    }
};

// 7. Review Summarizer
export const summarizeReviews = async (reviews: string[]): Promise<ReviewSummary | null> => {
    try {
        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                pros_da: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons_da: { type: Type.ARRAY, items: { type: Type.STRING } },
                pros_en: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons_en: { type: Type.ARRAY, items: { type: Type.STRING } },
                overall_sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] }
            },
            required: ['pros_da', 'cons_da', 'pros_en', 'cons_en', 'overall_sentiment']
        };

        const prompt = `Read these product reviews and provide a bilingual summary (Pros & Cons).
        Reviews: ${JSON.stringify(reviews)}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as ReviewSummary;
        }
        return null;
    } catch (e) {
        console.error("Review Summary Error", e);
        return null;
    }
};

// 8. Competitor Pricing Analysis
export const analyzeCompetitorPricing = async (productName: string, currentPrice: string): Promise<CompetitorInsight | null> => {
    try {
        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                competitor_name: { type: Type.STRING },
                competitor_price: { type: Type.STRING },
                suggestion: { type: Type.STRING },
            },
            required: ['competitor_name', 'competitor_price', 'suggestion']
        };

        const prompt = `You are a Market Analyst. 
        Product: "${productName}", Current Price: ${currentPrice} DKK.
        Simulate a Danish competitor analysis. 
        Invent a realistic competitor name and a price they might charge.
        Suggest if we should lower, hold, or raise our price.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as CompetitorInsight;
        }
        return null;
    } catch (e) {
        console.error("Pricing Analysis Error", e);
        return null;
    }
};

// 9. Social Media Responder
export const generateSocialResponses = async (message: string): Promise<SocialResponse | null> => {
    try {
        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                formal: { type: Type.STRING },
                casual: { type: Type.STRING },
                optimistic: { type: Type.STRING },
            },
            required: ['formal', 'casual', 'optimistic']
        };

        const prompt = `You are a Social Media Manager for a Danish brand.
        Customer Message: "${message}" (Detect language).
        
        Generate 3 reply options in the SAME language as the message:
        1. Formal (Polite, professional)
        2. Casual (Friendly, emojis, 'Hygge')
        3. Optimistic (Excited, helpful)`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as SocialResponse;
        }
        return null;
    } catch (e) {
        console.error("Social Response Error", e);
        return null;
    }
};

// 10. Smart Coupon (Cart Saver)
export const generateSmartCoupon = async (cartValue: number, isReturning: boolean): Promise<SmartCouponResult | null> => {
    try {
        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                code: { type: Type.STRING },
                discount: { type: Type.STRING },
                message_da: { type: Type.STRING },
                message_en: { type: Type.STRING },
                reasoning: { type: Type.STRING }
            },
            required: ['code', 'discount', 'message_da', 'message_en', 'reasoning']
        };

        const prompt = `You are a Retention Specialist.
        A customer abandoned a cart worth ${cartValue} DKK. Returning Customer: ${isReturning}.
        
        Generate a 'Rescue Coupon' to win them back.
        Logic: Higher discount for higher value or new customers.
        Create a persuasive message in Danish and English (short, punchy).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as SmartCouponResult;
        }
        return null;
    } catch (e) {
        console.error("Coupon Gen Error", e);
        return null;
    }
};

// 11. B2B Translator
export const translateBusinessText = async (text: string): Promise<string> => {
    try {
        const prompt = `Translate the following business text. 
        If it's Danish, translate to English. If it's English, translate to Danish.
        Maintain a professional, polite business tone suitable for B2B communication.
        
        Text: "${text}"
        
        Output only the translated text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "";
    } catch (e) {
        console.error("Translation Error", e);
        return "Error translating text.";
    }
};

// 12. Shop-the-Look Item Detection (Simulated for Demo)
// In a real scenario, this would return coordinates. Here we return a list of items to "map".
export const detectProductsInImage = async (imageFile: File): Promise<string[]> => {
    try {
        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                items: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['items']
        };

        const imagePart = await fileToGenerativePart(imageFile);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [imagePart, { text: "Identify the main furniture or decor items in this image. Return a list of names." }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            return data.items;
        }
        return [];
    } catch (e) {
        return [];
    }
};

// 13. Fraud Detection
export const analyzeFraudRisk = async (transaction: any): Promise<FraudAnalysis | null> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        risk_level: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
        score: { type: Type.INTEGER },
        reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
        action_recommendation: { type: Type.STRING }
      },
      required: ['risk_level', 'score', 'reasons', 'action_recommendation']
    };

    const prompt = `Analyze this e-commerce transaction for fraud risk.
    Data: ${JSON.stringify(transaction)}
    
    Look for: IP/Shipping Country mismatch, High Value, Disposable Email domains.
    Return a risk assessment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) return JSON.parse(response.text) as FraudAnalysis;
    return null;
  } catch (e) {
    console.error("Fraud Check Error", e);
    return null;
  }
};

// 14. Inventory Forecasting
export const predictInventory = async (history: any[]): Promise<ForecastRecommendation[]> => {
  try {
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          product_name: { type: Type.STRING },
          action: { type: Type.STRING, enum: ['Restock', 'Discount', 'Hold'] },
          quantity_suggestion: { type: Type.INTEGER },
          reasoning_da: { type: Type.STRING },
          reasoning_en: { type: Type.STRING },
        },
        required: ['product_name', 'action', 'quantity_suggestion', 'reasoning_da', 'reasoning_en']
      }
    };

    const prompt = `Act as an Inventory Planner. Analyze this sales history and suggest actions for next month.
    Data: ${JSON.stringify(history)}
    Consider Danish seasonality (e.g. Winter is high for indoor/hygge items).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) return JSON.parse(response.text) as ForecastRecommendation[];
    return [];
  } catch (e) {
    console.error("Forecast Error", e);
    return [];
  }
};

// 15. Landing Page Generator
export const generateLandingPage = async (goal: string): Promise<string> => {
  try {
    const prompt = `Create a responsive HTML landing page using Tailwind CSS for a Danish e-commerce campaign.
    Campaign Goal: "${goal}".
    
    Requirements:
    - Bilingual text (English and Danish) visible on the page.
    - Hero section with a placeholder image.
    - Features section.
    - CTA button.
    - Modern 'Nordic' design (clean, white space).
    - Return ONLY valid HTML code, no markdown code blocks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Strip markdown if present
    let cleanHtml = response.text || "";
    cleanHtml = cleanHtml.replace(/```html/g, '').replace(/```/g, '');
    return cleanHtml;
  } catch (e) {
    console.error("Landing Page Gen Error", e);
    return "Error generating page.";
  }
};

// 16. Accessibility Checker
export const auditAccessibility = async (htmlSnippet: string): Promise<AccessibilityAudit | null> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        issues: { type: Type.ARRAY, items: { type: Type.STRING } },
        fixed_html_snippet: { type: Type.STRING }
      },
      required: ['score', 'issues']
    };

    const prompt = `Audit this HTML snippet for WCAG accessibility (Color contrast, Alt text, ARIA).
    HTML: "${htmlSnippet}"
    
    Return a score (0-100), a list of issues, and a fixed version of the HTML.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) return JSON.parse(response.text) as AccessibilityAudit;
    return null;
  } catch (e) {
    console.error("Audit Error", e);
    return null;
  }
};

// 17. Voice Command Parser (Backend)
export const parseVoiceCommand = async (transcript: string): Promise<VoiceCommandIntent | null> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, enum: ['search_product', 'update_stock', 'navigate', 'unknown'] },
        parameters: { type: Type.OBJECT, properties: {} },
        confirmation_msg: { type: Type.STRING }
      },
      required: ['action', 'confirmation_msg']
    };

    const prompt = `You are a voice assistant for an e-commerce backend.
    User said: "${transcript}" (Language: Danish or English).
    
    Identify the intent:
    - update_stock (e.g. "Add 10 to chair")
    - navigate (e.g. "Go to dashboard")
    - search_product (e.g. "Find the red vase")
    
    Return JSON with action, parameters (e.g. quantity, product), and a confirmation message in the User's language.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) return JSON.parse(response.text) as VoiceCommandIntent;
    return null;
  } catch (e) {
    console.error("Voice Parse Error", e);
    return null;
  }
};

// 18. Bilingual Chatbot
export const chatWithAI = async (message: string, history: any[]): Promise<string> => {
  try {
    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a helpful, bilingual (Danish/English) e-commerce assistant for NORVOSS. Help customers with product questions, shipping info, and general support. Use a friendly, Nordic tone.",
      }
    });

    // Send history if needed, but for simplicity we just send the message
    const result = await chat.sendMessage({ message });
    return result.text || "I'm sorry, I couldn't process that.";
  } catch (e) {
    console.error("Chat Error", e);
    return "The chatbot is currently resting. Please try again later.";
  }
};
