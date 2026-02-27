import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import ledger from '../assets/ledger.png'
import money from '../assets/money.png'
import cashflow from '../assets/cash-flow.png'
import robot from '../assets/robot.png'
import emergency from '../assets/emergency.png'


const FEATURES = [
  {
    icon: <img src={money} alt="Money" className="w-7 h-7 invert brightness-0" />,
    title: 'Aitbaar Score',
    desc: 'AI-powered credit scoring for every customer based on real repayment behavior'
  },
  {
    icon: <img src={cashflow} alt="Cash Flow" className="w-7 h-7 invert brightness-0" />,
    title: 'Cash Flow Intelligence',
    desc: 'Know exactly when cash shortages will hit before they happen'
  },
  {
    icon: <img src={emergency} alt="Emergency" className="w-7 h-7 invert brightness-0" />,
    title: 'Community Risk Network',
    desc: 'Shared intelligence across shopkeepers — flag bad payers before giving credit'
  },
  {
    icon: <img src={robot} alt="AI Recovery Agent" className="w-7 h-7 invert brightness-0" />,
    title: 'AI Recovery Agent',
    desc: 'Auto-generates WhatsApp reminders in Roman Urdu for every overdue customer'
  },
]

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // login | register
  const [regForm, setRegForm] = useState({
    name: '', shop_name: '', email: '', password: '', city: 'Lahore'
  })

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', regForm)
      // auto login after register
      const res = await api.post('/auth/login', {
        email: regForm.email,
        password: regForm.password
      })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT — Branding Panel */}
      <div className="bg-green-950 md:w-1/2 flex flex-col justify-between p-8 md:p-12 lg:p-16">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12  rounded-xl flex items-center justify-center text-green-950 font-bold text-lg">
            <img src={ledger} alt="Ledger" className="w-7 h-7 invert brightness-0" />
          </div>
          <div>
            <div className="text-white font-semibold text-lg leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Smart Khata AI
            </div>
            <div className="text-amber-400 text-[10px] tracking-widest">
              CREDIT INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="py-12 md:py-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight mb-5"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            The credit department your shop never had.
          </h1>
          <p className="text-white/50 text-base md:text-lg leading-relaxed">
            Pakistan ke 3.5 million small retailers manage credit in a notebook.
            We give them AI-grade financial intelligence.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map(f => (
            <div key={f.title}
              className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-4">
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="text-white font-semibold text-sm mb-1">{f.title}</div>
              <div className="text-white/40 text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div className="md:w-1/2 bg-stone-50 flex items-center justify-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md">

          {/* Tab Toggle */}
          <div className="flex bg-white border border-stone-200 rounded-xl p-1 mb-8">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-green-950 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-green-950"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  Welcome back
                </h2>
                <p className="text-gray-400 text-sm mt-1">خوش آمدید — Sign in to your khata</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="ahmed@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/10 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/10 transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-950 hover:bg-green-900 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors mt-2"
                >
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-xs font-semibold mb-2 uppercase tracking-wide">
                  Demo Credentials
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setForm({ email: 'ahmed@test.com', password: 'test1234' })}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <span className="text-amber-900 text-xs font-medium">ahmed@test.com</span>
                    <span className="text-amber-600 text-xs ml-2">· Khan General Store — Model Town</span>
                  </button>
                  <p className="text-amber-600 text-xs mt-1 px-1">Password: test1234</p>
                </div>
              </div>
            </div>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-green-950"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  Create your account
                </h2>
                <p className="text-gray-400 text-sm mt-1">اپنا کھاتہ بنائیں — Set up your shop</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {[
                  { label: 'Your Full Name', key: 'name', placeholder: 'Ahmed Khan', type: 'text' },
                  { label: 'Shop Name', key: 'shop_name', placeholder: 'Khan General Store', type: 'text' },
                  { label: 'Email Address', key: 'email', placeholder: 'ahmed@example.com', type: 'email' },
                  { label: 'Password', key: 'password', placeholder: '••••••••', type: 'password' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-semibold text-gray-600 block mb-2 uppercase tracking-wide">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={regForm[field.key]}
                      onChange={e => setRegForm({ ...regForm, [field.key]: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/10 transition-all"
                      required
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2 uppercase tracking-wide">
                    City
                  </label>
                  <select
                    value={regForm.city}
                    onChange={e => setRegForm({ ...regForm, city: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-800 transition-all"
                  >
                    {['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-950 hover:bg-green-900 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors mt-2"
                >
                  {loading ? 'Creating account...' : 'Create Account →'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}