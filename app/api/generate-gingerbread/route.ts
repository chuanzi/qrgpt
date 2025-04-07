import { NextRequest, NextResponse } from 'next/server';
import { replicateClient } from '@/utils/ReplicateClient';
import {
  GingerbreadGenerateRequest,
  GingerbreadGenerateResponse,
} from '@/utils/service';
import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';
import { nanoid } from '@/utils/utils';

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
  const overallStartTime = performance.now();
  let t1: number, t2: number, t3: number, t4: number, t5: number, t6: number; // Timing points
  let imageUrl: string;

  try {
    // Prepare input for the gingerbread model
    const input = {
      prompt: reqBody.prompt,
      // Add any other specific parameters required by fofr/flux-gingerbread here
      // e.g., width: 512, height: 512
    };

    /* va.track('Started Gingerbread Generation', {
        prompt: reqBody.prompt,
    }); */
    console.log(`[${id}] Starting Replicate prediction...`);
    t1 = performance.now();
    
    // Run the Replicate model
    const output = await replicateClient.runModel<
      typeof input,
      GingerbreadModelOutput
    >(GINGERBREAD_MODEL_ID, input);
    
    t2 = performance.now();
    console.log(`[${id}] Replicate prediction finished. Took: ${(t2 - t1).toFixed(0)}ms`);

    // Check output format
    if (!Array.isArray(output) || output.length === 0 || typeof output[0] !== 'string') {
        console.error(`[${id}] Unexpected output format from Gingerbread model:`, output);
        throw new Error('Unexpected output format from Gingerbread model');
    }
    imageUrl = output[0];
    console.log(`[${id}] Image URL received: ${imageUrl}`);

  } catch (error) {
    console.error(`[${id}] Replicate API error:`, error);
     /* va.track('Failed Gingerbread Generation', {
        prompt: reqBody.prompt,
        error: error instanceof Error ? error.message : String(error)
    }); */
    return NextResponse.json(
      { error: 'Failed to generate gingerbread image' },
      { status: 500 },
    );
  }

  try {
    console.log(`[${id}] Fetching image blob...`);
    t3 = performance.now();
    // Convert output to a blob object
    const file = await fetch(imageUrl).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
        return res.blob();
    });
    t4 = performance.now();
    console.log(`[${id}] Image blob fetched. Size: ${file.size} bytes. Took: ${(t4 - t3).toFixed(0)}ms`);

    console.log(`[${id}] Uploading to Vercel Blob...`);
    t5 = performance.now();
    // Upload & store in Vercel Blob
    const blobPath = `gingerbread/${id}.png`; // Assuming png, adjust if needed
    const { url: blobUrl } = await put(blobPath, file, { 
        access: 'public',
        contentType: file.type // Pass content type
    });
    t6 = performance.now();
    console.log(`[${id}] Uploaded to Vercel Blob. URL: ${blobUrl}. Took: ${(t6 - t5).toFixed(0)}ms`);

    console.log(`[${id}] Writing to Vercel KV...`);
    const kvStartTime = performance.now();
    // Store metadata in Vercel KV
    await kv.hset(id, {
        type: 'gingerbread',
        prompt: reqBody.prompt, // Store original prompt without trigger word
        image: blobUrl, 
        model_latency: Math.round(t2 - t1), // Store Replicate latency
        model_id: GINGERBREAD_MODEL_ID
    });
    const kvEndTime = performance.now();
    console.log(`[${id}] Written to Vercel KV. Took: ${(kvEndTime - kvStartTime).toFixed(0)}ms`);

     /* va.track('Completed Gingerbread Generation', {
        prompt: reqBody.prompt,
        latency: Math.round(t2 - t1)
    }); */

    const overallEndTime = performance.now();
    const overallDuration = overallEndTime - overallStartTime;
    console.log(`[${id}] Request processed successfully. Total time: ${overallDuration.toFixed(0)}ms`);

    // Prepare response
    const response: GingerbreadGenerateResponse = {
      image_url: blobUrl, // Return the blob URL
      model_latency_ms: Math.round(t2 - t1), // Return Replicate model latency only
      id: id,
    };
    return NextResponse.json(response, { status: 200 });

  } catch(error) { // Catch block for Blob/KV/Fetch errors
      console.error(`[${id}] Error during image processing/saving:`, error);
       /* va.track('Failed Gingerbread Saving/Processing', {
        prompt: reqBody.prompt,
        error: error instanceof Error ? error.message : String(error)
       }); */
       
       // Explicitly handle fallback based on imageUrl availability
       if (imageUrl) {
            // Saving failed, but we have the original Replicate URL
            const fallbackResponse: GingerbreadGenerateResponse = {
              image_url: imageUrl,
              model_latency_ms: Math.round(t2 - t1), // Still use Replicate latency
              id: id, 
            };
             console.warn(`[${id}] Processing/Saving failed, returning fallback response with Replicate URL.`);
             return NextResponse.json(fallbackResponse, { status: 200, headers: { 'X-Save-Warning': 'Failed to process/save image'} });
       } else {
            // Saving failed AND imageUrl wasn't available (this case is less likely)
            console.error(`[${id}] Processing/Saving failed and no Replicate URL available.`);
            return NextResponse.json({ error: 'Failed to generate or save gingerbread image result' }, { status: 500 });
       }
  }
} 