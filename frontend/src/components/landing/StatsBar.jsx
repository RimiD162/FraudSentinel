import React from 'react';

/**
 * StatsBar Component
 * Trust & metrics bar reusing dashboard stat-card visual aesthetic.
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
    <section className="py-10 border-y border-[#222734] bg-[#0E121A]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#161A22] border border-[#222734] rounded-xl p-5 flex flex-col justify-between shadow-sm transition-transform hover:-translate-y-0.5 duration-150"
            >
              <span className="text-xs sm:text-sm text-gray-400 font-medium tracking-wide">
                {stat.label}
              </span>
              <div className="mt-2 mb-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </span>
              </div>
              <div className="flex items-center text-xs font-semibold mt-1">
                <span
                  className={
                    stat.isPositive ? 'text-emerald-400' : 'text-blue-400'
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
