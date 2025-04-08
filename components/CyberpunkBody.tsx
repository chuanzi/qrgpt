'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCallback, useState, useEffect } from 'react';
import {
  CyberpunkGenerateRequest,
  CyberpunkGenerateResponse,
} from '@/utils/service';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import LoadingDots from '@/components/ui/loadingdots';
import downloadQrCode from '@/utils/downloadQrCode';
import va from '@vercel/analytics';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';
import { PromptSuggestion } from '@/components/PromptSuggestion';
import { Share2 } from 'lucide-react';
import { generateCyberpunkPrompts } from '@/utils/promptGenerator';

// Simplified schema for the cyberpunk generation form
const cyberpunkFormSchema = z.object({
  prompt: z.string().min(3, { message: 'Prompt must be at least 3 characters' }).max(500, { message: 'Prompt cannot exceed 500 characters' }),
});

// 删除静态提示列表，改用动态生成
// const cyberpunkSuggestions = [
//     '"Tokyo" in a Cyberpunk typeface on a rainy street',
//     '"Neon" in a Cyberpunk typeface with glitch effects',
//     '"Future" in a Cyberpunk typeface on a circuit board',
//     '"Digital" in a Cyberpunk typeface against a cityscape'
// ];

type CyberpunkFormValues = z.infer<typeof cyberpunkFormSchema>;

// ImageCard remains the same
const ImageCard = ({
  imageUrl,
  prompt,
  time
}: { imageUrl: string; prompt: string; time: string }) => {

  const handleShareClick = async () => {
    const toastId = toast.loading('Copying image to clipboard...');
    try {
      if (!navigator.clipboard || !navigator.clipboard.write) {
          throw new Error('Clipboard API not available.');
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();

      // Recreate blob with correct type before creating ClipboardItem
      const pngBlob = new Blob([blob], { type: 'image/png' });
      
      const item = new ClipboardItem({ 'image/png': pngBlob });
      await navigator.clipboard.write([item]);

      toast.success('Image copied! You can paste it now.', { id: toastId });

    } catch (error) {
      console.error('Failed to copy image:', error);
      let errorMessage = 'Failed to copy image.';
      if (error instanceof Error) {
         if (error.message.includes('Clipboard API not available')) {
             errorMessage = 'Clipboard access not supported by your browser.';
         } else if (error.message.includes('write() requires')) {
              errorMessage = 'Clipboard permission denied or not available in this context.';
         } else {
             errorMessage = `Failed to copy: ${error.message}`;
         }
      }
      toast.error(errorMessage, { id: toastId });
    }
  };

  return (
    <div className="border border-gray-300 rounded shadow group p-4 mx-auto flex flex-col items-center gap-4 w-full">
      <div className="relative w-full aspect-square">
          <Image
              src={imageUrl}
              alt={`Generated cyberpunk image for prompt: ${prompt}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain rounded"
              priority
          />
      </div>
      <p className="text-sm text-gray-500 text-center">Generated in: {time} seconds</p>
      <div className="flex justify-center gap-4 mt-2">
          <Button
              onClick={() => downloadQrCode(imageUrl, prompt.replace(/\s+/g, '_').slice(0,30) || 'cyberpunk_image')}
              >
              Download
          </Button>
          <Button
               variant="outline"
               onClick={handleShareClick}
               >
               <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
      </div>
    </div>
  );
};

// Main component for Cyberpunk generation UI (simplified)
export const CyberpunkBody = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<CyberpunkGenerateResponse | null>(null);
  const [submittedPrompt, setSubmittedPrompt] = useState<string | null>(null);
  // 添加提示建议状态
  const [cyberpunkSuggestions, setCyberpunkSuggestions] = useState<string[]>([]);
  // 添加刷新状态
  const [isRefreshing, setIsRefreshing] = useState(false);

  const form = useForm<CyberpunkFormValues>({
    resolver: zodResolver(cyberpunkFormSchema),
    mode: 'onChange',
    defaultValues: {
      prompt: '',
    },
  });

  // 初始化和刷新提示函数
  const refreshPrompts = useCallback(() => {
    setIsRefreshing(true);
    // 模拟网络延迟
    setTimeout(() => {
      const newPrompts = generateCyberpunkPrompts(4);
      setCyberpunkSuggestions(newPrompts);
      setIsRefreshing(false);
    }, 300);
  }, []);

  // 页面加载时初始化提示
  useEffect(() => {
    refreshPrompts();
  }, [refreshPrompts]);

  // Callback to handle suggestion clicks
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      form.setValue('prompt', suggestion);
    },
    [form],
  );

  const handleSubmit = useCallback(async (values: CyberpunkFormValues) => {
    setIsLoading(true);
    setResponse(null);
    setError(null);
    setSubmittedPrompt(values.prompt);

    try {
      // Simplified request, only sending prompt
      const request: CyberpunkGenerateRequest = {
        prompt: values.prompt,
      };

      const apiResponse = await fetch('/api/generate-cyberpunk', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown API Error'}));
        throw new Error(
          `Generation failed (${apiResponse.status}): ${errorData.error || apiResponse.statusText}`,
        );
      }

      const data: CyberpunkGenerateResponse = await apiResponse.json();
      setResponse(data);

      // Simplified analytics tracking
      va.track('Generated Cyberpunk Image', {
        prompt: request.prompt,
        id: data.id
      });
      toast.success('Cyberpunk image generated successfully!');

    } catch (error) {
       // Simplified error tracking
      va.track('Failed to generate Cyberpunk Image', {
        prompt: values.prompt,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      if (error instanceof Error) {
        setError(error);
        toast.error(`Generation Failed: ${error.message}`);
      }
       else {
        setError(new Error('An unknown error occurred'));
        toast.error('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex justify-center items-center flex-col w-full lg:p-0 p-4 sm:mb-28 mb-0">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mt-10">
        <div className="col-span-1">
          <h1 className="text-3xl font-bold mb-10">
            Generate a Cyberpunk Typeface
          </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='"Cyber" in a Cyberpunk typeface with glitch effects'
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the cyberpunk typeface image you want to generate.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="my-2">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-medium">Prompt suggestions</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refreshPrompts}
                      disabled={isRefreshing}
                      className="h-8"
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh Suggestions
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 grid-cols-1 gap-3 text-center text-gray-500 text-sm">
                    {cyberpunkSuggestions.map((suggestion) => (
                      <PromptSuggestion
                        key={suggestion}
                        suggestion={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4"
                >
                  {isLoading ? (
                    <LoadingDots color="white" />
                  ) : response ? (
                    '✨ Regenerate'
                  ) : (
                    <span>Generate</span>
                  )}
                </Button>
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Results Section */}
        <div className="col-span-1">
          <h1 className="text-3xl font-bold mb-10">Your Cyberpunk Image</h1>
          
          {response ? (
            <ImageCard 
              imageUrl={response.image_url} 
              prompt={submittedPrompt || ''} 
              time={(response.model_latency_ms / 1000).toFixed(2)}
            />
          ) : (
            <div className="border border-gray-300 rounded shadow aspect-square w-full flex items-center justify-center bg-gray-50">
              <p className="text-center text-gray-400 italic">
                Your cyberpunk typeface image will appear here after generation.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Toaster position="top-center" />
    </div>
  );
}; 