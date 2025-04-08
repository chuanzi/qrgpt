import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import downloadQrCode from '@/utils/downloadQrCode';

type QrCardProps = {
  imageURL?: string;
  time: string;
  prompt?: string;
  id?: string;
};

export const QrCard: React.FC<QrCardProps> = ({ imageURL, time, prompt, id }) => {
  
  const handleShareClick = async () => {
    if (!imageURL) return;
    const toastId = toast.loading('Copying image to clipboard...');
    try {
      if (!navigator.clipboard || !navigator.clipboard.write) {
          throw new Error('Clipboard API not available.');
      }

      const response = await fetch(imageURL);
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

  const filename = prompt?.replace(/\s+/g, '_').slice(0,30) || `qrcode_${id}` || 'qrcode_image';

  if (!imageURL) {
    return (
      <div>
        <p>Image URL not provided</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-center items-center gap-y-2 w-[510px] border border-gray-300 rounded shadow group p-2 mx-auto max-w-full">
      <Image
        src={imageURL}
        className="rounded "
        alt="qr code"
        width={480}
        height={480}
      />
      <p className="text-gray-400 text-sm italic">
        QR code took {time} seconds to generate.
      </p>
      <div className="flex justify-center gap-4 mt-2">
          <Button
              onClick={() => downloadQrCode(imageURL, filename)}
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
