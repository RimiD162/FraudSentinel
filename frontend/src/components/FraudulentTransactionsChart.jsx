import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

/**
 * Custom Tooltip for dark mode
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0E14] border border-[#222734] px-3 py-1.5 rounded-lg shadow-lg text-xs">
        <p className="text-gray-400">{label}</p>
        <p className="text-white font-semibold">{payload[0].value} fraudulent</p>
      </div>
    );
  }
  return null;
};

/**
 * FraudulentTransactionsChart Component
 * Displays hourly fraudulent transaction counts using a Recharts BarChart with rounded tops.
 */
export default function FraudulentTransactionsChart({ fraudData }) {
  const { headline, total, timeframe, delta, isPositive, data } = fraudData;

  return (
    <div className="bg-[#161A22] border border-[#222734] rounded-xl p-5 flex flex-col justify-between shadow-sm">
      {/* Header section */}
      <div>
        <h3 className="text-sm text-gray-400 font-medium tracking-wide">
          {headline}
        </h3>
        <div className="mt-1">
          <span className="text-3xl font-bold text-white tracking-tight">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs mt-1">
          <span className="text-gray-400">{timeframe}</span>
          <span className={isPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
            {delta}
          </span>
        </div>
      </div>

      {/* Bar Chart with muted white/gray bars & rounded tops */}
      <div className="w-full h-44 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            barSize={28}
          >
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              dy={6}
            />
            <YAxis hide domain={[0, 'dataMax + 2']} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#222734', opacity: 0.3 }} />
            <Bar
              dataKey="count"
              fill="#E2E8F0"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
