export interface OpenRouterPricing {
  prompt: string;
  completion: string;
}

export interface OpenRouterModelRaw {
  id: string;
  name: string;
  description: string;
  pricing: OpenRouterPricing;
  context_length: number;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricingPrompt1M: number;
  pricingCompletion1M: number;
  isFavorite: boolean;
}