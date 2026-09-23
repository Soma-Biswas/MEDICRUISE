import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "./lib/supabaseClient";
export default function AuthPage({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      onAuthed()
      navigate("/")
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      onAuthed()
      navigate("/")
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-serif text-center mb-2">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="text-sm text-[#24261F]/60 text-center mb-8">
        {mode === "login" ? "Sign in to manage your orders." : "Sign up to start shopping with MEDICRUISE."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="mb-2 block text-sm">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-[#24261F]/15 bg-transparent px-4 py-3 outline-none focus:border-[#4B5D3A] rounded-md"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-[#24261F]/15 bg-transparent px-4 py-3 outline-none focus:border-[#4B5D3A] rounded-md"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-[#24261F]/15 bg-transparent px-4 py-3 outline-none focus:border-[#4B5D3A] rounded-md"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#24261F] text-white text-sm py-3 rounded-md hover:bg-[#4B5D3A] transition-colors disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <p className="text-sm text-center text-[#24261F]/60 mt-6">
        {mode === "login" ? "New to MEDICRUISE?" : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login")
            setError("")
          }}
          className="text-[#4B5D3A] underline"
        >
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>

      <Link to="/" className="block text-center text-xs text-[#24261F]/50 mt-6 hover:text-[#4B5D3A]">
        ← Back to home
      </Link>
    </main>
  )
}
