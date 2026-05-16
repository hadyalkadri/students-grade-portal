'use client'
export const dynamic = 'force-dynamic';
import { useState } from 'react'
import { checkStudentGrade } from './actions'

type StudentData = {
  name: string
  Quiz1: string
  Quiz2: string
  Assignment: string
}

export default function GradePortal() {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [studentData, setStudentData] = useState<StudentData | null>(null)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setStudentData(null)
    setLoading(true)

    try {
      const response = await checkStudentGrade(email, pin)

      // Avoid falsy checks so grades like 0 don't get treated as errors.
      if (response.success && response.name && response.Quiz1 !== null && response.Quiz2 !== null && response.Assignment !== null) {
        setStudentData({ name: response.name, Quiz1: String(response.Quiz1), Quiz2: String(response.Quiz2), Assignment: String(response.Assignment) })
        console.log(response)
      } else {
        setErrorMessage(response.message || 'An identification error occurred.')
      }
    } catch {
      setErrorMessage('Network connection timeout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Academic Grade Portal</h1>
          <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">Secure Student Grade Portal</p>
        </header>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Registered Email</label>
            <input 
              type="email"
              required
              disabled={loading}
              placeholder="name@university.com"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 font-medium focus:outline-none focus:border-blue-600 transition disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">4-Digit Verification PIN</label>
            <input 
              type="password"
              required
              disabled={loading}
              maxLength={4}
              pattern="[0-9]{4}"
              placeholder="••••"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 font-mono text-center text-2xl tracking-widest focus:outline-none focus:border-blue-600 transition disabled:opacity-50"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 font-semibold text-white rounded-xl tracking-wide transition shadow-lg shadow-blue-600/10 disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? 'Authenticating Credentials...' : 'View Grade'}
          </button>
        </form>

        {errorMessage && (
          <div className="mt-6 p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-center">
            <p className="text-sm text-red-400 font-medium">{errorMessage}</p>
          </div>
        )}

        {studentData && (
          <div className="mt-6 p-6 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-center animate-in fade-in zoom-in-95 duration-200">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Identity Confirmed</p>
            <p className="text-lg font-bold text-slate-200 mt-1">{studentData.name}</p>
            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Lab & Practical Grades</span>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Quiz 1</span>
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400 block mt-2 tracking-tight">
                    {studentData.Quiz1 === "N/A" ? 'N/A' : `${studentData.Quiz1}/5`}
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Quiz 2</span>
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400 block mt-2 tracking-tight">
                    {studentData.Quiz2 === "N/A" ? 'N/A' : `${studentData.Quiz2}/5`}
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assignment</span>
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400 block mt-2 tracking-tight">
                    {studentData.Assignment}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
