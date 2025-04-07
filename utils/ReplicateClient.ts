import { getEnv, ENV_KEY } from '@/utils/env';
import Replicate from 'replicate';
import { QrCodeControlNetRequest, QrCodeControlNetResponse } from './types';

// Define a generic type for the model input
type ModelInput = Record<string, unknown>;

export class ReplicateClient {
  replicate: Replicate;

  constructor(apiKey: string) {
    this.replicate = new Replicate({
      auth: apiKey,
    });
  }

  /**
   * Runs a specified Replicate model with the given input.
   * @param modelId - The ID of the Replicate model (e.g., "owner/model:version").
   * @param input - The input object for the model.
   * @returns The output from the model, typically an array of URLs or objects.
   */
  runModel = async <TInput extends ModelInput, TOutput>(
    modelId: string,
    input: TInput,
  ): Promise<TOutput> => {
    console.log(`[ReplicateClient] Calling runModel with ID: ${modelId}`);
    console.log(`[ReplicateClient] Input object:`, JSON.stringify(input, null, 2));
    
    // Restore type assertion to satisfy linter, pass modelId directly
    const output = await this.replicate.run(modelId as `${string}/${string}:${string}`, { input }); 
    if (!output) {
      console.error(`[ReplicateClient] Failed to run Replicate model: ${modelId} - Output was nullish.`);
      throw new Error(`Failed to run Replicate model: ${modelId}`);
    }
    console.log(`[ReplicateClient] Received output for model ${modelId}`);
    // Assuming the output type TOutput is directly returned by replicate.run
    return output as TOutput;
  };

  /**
   * Generate a QR code using the specific QR code model.
   */
  generateQrCode = async (
    request: QrCodeControlNetRequest,
  ): Promise<string> => {
    const modelId = 'zylim0702/qr_code_controlnet:628e604e13cf63d8ec58bd4d238474e8986b054bc5e1326e50995fdbc851c557';
    // Prepare input specifically for the QR code model
    const input = {
      url: request.url,
      prompt: request.prompt,
      qr_conditioning_scale: request.qr_conditioning_scale,
      num_inference_steps: request.num_inference_steps,
      guidance_scale: request.guidance_scale,
      negative_prompt: request.negative_prompt,
    };
    const output = await this.runModel<typeof input, QrCodeControlNetResponse>(modelId, input);

    // The QR code model returns an array of strings (image URLs)
    if (!Array.isArray(output) || output.length === 0 || typeof output[0] !== 'string') {
        throw new Error('Unexpected output format from QR code model');
    }

    return output[0];
  };
}

const apiKey = getEnv(ENV_KEY.REPLICATE_API_KEY);
if (!apiKey) {
  throw new Error('REPLICATE_API_KEY is not set');
}
export const replicateClient = new ReplicateClient(apiKey);
