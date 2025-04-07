import { NextRequest, NextResponse } from 'next/server';
import { replicateClient } from '@/utils/ReplicateClient';
import {
  GingerbreadGenerateRequest,
  GingerbreadGenerateResponse,
} from '@/utils/service';
import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';
import { nanoid } from '@/utils/utils';
import va from '@vercel/analytics';

// Use the correct model ID and version from the example
const GINGERBREAD_MODEL_ID = 'fofr/flux-gingerbread:503940bae1420b7b37ca91b8ff0f3a43974b48143225f2a6eeadd0d099f13e6f';
// Assuming the model output is an array of strings (image URLs)
type GingerbreadModelOutput = string[];

export async function POST(request: NextRequest) {
  let reqBody: GingerbreadGenerateRequest;
  try {
    reqBody = (await request.json()) as GingerbreadGenerateRequest;
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Validate prompt
  if (!reqBody.prompt || typeof reqBody.prompt !== 'string') {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const id = nanoid();
  const startTime = performance.now();
  let imageUrl: string;

  try {
    // Prepare input for the gingerbread model
    const input = {
      prompt: reqBody.prompt,
      // Add any other specific parameters required by fofr/flux-gingerbread here
      // e.g., width: 512, height: 512
    };

    va.track('Started Gingerbread Generation', {
        prompt: reqBody.prompt,
    });

    // Run the Replicate model using the generic method
    const output = await replicateClient.runModel<
      typeof input,
      GingerbreadModelOutput
    >(GINGERBREAD_MODEL_ID, input);

    // Check output format (assuming it returns an array of URLs)
    if (!Array.isArray(output) || output.length === 0 || typeof output[0] !== 'string') {
        console.error('Unexpected output format from Gingerbread model:', output);
        throw new Error('Unexpected output format from Gingerbread model');
    }
    imageUrl = output[0];

  } catch (error) {
    console.error('Replicate API error:', error);
     va.track('Failed Gingerbread Generation', {
        prompt: reqBody.prompt,
        error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json(
      { error: 'Failed to generate gingerbread image' },
      { status: 500 },
    );
  }

  const endTime = performance.now();
  const durationMS = endTime - startTime;

  try {
    // Convert output to a blob object
    const file = await fetch(imageUrl).then((res) => res.blob());

    // Upload & store in Vercel Blob
    const blobPath = `gingerbread/${id}.png`;
    const { url: blobUrl } = await put(blobPath, file, { access: 'public' });

    // Store metadata in Vercel KV
    await kv.hset(id, {
        type: 'gingerbread',
        prompt: reqBody.prompt,
        image: blobUrl, // Store the blob URL
        model_latency: Math.round(durationMS),
        model_id: GINGERBREAD_MODEL_ID
    });

     va.track('Completed Gingerbread Generation', {
        prompt: reqBody.prompt,
        latency: durationMS
    });

    // Prepare response
    const response: GingerbreadGenerateResponse = {
      image_url: blobUrl, // Return the blob URL
      model_latency_ms: Math.round(durationMS),
      id: id,
    };

    return NextResponse.json(response, { status: 200 });

  } catch(error) {
      console.error('Error saving result:', error);
       va.track('Failed Gingerbread Saving', {
        prompt: reqBody.prompt,
        error: error instanceof Error ? error.message : String(error)
       });
       // Even if saving fails, try to return the original Replicate URL if available
       if (imageUrl) {
            const fallbackResponse: GingerbreadGenerateResponse = {
              image_url: imageUrl,
              model_latency_ms: Math.round(durationMS),
              id: id, // ID might still be useful
            };
             return NextResponse.json(fallbackResponse, { status: 200, headers: { 'X-Save-Warning': 'Failed to save image to storage'} });
       }
       return NextResponse.json({ error: 'Failed to save gingerbread image result' }, { status: 500 });
  }
} 