"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, TrendingUp, ShoppingBag, Users, Calendar, Download } from "lucide-react"
import { useVendor } from "@/components/vendor-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type OrderHistoryItem = {
  id: string
  date: string
  customerName: string
  vendorName: string
  storeLocation: string
  items: {
    productId: number
    productName: string
    price: number
    quantity: number
  }[]
  total: number
  discount: number
  finalTotal: number
}

type ProductStat = {
  id: number
  name: string
  totalSold: number
  totalRevenue: number
}

type VendorStat = {
  name: string
  totalSales: number
  totalRevenue: number
  orderCount: number
}

export default function EstadisticasPage() {
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([])
  const [productStats, setProductStats] = useState<ProductStat[]>([])
  const [vendorStats, setVendorStats] = useState<VendorStat[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [averageTicket, setAverageTicket] = useState(0)
  const [timeFilter, setTimeFilter] = useState("all")
  const router = useRouter()
  const { vendorInfo } = useVendor()

  // Verificar si hay un vendedor logueado
  useEffect(() => {
    if (!vendorInfo) {
      router.push("/")
    }
  }, [vendorInfo, router])

  useEffect(() => {
    // Cargar historial de pedidos desde localStorage
    const savedHistory = localStorage.getItem("sabornuts-order-history")
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory) as OrderHistoryItem[]
        setOrderHistory(history)

        // Filtrar por período de tiempo
        const filteredHistory = filterOrdersByTime(history, timeFilter)

        // Calcular estadísticas
        calculateStats(filteredHistory)
      } catch (e) {
        console.error("Error al cargar el historial de pedidos", e)
      }
    }
  }, [timeFilter])

  const filterOrdersByTime = (orders: OrderHistoryItem[], filter: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    switch (filter) {
      case "today":
        return orders.filter((order) => new Date(order.date) >= today)
      case "yesterday":
        return orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate >= yesterday && orderDate < today
        })
      case "thisWeek":
        return orders.filter((order) => new Date(order.date) >= thisWeekStart)
      case "thisMonth":
        return orders.filter((order) => new Date(order.date) >= thisMonthStart)
      default:
        return orders
    }
  }

  const calculateStats = (history: OrderHistoryItem[]) => {
    // Calcular ingresos totales
    const revenue = history.reduce((sum, order) => sum + (order.finalTotal || order.total), 0)
    setTotalRevenue(revenue)

    // Calcular total de pedidos
    setTotalOrders(history.length)

    // Calcular total de clientes únicos
    const uniqueCustomers = new Set(history.map((order) => order.customerName.toLowerCase().trim()))
    setTotalCustomers(uniqueCustomers.size)

    // Calcular ticket promedio
    setAverageTicket(history.length > 0 ? revenue / history.length : 0)

    // Calcular estadísticas por producto
    const productMap = new Map<number, ProductStat>()

    history.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productMap.get(item.productId)

        if (existing) {
          existing.totalSold += item.quantity
          existing.totalRevenue += item.price * item.quantity
        } else {
          productMap.set(item.productId, {
            id: item.productId,
            name: item.productName,
            totalSold: item.quantity,
            totalRevenue: item.price * item.quantity,
          })
        }
      })
    })

    // Ordenar productos por ingresos (de mayor a menor)
    const sortedProducts = Array.from(productMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)

    setProductStats(sortedProducts)

    // Calcular estadísticas por vendedor
    const vendorMap = new Map<string, VendorStat>()

    history.forEach((order) => {
      const vendorName = order.vendorName || "Desconocido"
      const existing = vendorMap.get(vendorName)

      if (existing) {
        existing.totalSales += order.items.reduce((sum, item) => sum + item.quantity, 0)
        existing.totalRevenue += order.finalTotal || order.total
        existing.orderCount += 1
      } else {
        vendorMap.set(vendorName, {
          name: vendorName,
          totalSales: order.items.reduce((sum, item) => sum + item.quantity, 0),
          totalRevenue: order.finalTotal || order.total,
          orderCount: 1,
        })
      }
    })

    // Ordenar vendedores por ingresos (de mayor a menor)
    const sortedVendors = Array.from(vendorMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)

    setVendorStats(sortedVendors)
  }

  const exportToCSV = () => {
    // Crear CSV para productos
    let csvContent = "data:text/csv;charset=utf-8,"

    // Encabezados
    csvContent += "Producto,Unidades Vendidas,Ingresos,Porcentaje del Total\n"

    // Datos
    productStats.forEach((product) => {
      const percentage = totalRevenue > 0 ? ((product.totalRevenue / totalRevenue) * 100).toFixed(1) : "0"
      csvContent += `"${product.name}",${product.totalSold},${product.totalRevenue},${percentage}%\n`
    })

    // Crear elemento para descargar
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `estadisticas_productos_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!vendorInfo) {
    return null
  }

  return (
    <main className="min-h-screen container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Estadísticas de Ventas</h1>
        <Button variant="outline" onClick={() => router.push("/productos")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el tiempo</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="yesterday">Ayer</SelectItem>
            <SelectItem value="thisWeek">Esta semana</SelectItem>
            <SelectItem value="thisMonth">Este mes</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar a CSV
        </Button>
      </div>

      {orderHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay datos de ventas disponibles</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCustomers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(averageTicket)}</div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold mb-4">Productos Más Vendidos</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Producto</th>
                  <th className="py-2 px-4 text-right">Unidades Vendidas</th>
                  <th className="py-2 px-4 text-right">Ingresos</th>
                  <th className="py-2 px-4 text-right">% del Total</th>
                </tr>
              </thead>
              <tbody>
                {productStats.slice(0, 10).map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="py-4 px-4">{product.name}</td>
                    <td className="py-4 px-4 text-right">{product.totalSold}</td>
                    <td className="py-4 px-4 text-right">{formatCurrency(product.totalRevenue)}</td>
                    <td className="py-4 px-4 text-right">
                      {totalRevenue > 0 ? `${((product.totalRevenue / totalRevenue) * 100).toFixed(1)}%` : "0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold mb-4">Rendimiento por Vendedor</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Vendedor</th>
                  <th className="py-2 px-4 text-right">Pedidos</th>
                  <th className="py-2 px-4 text-right">Unidades Vendidas</th>
                  <th className="py-2 px-4 text-right">Ingresos</th>
                  <th className="py-2 px-4 text-right">% del Total</th>
                </tr>
              </thead>
              <tbody>
                {vendorStats.map((vendor) => (
                  <tr key={vendor.name} className="border-b">
                    <td className="py-4 px-4">{vendor.name}</td>
                    <td className="py-4 px-4 text-right">{vendor.orderCount}</td>
                    <td className="py-4 px-4 text-right">{vendor.totalSales}</td>
                    <td className="py-4 px-4 text-right">{formatCurrency(vendor.totalRevenue)}</td>
                    <td className="py-4 px-4 text-right">
                      {totalRevenue > 0 ? `${((vendor.totalRevenue / totalRevenue) * 100).toFixed(1)}%` : "0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}

