'use client';

export default function Hero() {
  return (
    <section className="pb-16">
      <div className="custom-screen pt-28 text-gray-600">
        <div className="space-y-5 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl text-gray-800 font-extrabold mx-auto sm:text-6xl">
            Spark Your Creativity: Generate Stunning AI Art in Seconds
          </h1>
          <p className="max-w-xl mx-auto">
            ArtSpark empowers you to instantly create unique AI-driven images,
            from artistic QR codes to whimsical gingerbread figures. Unleash
            your imagination, completely for free.
          </p>
          {/* Removed the button container div */}
          {/*
          <div className="flex items-center justify-center gap-x-3 font-medium text-sm">
            <NavLink
              href="/qrcode"
              className="text-white bg-gray-800 hover:bg-gray-600 active:bg-gray-900 "
            >
              Generate QR Code
            </NavLink>
            <NavLink
              href="/gingerbread"
              className="text-white bg-gray-800 hover:bg-gray-600 active:bg-gray-900 "
            >
              Generate Gingerbread
            </NavLink>
          </div>
          */}
          {/* Removed the heroImages grid */}
          {/* 
          <div className="grid sm:grid-cols-3 grid-cols-2 gap-4 pt-10">
            {heroImages.map((image, idx) => (
              <Image
                key={idx}
                alt="image"
                src={image}
                width={500}
                height={500}
                className="rounded-lg"
              />
            ))}
          </div>
          */}
        </div>
      </div>
    </section>
  );
}
