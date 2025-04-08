import { NextRequest, NextResponse } from 'next/server';
import { replicateClient } from '@/utils/ReplicateClient';
import {
  CyberpunkGenerateRequest, // Changed from GingerbreadGenerateRequest
  CyberpunkGenerateResponse, // Changed from GingerbreadGenerateResponse
} from '@/utils/service';
import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';
import { nanoid } from '@/utils/utils';

// Use the correct model ID and version for Cyberpunk Typeface
const CYBERPUNK_MODEL_ID = 'fofr/flux-cyberpunk-typeface:0a155773ae9a59d4cf87c778776024f5826f1e1c70dc2b817dae5732937dd1e1';
// Assuming the model output is an array of strings (image URLs)
type CyberpunkModelOutput = string[];

export async function POST(request: NextRequest) {
  let reqBody: CyberpunkGenerateRequest;
  try {
    reqBody = (await request.json()) as CyberpunkGenerateRequest;
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
    // Prepare input for the cyberpunk model
    const input: { [key: string]: any } = {
      // Prepend the trigger word to the user's prompt
      prompt: `cyberpunk typeface ${reqBody.prompt}`, 
    };
    // Add optional parameters if they exist in the request
    if (reqBody.aspect_ratio) input.aspect_ratio = reqBody.aspect_ratio;
    if (reqBody.guidance_scale) input.guidance_scale = reqBody.guidance_scale;
    if (reqBody.extra_lora_scale) input.extra_lora_scale = reqBody.extra_lora_scale;

    /* va.track('Started Cyberpunk Generation', {
        prompt: reqBody.prompt,
        ... other params
    }); */
    console.log(`[${id}] Starting Replicate prediction for cyberpunk... Input:`, input);
    t1 = performance.now();

    // Run the Replicate model
    const output = await replicateClient.runModel<
      typeof input,
      CyberpunkModelOutput
    >(CYBERPUNK_MODEL_ID, input);

    t2 = performance.now();
    console.log(`[${id}] Replicate prediction finished. Took: ${(t2 - t1).toFixed(0)}ms`);

    // Check output format
    if (!Array.isArray(output) || output.length === 0 || typeof output[0] !== 'string') {
        console.error(`[${id}] Unexpected output format from Cyberpunk model:`, output);
        throw new Error('Unexpected output format from Cyberpunk model');
    }
    // Assuming the first image is the desired output
    imageUrl = output[0];
    console.log(`[${id}] Image URL received: ${imageUrl}`);

  } catch (error) {
    console.error(`[${id}] Replicate API error:`, error);
     /* va.track('Failed Cyberpunk Generation', {
        prompt: reqBody.prompt,
        error: error instanceof Error ? error.message : String(error)
    }); */
    return NextResponse.json(
      { error: 'Failed to generate cyberpunk image' },
      { status: 500 },
    );
  }

  try {
    console.log(`[${id}] Fetching image blob...`);
    t3 = performance.now();
    // Convert output to a blob object
    // Note: Cyberpunk model outputs webp, let's try to keep it that way
    const file = await fetch(imageUrl).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
        return res.blob();
    });
    t4 = performance.now();
    // Use the blob's type, default to webp if unknown
    const contentType = file.type || 'image/webp';
    const fileExtension = contentType.split('/')[1] || 'webp'; // Extract extension
    console.log(`[${id}] Image blob fetched. Size: ${file.size} bytes, Type: ${contentType}. Took: ${(t4 - t3).toFixed(0)}ms`);

    console.log(`[${id}] Uploading to Vercel Blob...`);
    t5 = performance.now();
    // Upload & store in Vercel Blob with cyberpunk prefix and correct extension
    const blobPath = `cyberpunk/${id}.${fileExtension}`;
    const { url: blobUrl } = await put(blobPath, file, { 
        access: 'public',
        contentType: contentType // Pass correct content type
    });
    t6 = performance.now();
    console.log(`[${id}] Uploaded to Vercel Blob. URL: ${blobUrl}. Took: ${(t6 - t5).toFixed(0)}ms`);

    console.log(`[${id}] Writing to Vercel KV...`);
    const kvStartTime = performance.now();
    // Store metadata in Vercel KV
    await kv.hset(id, {
        type: 'cyberpunk', // Changed type
        prompt: reqBody.prompt,
        image: blobUrl,
        model_latency: Math.round(t2 - t1), // Store Replicate latency
        model_id: CYBERPUNK_MODEL_ID
    });
    const kvEndTime = performance.now();
    console.log(`[${id}] Written to Vercel KV. Took: ${(kvEndTime - kvStartTime).toFixed(0)}ms`);

     /* va.track('Completed Cyberpunk Generation', {
        prompt: reqBody.prompt,
        latency: Math.round(t2 - t1)
    }); */

    const overallEndTime = performance.now();
    const overallDuration = overallEndTime - overallStartTime;
    console.log(`[${id}] Request processed successfully. Total time: ${overallDuration.toFixed(0)}ms`);

    // Prepare response
    const response: CyberpunkGenerateResponse = {
      image_url: blobUrl, // Return the blob URL
      model_latency_ms: Math.round(t2 - t1),
      id: id,
    };
    return NextResponse.json(response, { status: 200 });

  } catch(error) { // Catch block for Blob/KV/Fetch errors
      console.error(`[${id}] Error during image processing/saving:`, error);
       /* va.track('Failed Cyberpunk Saving/Processing', {
        prompt: reqBody.prompt,
        error: error instanceof Error ? error.message : String(error)
       }); */

       // Explicitly handle fallback based on imageUrl availability
       if (imageUrl) {
            // Saving failed, but we have the original Replicate URL
            const fallbackResponse: CyberpunkGenerateResponse = {
              image_url: imageUrl,
              model_latency_ms: Math.round(t2 - t1),
              id: id,
            };
             console.warn(`[${id}] Processing/Saving failed, returning fallback response with Replicate URL.`);
             return NextResponse.json(fallbackResponse, { status: 200, headers: { 'X-Save-Warning': 'Failed to process/save image'} });
       } else {
            // Saving failed AND imageUrl wasn't available
            console.error(`[${id}] Processing/Saving failed and no Replicate URL available.`);
            return NextResponse.json({ error: 'Failed to generate or save cyberpunk image result' }, { status: 500 });
       }
  }
} 