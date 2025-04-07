import CTA from '@/components/CTA';
// import GradientWrapper from '@/components/GradientWrapper'; // Removed import
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <>
      <Hero />
      {/* <GradientWrapper></GradientWrapper> */}{/* Removed GradientWrapper */}
      <CTA />
    </>
  );
}
