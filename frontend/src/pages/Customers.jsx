import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import AitbaarScoreBadge from '../components/AitbaarScoreBadge'
import ledger from '../assets/ledger.png'
import emergency from '../assets/emergency.png'
import money from '../assets/money.png'
import trustable from '../assets/trust.png'
import danger from '../assets/danger.png'

const AREAS = ['Model Town', 'Gulberg', 'DHA', 'Johar Town', 'Bahria Town', 'Other']

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', area: '' })
  const [adding, setAdding] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadCustomers() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    ))
  }, [search, customers])

  async function loadCustomers() {
    setLoading(true)
    try {
      const res = await api.get('/customers/')
      setCustomers(res.data)
      setFiltered(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleAddCustomer(e) {
    e.preventDefault()
    setAdding(true)
    try {
      await api.post('/customers/', newCustomer)
      setShowModal(false)
      setNewCustomer({ name: '', phone: '', area: '' })
      loadCustomers()
    } catch (err) { console.error(err) }
    finally { setAdding(false) }
  }

  const highCount = customers.filter(c => c.aitbaar_score >= 70).length
  const medCount = customers.filter(c => c.aitbaar_score >= 40 && c.aitbaar_score < 70).length
  const lowCount = customers.filter(c => c.aitbaar_score < 40).length
  const totalDue = customers.reduce((s, c) => s + c.total_due, 0)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <img src={ledger} alt="" className="w-12 h-12 mx-auto mb-3 opacity-40 invert brightness-0" />
        <p className="text-gray-400 text-sm">Loading customers...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">گاہک</p>
          <h1 className="text-3xl md:text-4xl font-bold text-green-950"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            Customers
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-950 hover:bg-green-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          + Add Customer
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: money, label: 'Total Outstanding', urdu: 'کل باقی', value: `₨${(totalDue / 1000).toFixed(1)}k`, color: 'text-green-950' },
          { icon: trustable, label: 'Trusted Customers', urdu: 'قابل اعتبار', value: highCount, color: 'text-emerald-700' },
          { icon: danger, label: 'Cautious', urdu: 'محتاط', value: medCount, color: 'text-orange-600' },
          { icon: emergency, label: 'Risky', urdu: 'خطرناک', value: lowCount, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
            <img src={s.icon} alt="" className="w-9 h-9 opacity-80" />
            <div>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">{s.urdu}</p>
              <p className={`text-xl font-bold ${s.color}`}
                style={{ fontFamily: 'Playfair Display, serif' }}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-green-800 transition-colors"
          />
        </div>
        <p className="text-gray-400 text-sm">
          Showing <span className="font-semibold text-gray-700">{filtered.length}</span> customers
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <img src={ledger} alt="" className="w-7 h-7" />
          <div>
            <h3 className="font-bold text-gray-900"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Credit Ledger
            </h3>
            <p className="text-gray-400 text-xs">کھاتہ — All customer records</p>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              {['Customer', 'Phone', 'Area', 'Amount Due', 'Aitbaar Score', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr
                key={c.id}
                className="border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/customers/${c.id}`)}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-950/10 rounded-lg flex items-center justify-center text-green-950 text-xs font-bold">
                      {c.name[0]}
                    </div>
                    <span className="font-semibold text-sm text-gray-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-400 text-sm">{c.phone}</td>
                <td className="px-5 py-4">
                  {c.area ? (
                    <span className="bg-stone-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
                      {c.area}
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-5 py-4">
                  <span className={`font-bold text-sm ${c.total_due > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₨{c.total_due.toLocaleString()}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <AitbaarScoreBadge score={c.aitbaar_score} />
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="text-green-900 text-xs font-semibold">View →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <img src={ledger} alt="" className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium text-gray-400">No customers found</p>
            <p className="text-sm mt-1">
              {search ? 'Try a different search term' : 'Add your first customer to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-300">
            <img src={ledger} alt="" className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm text-gray-400">No customers found</p>
          </div>
        ) : filtered.map(c => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-stone-200 p-4 cursor-pointer active:bg-stone-50"
            onClick={() => navigate(`/customers/${c.id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-950/10 rounded-xl flex items-center justify-center text-green-950 text-sm font-bold">
                  {c.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                  <p className="text-gray-400 text-xs">{c.phone}</p>
                </div>
              </div>
              <AitbaarScoreBadge score={c.aitbaar_score} />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-stone-100">
              <div>
                <p className="text-gray-400 text-xs">{c.area || 'No area'}</p>
              </div>
              <p className={`font-bold text-sm ${c.total_due > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ₨{c.total_due.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-green-950 p-6 flex items-center gap-3">
              <img src={ledger} alt="" className="w-8 h-8 invert brightness-0" />
              <div>
                <h2 className="text-white font-bold text-lg"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  Add New Customer
                </h2>
                <p className="text-white/50 text-xs">نیا گاہک شامل کریں</p>
              </div>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              {[
                { label: 'Full Name', key: 'name', placeholder: 'e.g. Imran Butt', type: 'text' },
                { label: 'Phone Number', key: 'phone', placeholder: 'e.g. 0300-1234567', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-600 block mb-2 uppercase tracking-wide">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={newCustomer[f.key]}
                    onChange={e => setNewCustomer({ ...newCustomer, [f.key]: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-800 transition-colors"
                    required
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2 uppercase tracking-wide">
                  Area
                </label>
                <select
                  value={newCustomer.area}
                  onChange={e => setNewCustomer({ ...newCustomer, area: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-800 bg-white transition-colors"
                  required
                >
                  <option value="">Select area...</option>
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-stone-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 bg-green-950 hover:bg-green-900 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  {adding ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}