import { useState } from "react"
import { supabase } from "../lib/supabase"

function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError("Invalid email or password.")
    } else {
      window.location.href = "/BracketStressAnalyzer.html"
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(245,158,11,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.05) 1px, transparent 1px)",
        backgroundSize: "48px 48px", pointerEvents: "none",
      }} />

      {/* Header */}
      <header style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 36px",
        borderBottom: "1px solid #e5e7eb",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38,
            background: "linear-gradient(135deg, #f59e0b, #b45309)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>⚙</div>
          <div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800,
              background: "linear-gradient(90deg, #f59e0b, #b45309)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>BracketSAE</div>
            <div style={{
              fontSize: 10, color: "#6b7280",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2,
            }}>STRESS ANALYSIS ENGINE</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
            color: "#f59e0b", padding: "4px 12px", borderRadius: 20,
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
          }}>MICRO PROJECT 12</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6b7280" }}>v2.1.0</span>
        </div>
      </header>

      {/* Center login card */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 5, padding: 24,
      }}>
        <div style={{
          width: "100%", maxWidth: 420,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: "40px 36px",
        }}>

          {/* Card header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: "#6b7280", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8,
            }}>DEPARTMENT OF MECHANICAL ENGINEERING</div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800,
              background: "linear-gradient(90deg, #000 30%, #f59e0b 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              lineHeight: 1.2, marginBottom: 8,
            }}>Authorised<br />Access Only</div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
              Enter your credentials to access the Bracket Stress Analysis Engine.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                color: "#6b7280", letterSpacing: 1, marginBottom: 6,
              }}>EMAIL ADDRESS</div>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "1px solid #e5e7eb", borderRadius: 8,
                  fontSize: 13, fontFamily: "'Inter', sans-serif",
                  outline: "none", boxSizing: "border-box",
                  background: "#fff", color: "#262626",
                }}
                onFocus={e => e.target.style.borderColor = "#f59e0b"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                color: "#6b7280", letterSpacing: 1, marginBottom: 6,
              }}>PASSWORD</div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "1px solid #e5e7eb", borderRadius: 8,
                  fontSize: 13, fontFamily: "'Inter', sans-serif",
                  outline: "none", boxSizing: "border-box",
                  background: "#fff", color: "#262626",
                }}
                onFocus={e => e.target.style.borderColor = "#f59e0b"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: 16, padding: "10px 14px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8, fontSize: 13, color: "#ef4444",
                fontFamily: "'JetBrains Mono', monospace",
              }}>❌ {error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: 16,
                background: "linear-gradient(135deg, #f59e0b, #b45309)",
                border: "none", borderRadius: 10,
                color: "#fff", fontSize: 15, fontWeight: 600,
                fontFamily: "'Syne', sans-serif", letterSpacing: 0.5,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "AUTHENTICATING..." : "▶ ACCESS ENGINE"}
            </button>
          </form>

          {/* Footer tags */}
          
        </div>
      </div>
    </div>
  )
}

export default Signup