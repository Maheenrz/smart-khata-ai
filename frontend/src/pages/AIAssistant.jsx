import { useState, useEffect } from 'react'
import api from '../api/axiosClient'
import robot from '../assets/robot.png'
import cashflow from '../assets/cash-flow.png'
import emergency from '../assets/emergency.png'
import money from '../assets/money.png'
import ledger from '../assets/ledger.png'

export default function AIAssistant() {
  const [customers, setCustomers] = useState([])
  const [cf, setCf] = useState(null)
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('cashflow')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [language, setLanguage] = useState('roman_urdu')
  const [message, setMessage] = useState('')
  const [msgLoading, setMsgLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [c, f, comm] = await Promise.all([
        api.get('/customers/'),
        api.get('/ai/cashflow'),
        api.get('/community/risk')
      ])
      setCustomers(c.data)
      setCf(f.data)
      setCommunity(comm.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function generateMessage() {
    if (!selectedCustomer) return
    setMsgLoading(true)
    setMessage('')
    try {
      const res = await api.post('/ai/message', {
        customer_id: parseInt(selectedCustomer),
        language
      })
      setMessage(res.data.message)
    } catch (err) { console.error(err) }
    finally { setMsgLoading(false) }
  }

  function copyMessage() {
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedCust = customers.find(c => c.id === parseInt(selectedCustomer))
  const whatsappLink = selectedCust
    ? `https://wa.me/92${selectedCust.phone.replace(/^0/, '')}?text=${encodeURIComponent(message)}`
    : '#'

  const tabs = [
    { id: 'cashflow', label: 'Cash Flow', urdu: 'نقد بہاؤ', icon: cashflow },
    { id: 'message', label: 'Message Generator', urdu: 'پیغام', icon: robot },
    { id: 'community', label: 'Community Risk', urdu: 'اجتماعی خطرہ', icon: emergency },
  ]

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <img src={robot} alt="" className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-gray-400 text-sm">Loading AI Assistant...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-green-950 rounded-2xl flex items-center justify-center">
          <img src={robot} alt="" className="w-8 h-8 invert brightness-0" />
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest">ذہین معاون</p>
          <h1 className="text-3xl font-bold text-green-950"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            AI Assistant
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? 'bg-green-950 text-white border-green-950'
                : 'bg-white text-gray-500 border-stone-200 hover:border-green-900 hover:text-green-900'
            }`}
          >
            <img src={tab.icon} alt="" className={`w-4 h-4 ${activeTab === tab.id ? 'brightness-0 invert' : ''}`} />
            {tab.label}
            <span className={`text-[10px] ${activeTab === tab.id ? 'text-white/50' : 'text-gray-400'}`}>
              {tab.urdu}
            </span>
          </button>
        ))}
      </div>

      {/* Tab: Cash Flow */}
      {activeTab === 'cashflow' && cf && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: money, label: 'Total Outstanding', urdu: 'کل باقی', value: `₨${cf.total_outstanding?.toLocaleString()}`, color: 'text-green-950' },
              { icon: emergency, label: 'At Risk Amount', urdu: 'خطرے میں', value: `₨${cf.at_risk_amount?.toLocaleString()}`, color: 'text-red-600' },
              { icon: ledger, label: 'Flagged Customers', urdu: 'نشاندہی', value: cf.customers_at_risk?.length, color: 'text-orange-500' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-4">
                <img src={s.icon} alt="" className="w-10 h-10 opacity-80" />
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">{s.urdu}</p>
                  <p className={`text-2xl font-bold ${s.color}`}
                    style={{ fontFamily: 'Playfair Display, serif' }}>
                    {s.value}
                  </p>
                  <p className="text-gray-400 text-xs">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {cf.shortage_warning && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex gap-4">
              <img src={emergency} alt="" className="w-10 h-10 flex-shrink-0" />
              <div>
                <p className="font-bold text-orange-900 mb-1">⚠ Cash Shortage Warning</p>
                <p className="text-orange-700 text-sm">
                  More than 30% of outstanding is with high-risk customers. Prioritize collections this week.
                </p>
              </div>
            </div>
          )}

          <div className="bg-green-950 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <img src={robot} alt="" className="w-8 h-8 invert brightness-0" />
              <span className="bg-amber-500 text-green-950 text-[9px] font-bold px-2 py-1 rounded-full tracking-widest">
                AI ANALYSIS
              </span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed italic">
              {cf.ai_insight || 'Add your GitHub token in .env to enable AI insights.'}
            </p>
          </div>

          {cf.upcoming_collections?.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex items-center gap-3">
                <img src={cashflow} alt="" className="w-7 h-7" />
                <div>
                  <h3 className="font-bold text-gray-900"
                    style={{ fontFamily: 'Playfair Display, serif' }}>
                    Upcoming Collections
                  </h3>
                  <p className="text-gray-400 text-xs">آنے والی وصولی</p>
                </div>
              </div>
              <div className="divide-y divide-stone-50">
                {cf.upcoming_collections.map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-950/10 rounded-lg flex items-center justify-center text-green-950 text-xs font-bold">
                        {c.customer_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{c.customer_name}</p>
                        <p className="text-gray-400 text-xs">
                          {c.expected_in_days === 0
                            ? `Overdue — was due ${c.expected_date}`
                            : `Expected in ${c.expected_in_days} days · ${c.expected_date}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-red-600 font-bold text-sm">₨ {c.amount_due?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Message Generator */}
      {activeTab === 'message' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="bg-green-950 p-5 flex items-center gap-3">
              <img src={robot} alt="" className="w-8 h-8 invert brightness-0" />
              <div>
                <h3 className="text-white font-bold"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  WhatsApp Reminder
                </h3>
                <p className="text-white/50 text-xs">واٹس ایپ یاددہانی</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2 uppercase tracking-wide">
                  Select Customer
                </label>
                <select
                  value={selectedCustomer}
                  onChange={e => { setSelectedCustomer(e.target.value); setMessage('') }}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-800 bg-white"
                >
                  <option value="">Choose a customer with dues...</option>
                  {customers
                    .filter(c => c.total_due > 0)
                    .sort((a, b) => b.total_due - a.total_due)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — ₨{c.total_due.toLocaleString()} due
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2 uppercase tracking-wide">
                  Language
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'roman_urdu', label: 'Roman Urdu' },
                    { value: 'english', label: 'English' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setLanguage(opt.value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        language === opt.value
                          ? 'bg-green-950 text-white border-green-950'
                          : 'bg-white text-gray-600 border-stone-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateMessage}
                disabled={!selectedCustomer || msgLoading}
                className="w-full bg-green-950 hover:bg-green-900 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                {msgLoading ? 'Generating...' : 'Generate Message →'}
              </button>
            </div>
          </div>

          {/* Message Output */}
          <div className={`rounded-2xl overflow-hidden border transition-all ${message ? 'border-green-900 bg-green-950' : 'border-stone-200 bg-white'}`}>
            {message ? (
              <div className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <img src={robot} alt="" className="w-6 h-6" />
                    <span className="bg-amber-500 text-green-950 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest">
                      GENERATED
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">{message}</p>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={copyMessage}
                    className="flex-1 bg-white/15 hover:bg-white/25 text-white py-3 rounded-xl text-sm font-medium transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl text-sm font-semibold transition-colors text-center"
                  >
                    WhatsApp →
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-300">
                <img src={robot} alt="" className="w-16 h-16 mb-3 opacity-20" />
                <p className="text-sm text-gray-400 font-medium">Message will appear here</p>
                <p className="text-xs text-gray-300 mt-1">Select a customer and generate</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Community Risk */}
      {activeTab === 'community' && community && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-4">
              <img src={ledger} alt="" className="w-10 h-10 opacity-80" />
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Your Areas</p>
                <p className="text-lg font-bold text-green-950"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  {community.your_areas?.join(', ') || '—'}
                </p>
              </div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-4">
              <img src={emergency} alt="" className="w-10 h-10 opacity-80" />
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Flagged Customers</p>
                <p className="text-lg font-bold text-red-600"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  {community.total_flagged} flagged in your area
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
            <img src={emergency} alt="" className="w-8 h-8 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 mb-1 text-sm">
                🔒 Community Intelligence — اجتماعی معلومات
              </p>
              <p className="text-amber-700 text-xs leading-relaxed">
                These customers have been flagged by multiple shopkeepers in your area.
                All data is anonymized and shared with consent.
              </p>
            </div>
          </div>

          {community.community_risks?.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
              <img src={ledger} alt="" className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-gray-700">No community risks in your area</p>
              <p className="text-gray-400 text-sm mt-1">آپ کے علاقے میں کوئی مشترکہ خطرہ نہیں</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex items-center gap-3">
                <img src={emergency} alt="" className="w-7 h-7" />
                <div>
                  <h3 className="font-bold text-gray-900"
                    style={{ fontFamily: 'Playfair Display, serif' }}>
                    Flagged in Your Area
                  </h3>
                  <p className="text-gray-400 text-xs">آپ کے علاقے میں نشاندہی شدہ</p>
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100">
                      {['Customer', 'Area', 'Reported By', 'Avg Score', 'Total Due', 'Risk'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {community.community_risks.map((r, i) => (
                      <tr key={i} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-sm">{r.name}</td>
                        <td className="px-5 py-4 text-gray-400 text-sm">{r.area}</td>
                        <td className="px-5 py-4">
                          <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                            {r.reported_by_shops} shops
                          </span>
                        </td>
                        <td className="px-5 py-4 text-red-600 font-bold text-sm">{r.average_aitbaar_score}</td>
                        <td className="px-5 py-4 text-red-600 font-bold text-sm">₨ {r.total_due_across_shops?.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            r.risk_level === 'High' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {r.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-stone-100">
                {community.community_risks.map((r, i) => (
                  <div key={i} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{r.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{r.area}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        r.risk_level === 'High' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {r.risk_level}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
                      {[
                        { label: 'Reported', value: `${r.reported_by_shops} shops` },
                        { label: 'Avg Score', value: r.average_aitbaar_score, red: true },
                        { label: 'Total Due', value: `₨ ${r.total_due_across_shops?.toLocaleString()}`, red: true },
                      ].map(d => (
                        <div key={d.label} className="text-center">
                          <p className="text-gray-400 text-[10px] uppercase tracking-wide">{d.label}</p>
                          <p className={`font-bold text-sm ${d.red ? 'text-red-600' : 'text-gray-900'}`}>{d.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}