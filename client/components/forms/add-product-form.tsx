"use client"

import type React from "react"
import { useState } from "react"
import { addProduct, getCurrentUser } from "@/lib/local-db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

type Props = { onAdded?: () => void }

export default function AddProductForm({ onAdded }: Props) {
  const user = getCurrentUser()
  const [name, setName] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [quantity, setQuantity] = useState<number | "">("")
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  function reset() {
    setName("")
    setPrice("")
    setQuantity("")
    setImageDataUrl(undefined)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || user.role !== "Farmer") return
    if (!name || !price || !quantity) return
    addProduct({ name: name.trim(), price: Number(price), quantity: Number(quantity), imageDataUrl, ownerId: user.id })
    reset()
    onAdded?.()
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fresh Tomatoes" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="2.50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="100"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Upload Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={onFileChange} />
            {imageDataUrl ? (
              <img
                src={imageDataUrl || "/placeholder.svg"}
                alt="Preview"
                className="mt-2 h-32 w-32 rounded border object-cover"
              />
            ) : (
              <img
                src="/produce-image-preview.png"
                alt="Preview placeholder"
                className="mt-2 h-32 w-32 rounded border object-cover"
              />
            )}
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Product
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
