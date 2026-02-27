import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axiosClient"
import AitbaarScoreBadge from "../components/AitbaarScoreBadge"

function formatAmount(amount) {
  if (amount >= 100000) return `₨ ${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₨ ${(amount / 1000).toFixed(0)}k`
  return `₨ ${amount.toLocaleString()}`
}

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTxnModal, setShowTxnModal] = useState(false)
  const [newTxn, setNewTxn] = useState({ amount: "", type: "credit" })
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState("")
  const [msgLoading, setMsgLoading] = useState(false)
  const [msgLanguage, setMsgLanguage] = useState("roman_urdu")
  const [markingId, setMarkingId] = useState(null)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => { loadCustomer() }, [id])

  async function loadCustomer() {
    setLoading(true)
    try {
      const res = await api.get(`/customers/${id}`)
      setCustomer(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTransaction(e) {
    e.preventDefault()
    setAdding(true)
    try {
      await api.post("/transactions/", {
        customer_id: parseInt(id),
        amount: parseFloat(newTxn.amount),
        type: newTxn.type,
      })
      setNewTxn({ amount: "", type: "credit" })
      setShowTxnModal(false)
      loadCustomer()
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  async function handleMarkRepaid(txnId) {
    setMarkingId(txnId)
    try {
      await api.patch(`/transactions/repaid/${txnId}`)
      loadCustomer()
    } catch (err) {
      console.error(err)
    } finally {
      setMarkingId(null)
    }
  }

  async function generateMessage() {
    setMsgLoading(true)
    setMessage("")
    try {
      const res = await api.post("/ai/message", {
        customer_id: parseInt(id),
        language: msgLanguage,
      })
      setMessage(res.data.message)
    } catch (err) {
      console.error(err)
    } finally {
      setMsgLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/customers/${id}`)
      navigate("/customers")
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  function copyMessage() {
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalDue =
    customer?.transactions
      ?.filter((t) => !t.is_repaid)
      .reduce((sum, t) => sum + t.amount, 0) || 0

  const whatsappLink = customer
    ? `https://wa.me/92${customer.phone.replace(/^0/, "")}?text=${encodeURIComponent(message)}`
    : "#"

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
      Loading customer details...
    </div>
  )

  if (!customer) return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
      Customer not found.
    </div>
  )

  return (
    <div className="space-y-5">

      {/* Back Button */}
      <button
        onClick={() => navigate("/customers")}
        className="text-sm text-gray-500 hover:text-green-900 transition-colors flex items-center gap-1"
      >
        ← Back to Customers
      </button>

      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Customer Info Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
          <div>
            <h1 className="text-2xl text-green-950 font-bold"
              style={{ fontFamily: "Cormorant Garamond, serif" }}>
              {customer.name}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">{customer.phone}</p>
            {customer.area && (
              <span className="inline-block bg-stone-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium mt-1">
                {customer.area}
              </span>
            )}
          </div>

          <AitbaarScoreBadge score={customer.aitbaar_score} />

          <div className="pt-2 border-t border-stone-100">
            <p className="text-xs text-gray-400 mb-1">کل باقی — Total Due</p>
            <p className={`text-3xl font-bold ${totalDue > 0 ? "text-red-600" : "text-emerald-600"}`}
              style={{ fontFamily: "Cormorant Garamond, serif" }}>
              {formatAmount(totalDue)}
            </p>
          </div>

          <button
            onClick={() => setShowTxnModal(true)}
            className="w-full bg-green-950 hover:bg-green-900 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            + Add Transaction
          </button>

          {/* Delete Button */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full border border-red-200 text-red-500 hover:bg-red-50 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Delete Customer
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
              <p className="text-red-700 text-xs font-medium text-center">
                Delete {customer.name} and all their transactions?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 border border-stone-200 text-gray-600 py-2 rounded-lg text-xs font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI WhatsApp Card */}
        <div className="md:col-span-2 bg-green-950 rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <span className="bg-amber-500 text-green-950 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest">
              AI ASSISTANT
            </span>
            <h3 className="text-white font-bold mt-2 mb-0.5"
              style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem" }}>
              WhatsApp Reminder Generator
            </h3>
            <p className="text-white/40 text-xs">واٹس ایپ یاددہانی</p>
          </div>

          <div className="flex gap-2">
            {[
              { value: "roman_urdu", label: "Roman Urdu" },
              { value: "english", label: "English" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMsgLanguage(opt.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  msgLanguage === opt.value
                    ? "bg-amber-500 text-green-950"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={generateMessage}
            disabled={msgLoading || totalDue === 0}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-green-950 font-bold py-2.5 rounded-xl text-sm transition-colors"
          >
            {msgLoading ? "Generating..." : "Generate Message"}
          </button>

          {totalDue === 0 && (
            <p className="text-white/40 text-xs">
              No outstanding dues — nothing to remind about.
            </p>
          )}

          {message && (
            <div className="bg-white/10 rounded-xl p-4 space-y-3">
              <p className="text-white text-sm leading-relaxed">{message}</p>
              <div className="flex gap-2">
                <button
                  onClick={copyMessage}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl text-xs font-medium transition-colors"
                >
                  {copied ? "✓ Copied!" : "Copy Message"}
                </button>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2 rounded-xl text-xs font-semibold transition-colors text-center"
                >
                  Open WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900"
              style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.15rem" }}>
              Transaction History
            </h3>
            <p className="text-gray-400 text-xs">لین دین</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-stone-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
              {customer.transactions.length} total
            </span>
            <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium">
              {customer.transactions.filter((t) => !t.is_repaid).length} pending
            </span>
          </div>
        </div>

        {customer.transactions.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm text-gray-400 font-medium">No transactions yet</p>
            <p className="text-xs text-gray-300 mt-1">Add the first credit entry above</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {customer.transactions
              .slice()
              .sort((a, b) => new Date(b.date_given) - new Date(a.date_given))
              .map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between px-5 py-4 transition-colors ${
                    !t.is_repaid ? "hover:bg-stone-50" : "opacity-50 hover:opacity-70"
                  }`}
                >
                  {/* Left */}
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-base ${
                      t.type === "credit"
                        ? "bg-red-50 text-red-500"
                        : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {t.type === "credit" ? "↑" : "↓"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {t.type === "credit" ? "Credit Given" : "Payment Received"}
                        </p>
                        <span className={`text-xs font-medium ${
                          t.type === "credit" ? "text-red-400" : "text-emerald-500"
                        }`}>
                          {t.type === "credit" ? "اُدھار" : "ادائیگی"}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {formatDate(t.date_given)}
                        {t.is_repaid && t.date_repaid && (
                          <span className="ml-2 text-emerald-500">
                            · Paid {formatDate(t.date_repaid)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className={`font-bold text-sm ${
                      t.type === "credit" ? "text-red-600" : "text-emerald-600"
                    }`}>
                      {t.type === "credit" ? "-" : "+"}₨{t.amount.toLocaleString()}
                    </p>

                    {t.is_repaid ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-semibold">
                        ✓ Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkRepaid(t.id)}
                        disabled={markingId === t.id}
                        className="bg-white border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 text-gray-500 text-xs px-3 py-1.5 rounded-full font-medium transition-all disabled:opacity-50"
                      >
                        {markingId === t.id ? "..." : "Mark Paid"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showTxnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-green-950 p-5">
              <h2 className="text-white font-bold text-lg"
                style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Add Transaction
              </h2>
              <p className="text-white/50 text-xs mt-0.5">لین دین شامل کریں</p>
            </div>
            <form onSubmit={handleAddTransaction} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2 uppercase tracking-wide">
                  Amount (₨)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 1500"
                  value={newTxn.amount}
                  onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-800 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2 uppercase tracking-wide">
                  Type
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "credit", label: "Credit — اُدھار" },
                    { value: "payment", label: "Payment — ادائیگی" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNewTxn({ ...newTxn, type: opt.value })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                        newTxn.type === opt.value
                          ? "bg-green-950 text-white border-green-950"
                          : "bg-white text-gray-600 border-stone-200 hover:border-green-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTxnModal(false)}
                  className="flex-1 border border-stone-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 bg-green-950 hover:bg-green-900 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}