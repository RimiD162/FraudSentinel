import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * HowItWorks Component
 * Three numbered steps in a row illustrating the automated fraud prevention lifecycle.
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
    <section id="how-it-works" className="py-20 bg-[#0B0E14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Simple Integration
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
            How FraudSentinel Works
          </h2>
          <p className="text-base text-gray-400 mt-3">
            From raw transaction event to calibrated risk verdict in three continuous steps.
          </p>
        </div>

        {/* 3 Numbered Steps in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative bg-[#161A22] border border-[#222734] rounded-xl p-8 flex flex-col items-center text-center shadow-sm"
            >
              {/* Numbered Circle */}
              <div className="w-14 h-14 rounded-full bg-blue-600/10 border-2 border-blue-500 flex items-center justify-center text-blue-400 font-extrabold text-xl mb-6 shadow-inner shadow-blue-500/20">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white tracking-tight mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-400 leading-relaxed font-normal">
                {step.description}
              </p>

              {/* Arrow connector between steps on md+ */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-[#0B0E14] border border-[#222734] flex items-center justify-center text-blue-400">
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
