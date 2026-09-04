import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

/**
 * Custom Tooltip for dark mode
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0E14] border border-[#222734] px-3 py-1.5 rounded-lg shadow-lg text-xs">
        <p className="text-gray-400">{label}</p>
        <p className="text-white font-semibold">{payload[0].value.toLocaleString()} txns</p>
      </div>
    );
  }
  return null;
};

/**
 * TransactionVolumeChart Component
 * Displays the 24-hour transaction volume trend using a smooth Recharts LineChart.
 */
export default function TransactionVolumeChart({ volumeData }) {
  const { headline, total, timeframe, delta, isPositive, data } = volumeData;

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

      {/* Line Chart without visible grid or axis lines */}
      <div className="w-full h-44 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              dy={6}
            />
            <YAxis hide domain={['dataMin - 200', 'dataMax + 200']} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#F8FAFC"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
