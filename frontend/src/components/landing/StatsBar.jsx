import React from 'react';

/**
 * StatsBar Component
 * Trust & metrics bar in luxury White & Gold styling.
 */
export default function StatsBar() {
  const stats = [
    {
      label: 'Transactions Processed',
      value: '1,234,567+',
      subtext: '+12% from last month',
      isPositive: true,
    },
    {
      label: 'Detection Accuracy',
      value: '99.5%',
      subtext: '<0.05% false positive rate',
      isPositive: true,
    },
    {
      label: 'Alerts Triggered Monthly',
      value: '456',
      subtext: '-5% proactive mitigation',
      isPositive: false,
    },
    {
      label: 'Average Response Time',
      value: '<200ms',
      subtext: 'Ultra-low latency API',
      isPositive: true,
    },
  ];

  return (
    <section className="py-8 border-y border-[#EBE3D0] bg-[#FAF8F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5DCBE] rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-amber-400 group"
            >
              <span className="text-xs sm:text-sm text-[#6B6454] font-semibold tracking-wide">
                {stat.label}
              </span>
              <div className="mt-2 mb-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1A1612] tracking-tight group-hover:text-amber-800 transition-colors">
                  {stat.value}
                </span>
              </div>
              <div className="flex items-center text-xs font-bold mt-1">
                <span
                  className={
                    stat.isPositive ? 'text-emerald-700' : 'text-amber-700'
                  }
                >
                  {stat.subtext}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
