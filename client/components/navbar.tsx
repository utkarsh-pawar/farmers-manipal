"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { getCart, getCurrentUser, setCurrentUser } from "@/lib/local-db"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(getCurrentUser())
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const u = getCurrentUser()
    setUser(u)
    if (u?.role === "Buyer") {
      const items = getCart(u.id)
      setCartCount(items.reduce((sum, i) => sum + i.quantity, 0))
    } else {
      setCartCount(0)
    }
  }, [pathname])

  const links = useMemo(() => {
    if (!user) return []
    if (user.role === "Farmer") return [{ href: "/farmer", label: "Farmer Dashboard" }]
    if (user.role === "Buyer")
      return [
        { href: "/buyer", label: "Browse Products" },
        { href: "/cart", label: `Cart (${cartCount})` },
      ]
    if (user.role === "Admin") return [{ href: "/admin", label: "Admin Panel" }]
    return []
  }, [user, cartCount])

  function onLogout() {
    setCurrentUser(null)
    router.push("/login")
  }

  return (
    <header className="w-full border-b bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href={user ? (user.role === "Buyer" ? "/buyer" : user.role === "Farmer" ? "/farmer" : "/admin") : "/login"}
          className="font-sans text-lg font-semibold text-green-700"
        >
          Farmers Online Trading
        </Link>
        <div className="flex items-center gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-700 hover:text-green-700">
              {l.label}
            </Link>
          ))}
          {user ? (
            <Button
              variant="outline"
              onClick={onLogout}
              className="border-green-600 text-green-700 hover:bg-green-50 bg-transparent"
            >
              Logout
            </Button>
          ) : (
            <Link href="/login" className="text-sm text-gray-700 hover:text-green-700">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
