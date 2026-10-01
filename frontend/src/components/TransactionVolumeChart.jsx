import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

/**
 * Custom Tooltip for White & Gold theme
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E5DCBE] px-3.5 py-2 rounded-xl shadow-xl text-xs font-sans">
        <p className="text-[#8C8270] font-medium">{label}</p>
        <p className="text-[#1A1612] font-bold mt-0.5">
          {payload[0].value.toLocaleString()} <span className="text-amber-700 font-normal">transactions</span>
        </p>
      </div>
    );
  }
  return null;
};

/**
 * TransactionVolumeChart Component
 * Displays 24-hour / multi-day transaction volume trends using an elegant amber AreaChart.
 */
export default function TransactionVolumeChart({ volumeData }) {
  const { headline, total, timeframe, delta, isPositive, data } = volumeData;

  return (
    <div className="bg-white border border-[#E5DCBE] rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-amber-500/5 relative overflow-hidden">
      {/* Header section */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm text-[#5C5648] font-bold tracking-wider uppercase">
            {headline}
          </h3>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2 mb-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#1A1612] tracking-tight">
            {total}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs mt-1">
          <span className="text-[#8C8270] font-medium">{timeframe}</span>
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isPositive
                ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                : 'text-rose-800 bg-rose-50 border border-rose-200'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </span>
        </div>
      </div>

      {/* Area Chart with Warm Gold Gradient */}
      <div className="w-full h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="goldVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8C8270', fontSize: 11, fontWeight: 500 }}
              dy={6}
            />
            <YAxis hide domain={['dataMin - 200', 'dataMax + 200']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#D97706"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#goldVolumeGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
