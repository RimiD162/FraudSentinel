import React from 'react';
import NavBar from '../components/landing/NavBar.jsx';
import Hero from '../components/landing/Hero.jsx';
import StatsBar from '../components/landing/StatsBar.jsx';
import FeatureGrid from '../components/landing/FeatureGrid.jsx';
import ProductPreview from '../components/landing/ProductPreview.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import CtaBanner from '../components/landing/CtaBanner.jsx';
import Footer from '../components/landing/Footer.jsx';

/**
 * Landing Page Component (Route: `/`)
 * Assembles all SaaS marketing sections in a luxury White & Gold design aesthetic.
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1612] flex flex-col selection:bg-amber-400/30 selection:text-amber-950 font-sans">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <FeatureGrid />
        <ProductPreview />
        <HowItWorks />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
