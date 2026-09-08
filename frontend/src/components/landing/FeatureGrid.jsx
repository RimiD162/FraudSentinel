import React from 'react';
import { Activity, Cpu, Globe, BellRing } from 'lucide-react';

/**
 * FeatureGrid Component
 * Displays four core capability cards in a responsive grid using lucide-react icons.
 */
export default function FeatureGrid() {
  const features = [
    {
      icon: Activity,
      title: 'Real-time transaction monitoring',
      description:
        'Continuously evaluate incoming payment streams with sub-second velocity checks and behavioural heuristics.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      icon: Cpu,
      title: 'ML-based risk scoring',
      description:
        'Leverage adaptive machine learning models trained on millions of fraud vectors to output calibrated risk scores.',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      icon: Globe,
      title: 'Device and location analysis',
      description:
        'Detect spoofed IP addresses, geolocation anomalies, proxy tunnels, and suspicious browser fingerprint shifts.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      icon: BellRing,
      title: 'Instant fraud alerts',
      description:
        'Trigger automated containment protocols and notify compliance analysts immediately when anomalies breach threshold limits.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#0B0E14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Enterprise Protection
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
            Engineered to Outsmart Modern Fraud Syndicates
          </h2>
          <p className="text-base text-gray-400 mt-3 font-normal">
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
                className="bg-[#161A22] border border-[#222734] hover:border-gray-700/60 rounded-xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-sm group"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.bg} ${feature.border} border flex items-center justify-center mb-5 ${feature.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
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
