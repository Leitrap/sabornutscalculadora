import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/components/cart-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { VendorProvider } from "@/components/vendor-provider"
// src/config.js
const API_URL = "https://sabornutscalculadora-production.up.railway.app"; // Reemplázalo con tu URL real
export default API_URL;

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sabornuts - Toma de Pedidos",
  description: "Aplicación para la toma de pedidos de Sabornuts",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.cdnfonts.com/css/recoleta" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <VendorProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </VendorProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
