import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"
import Signup from "./pages/Signup"

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🚨 STOP React completely if on HTML page
    if (window.location.pathname.includes("BracketStressAnalzser.html")) {
      return
    }

    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)

      if (data.session) {
        window.location.href = "/BracketStressAnalzser.html"
      }
    }

    getSession()
  }, [])

  // 🚨 ALSO stop rendering React UI on HTML page
  if (window.location.pathname.includes("BracketStressAnalzser.html")) {
    return null
  }

  if (loading) return <h2>Loading...</h2>

  return session ? <h2>Redirecting...</h2> : <Signup />
}

export default App