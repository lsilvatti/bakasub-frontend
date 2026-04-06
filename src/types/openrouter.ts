export interface OpenRouterPricing {
  prompt: string;
  completion: string;
}

export interface OpenRouterModelRaw {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
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