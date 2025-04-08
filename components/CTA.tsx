import NavLink from './NavLink';
import Image from 'next/image';

// Updated showcaseImages with correct paths
const showcaseImages = [
  // Gingerbread
  { src: '/picexamples/A_happy_dancing_gingerbread_ca.png', alt: 'Happy dancing gingerbread cake', type: 'gingerbread' },
  { src: '/picexamples/A_gingerbread_knight_riding_a_.png', alt: 'Gingerbread knight', type: 'gingerbread' },
  { src: '/picexamples/a_photo_of_a_GINGERBREAD_delor.png', alt: 'Decorated gingerbread photo', type: 'gingerbread' },
  // QR Code
  { src: '/1.png', alt: 'Artistic QR Code 1', type: 'qrcode' },
  { src: '/6.png', alt: 'Artistic QR Code 6', type: 'qrcode' },
  { src: '/3.png', alt: 'Artistic QR Code 3', type: 'qrcode' },
  // Cyberpunk Typeface
  { src: '/picexamples/_Neon__in_a_Cyberpunk_typeface.png', alt: 'Neon Cyberpunk Typeface', type: 'cyberpunk' },
  { src: '/picexamples/_Ghost__in_a_Cyberpunk_typefac.png', alt: 'Ghost Cyberpunk Typeface', type: 'cyberpunk' },
  { src: '/picexamples/_Tokyo__in_a_Cyberpunk_typefac.png', alt: 'Tokyo Cyberpunk Typeface', type: 'cyberpunk' },
];

const CTA = () => {
  // Group images by type
  const groupedImages = showcaseImages.reduce((acc, image) => {
    acc[image.type] = acc[image.type] || [];
    acc[image.type].push(image);
    return acc;
  }, {} as Record<string, typeof showcaseImages>);

  return (
  <SectionWrapper>
    <div className="custom-screen pt-0 pb-16">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 flex flex-col">
          <div className="text-indigo-600 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.79 10.37a2.49 2.49 0 0 1-2.2 4.34 2.54 2.54 0 0 1-1.46-.73 3.41 3.41 0 0 0-4.26 0 2.54 2.54 0 0 1-1.46.73 2.49 2.49 0 0 1-2.2-4.34 2.48 2.48 0 0 1 1.39-1.55 2.5 2.5 0 0 1 3.82 1.1 3.52 3.52 0 0 0 4.48 0 2.5 2.5 0 0 1 3.82-1.1 2.48 2.48 0 0 1 1.39 1.55Z"/><path d="M12 15.56a1.5 1.5 0 1 0-3 0"/><path d="M15 15.56a1.5 1.5 0 1 0 3 0"/></svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Gingerbread Art</h3>
          <p className="text-gray-600 mb-4">
            Create delightful and unique gingerbread characters and scenes with AI magic.
          </p>
          <div className="mt-auto">
            <NavLink
              href="/gingerbread"
              className="inline-block font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 py-2 px-4 rounded-lg duration-150"
            >
              Try Gingerbread
            </NavLink>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 flex flex-col">
          <div className="text-teal-600 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Artistic QR Codes</h3>
          <p className="text-gray-600 mb-4">
            Transform standard QR codes into captivating visual art that grabs attention.
          </p>
          <div className="mt-auto">
            <NavLink
              href="/qrcode"
              className="inline-block font-medium text-sm text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 py-2 px-4 rounded-lg duration-150"
            >
              Try QR Code
            </NavLink>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 flex flex-col">
          <div className="text-pink-600 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Cyberpunk Typeface</h3>
          <p className="text-gray-600 mb-4">
            Generate text in a stunning cyberpunk visual style.
          </p>
          <div className="mt-auto">
            <NavLink
              href="/cyberpunk"
              className="inline-block font-medium text-sm text-white bg-pink-600 hover:bg-pink-500 active:bg-pink-700 py-2 px-4 rounded-lg duration-150"
            >
              Try Cyberpunk
            </NavLink>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto text-center mt-16">
        <h2 className="text-gray-800 text-3xl font-semibold sm:text-4xl">
          See What You Can Create
        </h2>
        <p className="mt-3 text-gray-600 mb-8">
          Explore examples generated by ArtSpark.
        </p>
        
        {/* Render images grouped by type, 3 per row */}
        {Object.entries(groupedImages).map(([type, images]) => (
          <div key={type} className="mb-8">
            {/* Optional: Add type title if needed */}
            {/* <h4 className="text-xl font-semibold text-gray-700 mb-4 capitalize">{type} Examples</h4> */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {images.map((image, idx) => (
                <div key={idx} className="aspect-square relative">
                  <Image
                    alt={image.alt}
                    src={image.src}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 300px" // Adjust sizes as needed
                    className="rounded-lg shadow-md object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </SectionWrapper>
  );
};

const SectionWrapper = ({ children, ...props }: any) => (
  <section {...props} className={`py-0 ${props.className || ''}`}>
    {children}
  </section>
);

export default CTA;
