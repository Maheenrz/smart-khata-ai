import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts'

// 1. Money In vs Money Out — Bar Chart
export function CashFlowBarChart({ data }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
          Cash In vs Cash Out
        </h3>
        <p className="text-gray-400 text-xs">آمدنی بمقابلہ اخراجات — Last 6 months</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `₨${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e7e5e4',
              fontSize: '0.78rem'
            }}
            formatter={v => `₨${v.toLocaleString()}`}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
          />
          <Bar dataKey="collected" name="Collected" fill="#052e16" radius={[4, 4, 0, 0]} />
          <Bar dataKey="outstanding" name="Outstanding" fill="#fca5a5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 2. Customer Payment Speed Trend — Line Chart
export function PaymentSpeedChart({ data }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
          Avg Payment Speed
        </h3>
        <p className="text-gray-400 text-xs">ادائیگی کی رفتار — Days to repay over time</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}d`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e7e5e4',
              fontSize: '0.78rem'
            }}
            formatter={v => [`${v} days`, 'Avg repayment']}
          />
          <ReferenceLine
            y={7}
            stroke="#10b981"
            strokeDasharray="4 4"
            label={{ value: 'Good (7d)', fontSize: 10, fill: '#10b981' }}
          />
          <ReferenceLine
            y={30}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: 'Risk (30d)', fontSize: 10, fill: '#ef4444' }}
          />
          <Line
            type="monotone"
            dataKey="avgDays"
            name="Avg Days"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ fill: '#f59e0b', r: 4 }}
            activeDot={{ r: 6, fill: '#052e16' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// 3. Weekly Collection Rate — Area Chart
export function WeeklyCollectionChart({ data }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
          Weekly Collection Rate
        </h3>
        <p className="text-gray-400 text-xs">ہفتہ وار وصولی — % collected on time</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="collectionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#052e16" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#052e16" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e7e5e4',
              fontSize: '0.78rem'
            }}
            formatter={v => [`${v}%`, 'Collection rate']}
          />
          <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#052e16"
            strokeWidth={2.5}
            fill="url(#collectionGrad)"
            dot={{ fill: '#052e16', r: 3 }}
            activeDot={{ r: 5, fill: '#f59e0b' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// 4. Customer Risk Radar — shows overall portfolio health
export function PortfolioRadar({ data }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
          Portfolio Health
        </h3>
        <p className="text-gray-400 text-xs">کاروبار کی صحت — Overall score</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="#f5f5f4" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 10, fill: '#6b7280' }}
          />
          <Radar
            name="Your Shop"
            dataKey="value"
            stroke="#052e16"
            fill="#052e16"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e7e5e4',
              fontSize: '0.78rem'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}