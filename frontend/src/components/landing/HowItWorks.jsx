import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * HowItWorks Component
 * Three numbered steps in a row in a luxury White & Gold theme.
 */
export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Transaction comes in',
      description:
        'Payment gateways and API endpoints securely stream transaction metadata and device signals in real time.',
    },
    {
      number: '2',
      title: 'ML model scores risk',
      description:
        'Our low-latency machine learning engine cross-references behavioral heuristics, velocities, and historical fraud vectors in under 200ms.',
    },
    {
      number: '3',
      title: 'Analyst gets alerted',
      description:
        'High-risk actions are automatically blocked or surfaced with detailed forensic reasoning to risk analysts for rapid triage.',
    },
  ];

  return (
    <section id="how-it-works" className="pt-8 pb-8 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1612] tracking-tight">
            How FraudSentinel Works
          </h2>
          <p className="text-base sm:text-lg text-[#5C5648] mt-2.5">
            From raw transaction event to calibrated risk verdict in three continuous steps.
          </p>
        </div>

        {/* 3 Numbered Steps in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative bg-white border border-[#E5DCBE] hover:border-amber-400 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-200 hover:-translate-y-1 group"
            >
              {/* Numbered Circle with gold gradient */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-xl mb-6 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="text-lg font-extrabold text-[#1A1612] tracking-tight mb-3 group-hover:text-amber-800 transition-colors">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#5C5648] leading-relaxed font-normal">
                {step.description}
              </p>

              {/* Arrow connector between steps on md+ */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E5DCBE] shadow-sm flex items-center justify-center text-amber-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
