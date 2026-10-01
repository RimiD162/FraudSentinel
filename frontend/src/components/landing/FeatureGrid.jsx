import React from 'react';
import { Activity, Cpu, Globe, BellRing } from 'lucide-react';

/**
 * FeatureGrid Component
 * Displays four core capability cards in a White & Gold luxury theme.
 */
export default function FeatureGrid() {
  const features = [
    {
      icon: Activity,
      title: 'Real-time transaction monitoring',
      description:
        'Continuously evaluate incoming payment streams with sub-second velocity checks and behavioural heuristics.',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
    },
    {
      icon: Cpu,
      title: 'ML-based risk scoring',
      description:
        'Leverage adaptive machine learning models trained on millions of fraud vectors to output calibrated risk scores.',
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
    },
    {
      icon: Globe,
      title: 'Device and location analysis',
      description:
        'Detect spoofed IP addresses, geolocation anomalies, proxy tunnels, and suspicious browser fingerprint shifts.',
      color: 'text-amber-800',
      bg: 'bg-[#FAF5E6]',
      border: 'border-amber-300',
    },
    {
      icon: BellRing,
      title: 'Instant fraud alerts',
      description:
        'Trigger automated containment protocols and notify compliance analysts immediately when anomalies breach threshold limits.',
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-300',
    },
  ];

  return (
    <section id="features" className="py-16 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1612] tracking-tight">
            Engineered to Outsmart Modern Fraud Syndicates
          </h2>
          <p className="text-base sm:text-lg text-[#5C5648] mt-3 font-normal">
            Everything your risk team needs to identify suspicious activity, prevent unauthorized chargebacks, and maintain seamless checkout experiences.
          </p>
        </div>

        {/* 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E5DCBE] hover:border-amber-400 rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 group"
              >
                <div>
                  <div
                    className={`w-13 h-13 p-3.5 rounded-xl ${feature.bg} ${feature.border} border flex items-center justify-center mb-6 ${feature.color} shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1612] tracking-tight mb-3 group-hover:text-amber-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#5C5648] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
