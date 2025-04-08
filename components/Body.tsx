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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import { QrGenerateRequest, QrGenerateResponse } from '@/utils/service';
import { QrCard } from '@/components/QrCard';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import LoadingDots from '@/components/ui/loadingdots';
import downloadQrCode from '@/utils/downloadQrCode';
import va from '@vercel/analytics';
import { PromptSuggestion } from '@/components/PromptSuggestion';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { generateQrPrompts } from '@/utils/promptGenerator';

const generateFormSchema = z.object({
  url: z.string().min(1),
  prompt: z.string().min(3).max(160),
});

type GenerateFormValues = z.infer<typeof generateFormSchema>;

const Body = ({
  imageUrl,
  prompt,
  redirectUrl,
  modelLatency,
  id,
}: {
  imageUrl?: string;
  prompt?: string;
  redirectUrl?: string;
  modelLatency?: number;
  id?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<QrGenerateResponse | null>(null);
  const [submittedURL, setSubmittedURL] = useState<string | null>(null);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const router = useRouter();

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    mode: 'onChange',

    // Set default values so that the form inputs are controlled components.
    defaultValues: {
      url: '',
      prompt: '',
    },
  });

  const refreshPrompts = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newPrompts = generateQrPrompts(4);
      setPromptSuggestions(newPrompts);
      setIsRefreshing(false);
    }, 300);
  }, []);

  useEffect(() => {
    refreshPrompts();
  }, [refreshPrompts]);

  useEffect(() => {
    if (imageUrl && prompt && redirectUrl && modelLatency && id) {
      setResponse({
        image_url: imageUrl,
        model_latency_ms: modelLatency,
        id: id,
      });
      setSubmittedURL(redirectUrl);

      form.setValue('prompt', prompt);
      form.setValue('url', redirectUrl);
    }
  }, [imageUrl, modelLatency, prompt, redirectUrl, id, form]);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      form.setValue('prompt', suggestion);
    },
    [form],
  );

  const handleSubmit = useCallback(
    async (values: GenerateFormValues) => {
      setIsLoading(true);
      setResponse(null);
      setSubmittedURL(values.url);

      try {
        const request: QrGenerateRequest = {
          url: values.url,
          prompt: values.prompt,
        };
        const response = await fetch('/api/generate', {
          method: 'POST',
          body: JSON.stringify(request),
        });

        // Handle API errors.
        if (!response.ok || response.status !== 200) {
          const text = await response.text();
          throw new Error(
            `Failed to generate QR code: ${response.status}, ${text}`,
          );
        }

        const data = await response.json();

        va.track('Generated QR Code', {
          prompt: values.prompt,
        });

        router.push(`/qrcode/${data.id}`);
      } catch (error) {
        va.track('Failed to generate', {
          prompt: values.prompt,
        });
        if (error instanceof Error) {
          setError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return (
    <div className="flex justify-center items-center flex-col w-full lg:p-0 p-4 sm:mb-28 mb-0">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mt-10">
        <div className="col-span-1">
          <h1 className="text-3xl font-bold mb-10">Generate a QR Code</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="roomgpt.io" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is what your QR code will link to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A city view with clouds"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="">
                        This is what the image in your QR code will look like.
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
                    {promptSuggestions.map((suggestion) => (
                      <PromptSuggestion
                        key={suggestion}
                        suggestion={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <LoadingDots color="white" />
                    ) : (
                      <span>Generate Image</span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
        <div className="col-span-1">
          <h1 className="text-3xl font-bold mb-10">Your QR Code Image</h1>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          {response ? (
            <>
              <QrCard
                imageURL={response.image_url}
                time={
                  modelLatency ? (modelLatency / 1000).toFixed(2) : '?'
                }
              />
              <p className="pt-2 text-center text-xs italic">
                Every QR code is unique. No one will have the same QR code as you.
              </p>
            </>
          ) : (
            <div className="h-[530px] w-full rounded-2xl bg-white p-2 ring-2 ring-gray-200 flex items-center justify-center">
              <p className="text-center text-gray-400 italic">
                Your QR code will appear here, after generation.
              </p>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Body;
