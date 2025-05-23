export interface QrGenerateRequest {
  /**
   * URL that the QR code will point to.
   */
  url: string;

  /**
   * Accompanying text prompt that will decide the style or theme of the code.
   */
  prompt: string;

  /**
   * Conditioning scale for qr controlnet
   */
  qr_conditioning_scale?: number;

  /**
   * Steps to run denoising
   */

  num_inference_steps?: number;
}

export interface QrGenerateResponse {
  /**
   * URL of the QR code images that was generated by the model.
   */
  image_url: string;

  /**
   * Response latency in milliseconds.
   */
  model_latency_ms: number;

  /**
   * Unique ID of the QR code.
   * This ID can be used to retrieve the QR code image from the API.
   */
  id: string;
}

// Add types for Gingerbread generation
export interface GingerbreadGenerateRequest {
  prompt: string;
}

export interface GingerbreadGenerateResponse {
  image_url: string;
  model_latency_ms: number;
  id: string;
}

// Add types for Cyberpunk Typeface generation
export interface CyberpunkGenerateRequest {
  prompt: string;
  aspect_ratio?: string; // e.g., "3:2", "1:1", "2:3"
  guidance_scale?: number;
  extra_lora_scale?: number;
}

export interface CyberpunkGenerateResponse {
  image_url: string;
  model_latency_ms: number;
  id: string;
}
