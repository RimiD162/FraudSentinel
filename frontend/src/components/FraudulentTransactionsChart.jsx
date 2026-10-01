import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';

/**
 * Custom Tooltip for White & Gold theme
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E5DCBE] px-3.5 py-2 rounded-xl shadow-xl text-xs font-sans">
        <p className="text-[#8C8270] font-medium">{label}</p>
        <p className="text-[#1A1612] font-bold mt-0.5">
          {payload[0].value} <span className="text-amber-700 font-normal">fraudulent txns</span>
        </p>
      </div>
    );
  }
  return null;
};

/**
 * FraudulentTransactionsChart Component
 * Displays hourly/daily fraudulent transaction counts using an elegant amber BarChart.
 */
export default function FraudulentTransactionsChart({ fraudData }) {
  const { headline, total, timeframe, delta, isPositive, data } = fraudData;

  return (
    <div className="bg-white border border-[#E5DCBE] rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-amber-500/5 relative overflow-hidden">
      {/* Header section */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm text-[#5C5648] font-bold tracking-wider uppercase">
            {headline}
          </h3>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-3.5 h-3.5" />
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

      {/* Bar Chart with warm amber bars & rounded tops */}
      <div className="w-full h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            barSize={24}
          >
            <defs>
              <linearGradient id="goldBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8C8270', fontSize: 11, fontWeight: 500 }}
              dy={6}
            />
            <YAxis hide domain={[0, 'dataMax + 2']} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FBF8F0', opacity: 0.6 }} />
            <Bar
              dataKey="count"
              fill="url(#goldBarGradient)"
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
