"use client"

import { useEffect, useRef } from "react"
import { X, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function Cart() {
  const { items, removeFromCart, getTotal, isCartOpen, setIsCartOpen, customerName } = useCart()
  const cartRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node) && isCartOpen) {
        setIsCartOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isCartOpen, setIsCartOpen])

  const handleCheckout = () => {
    if (items.length === 0) {
      return
    }

    if (!customerName.trim()) {
      alert("Por favor, ingrese el nombre del cliente antes de finalizar el pedido.")
      return
    }

    setIsCartOpen(false)
    router.push("/resumen")
  }

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 fade-in">
      <div
        ref={cartRef}
        className={`fixed top-0 right-0 w-full max-w-md h-screen bg-background shadow-lg slide-down overflow-auto`}
      >
        <div className="p-4 border-b sticky top-0 bg-background z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-xl font-bold">Carrito</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        <div className="p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">El carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                      <img
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.product.id)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
              </div>

              <Button className="w-full mt-4" size="lg" onClick={handleCheckout}>
                Finalizar pedido
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

