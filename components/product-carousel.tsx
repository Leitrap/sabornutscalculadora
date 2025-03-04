"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { products } from "@/data/products"

export function ProductCarousel({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [quantity, setQuantity] = useState("1")
  const { addToCart } = useCart()

  const currentProduct = products[currentIndex]

  const handleQuantityChange = (value: string) => {
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setQuantity(value)
    }
  }

  const handleQuickSelect = (num: number) => {
    setQuantity(num.toString())
  }

  const handleAddToCart = () => {
    const parsedQuantity = Number.parseInt(quantity) || 1
    addToCart(currentProduct, parsedQuantity)
    setQuantity("1") // Reset quantity

    // Move to next product after adding to cart
    handleNext()
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length)
    setQuantity("1") // Reset quantity when changing products
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length)
    setQuantity("1") // Reset quantity when changing products
  }

  const quickSelectButtons = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md scale-in max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Carrusel de Productos</DialogTitle>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} de {products.length}
            </span>
          </div>
        </DialogHeader>

        <div className="mb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar producto..."
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase()
                if (searchTerm) {
                  const foundIndex = products.findIndex((p) => p.name.toLowerCase().includes(searchTerm))
                  if (foundIndex !== -1) {
                    setCurrentIndex(foundIndex)
                    setQuantity("1")
                  }
                }
              }}
              className="pr-8"
            />
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {currentProduct && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">{currentProduct.name}</h3>
              <p className="text-muted-foreground">{formatCurrency(currentProduct.price)}</p>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="text-center text-lg"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {quickSelectButtons.map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  onClick={() => handleQuickSelect(num)}
                  className={quantity === num.toString() ? "bg-primary text-primary-foreground" : ""}
                >
                  {num}
                </Button>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={handlePrevious} className="flex-1">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Button>
                <Button variant="outline" onClick={handleNext} className="flex-1">
                  Siguiente
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between gap-2">
                <Button onClick={handleAddToCart} className="flex-1">
                  Agregar al carrito
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleAddToCart()
                    onClose()
                  }}
                  className="flex-1"
                >
                  Agregar y cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

