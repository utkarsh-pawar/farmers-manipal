export type Role = "Farmer" | "Buyer" | "Admin"

export type User = {
  id: string
  email: string
  name: string
  role: Role
  blocked: boolean
}

export type Product = {
  id: string
  name: string
  price: number
  quantity: number
  imageDataUrl?: string
  ownerId: string
}

export type CartItem = {
  productId: string
  quantity: number
}

const KEYS = {
  users: "db:users",
  products: "db:products",
  currentUser: "auth:currentUser",
}

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function setLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

// seed minimal demo data once
function ensureSeed() {
  const users = getLocal<User[]>(KEYS.users, [])
  const products = getLocal<Product[]>(KEYS.products, [])
  if (users.length === 0) {
    const farmer: User = {
      id: uid("user"),
      email: "farmer@example.com",
      name: "Demo Farmer",
      role: "Farmer",
      blocked: false,
    }
    const buyer: User = {
      id: uid("user"),
      email: "buyer@example.com",
      name: "Demo Buyer",
      role: "Buyer",
      blocked: false,
    }
    const admin: User = { id: uid("user"), email: "admin@example.com", name: "Admin", role: "Admin", blocked: false }
    setLocal(KEYS.users, [farmer, buyer, admin])
    const demoProducts: Product[] = [
      { id: uid("prod"), name: "Fresh Tomatoes", price: 2.5, quantity: 100, ownerId: farmer.id },
      { id: uid("prod"), name: "Organic Potatoes", price: 1.8, quantity: 200, ownerId: farmer.id },
    ]
    setLocal(KEYS.products, demoProducts)
  } else if (products.length === 0) {
    setLocal(KEYS.products, [])
  }
}

export function getCurrentUser(): User | null {
  ensureSeed()
  return getLocal<User | null>(KEYS.currentUser, null)
}

export function setCurrentUser(user: User | null) {
  setLocal(KEYS.currentUser, user)
}

export function getUsers(): User[] {
  ensureSeed()
  return getLocal<User[]>(KEYS.users, [])
}

export function setUsers(users: User[]) {
  setLocal(KEYS.users, users)
}

export function upsertUser(u: Omit<User, "id" | "blocked"> & Partial<Pick<User, "id" | "blocked">>): User {
  const users = getUsers()
  if (u.id) {
    const idx = users.findIndex((x) => x.id === u.id)
    if (idx >= 0) {
      const updated: User = { ...users[idx], ...u, blocked: users[idx].blocked ?? false }
      users[idx] = updated
      setUsers(users)
      return updated
    }
  }
  const created: User = {
    id: uid("user"),
    email: u.email,
    name: u.name,
    role: u.role,
    blocked: u.blocked ?? false,
  }
  users.push(created)
  setUsers(users)
  return created
}

export function setUserBlocked(userId: string, blocked: boolean) {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx >= 0) {
    users[idx].blocked = blocked
    setUsers(users)
    const current = getCurrentUser()
    if (current?.id === userId && blocked) setCurrentUser(null)
  }
}

export function getProducts(): Product[] {
  ensureSeed()
  return getLocal<Product[]>(KEYS.products, [])
}

export function setProducts(products: Product[]) {
  setLocal(KEYS.products, products)
}

export function addProduct(input: Omit<Product, "id">) {
  const products = getProducts()
  const created: Product = { ...input, id: uid("prod") }
  products.push(created)
  setProducts(products)
  return created
}

function cartKey(userId: string) {
  return `cart:${userId}`
}

export function getCart(userId: string): CartItem[] {
  return getLocal<CartItem[]>(cartKey(userId), [])
}

export function setCart(userId: string, items: CartItem[]) {
  setLocal<CartItem[]>(cartKey(userId), items)
}

export function addToCart(userId: string, productId: string, qty = 1) {
  const items = getCart(userId)
  const idx = items.findIndex((i) => i.productId === productId)
  if (idx >= 0) items[idx].quantity += qty
  else items.push({ productId, quantity: qty })
  setCart(userId, items)
}

export function updateCartItem(userId: string, productId: string, qty: number) {
  let items = getCart(userId)
  items = items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)).filter((i) => i.quantity > 0)
  setCart(userId, items)
}

export function clearCart(userId: string) {
  setCart(userId, [])
}
