'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Clock,
  CheckCircle, ChefHat, LogOut,
  Receipt, History, CalendarDays, ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('live_orders')
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newOrderId, setNewOrderId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items (*)`)
      .order('created_at', { ascending: false })

    if (error) console.error('❌ Fetch error:', error)
    if (data) setOrders(data)
    setLoading(false)
  }

  // ── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    audioRef.current = new Audio('/ding.mp3')
    fetchOrders()

    const channel = supabase
      .channel('admin-live-orders')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('✅ Naya order aaya!', payload.new)
          setNewOrderId(payload.new.id)
          setTimeout(() => setNewOrderId(null), 4000)
          audioRef.current?.play().catch(() => {})
          fetchOrders()
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe((status) => console.log('Realtime:', status))

    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Status Update ─────────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    if (error) {
      console.error('❌ Update error:', error)
      fetchOrders() // rollback
    }
  }

  const markAsPaid = async (orderId: string) => {
    setUpdatingPayment(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId)
    
    if (!error) {
      fetchOrders()
    } else {
      console.error('❌ Payment update error:', error)
    }
    setUpdatingPayment(null)
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const pendingOrders   = orders.filter((o) => o.status === 'pending')
  const preparingOrders = orders.filter((o) => o.status === 'preparing')
  // ✅ 'delivered' — same as admin marks it
  const deliveredOrders = orders.filter((o) => o.status === 'delivered')
  const activeOrders    = orders.filter((o) => ['pending', 'preparing'].includes(o.status))
  const unpaidOrders    = orders.filter((o) => o.status === 'delivered' && o.payment_status !== 'paid')

  const today      = new Date().toDateString()
  const thisMonth  = new Date().getMonth()
  const thisYear   = new Date().getFullYear()

  const todaysDelivered      = deliveredOrders.filter((o) => new Date(o.created_at).toDateString() === today)
  const todaysRevenue        = todaysDelivered.reduce((s, o) => s + (o.total_amount || 0), 0)
  const thisMonthsDelivered  = deliveredOrders.filter((o) => {
    const d = new Date(o.created_at)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })
  const thisMonthsRevenue    = thisMonthsDelivered.reduce((s, o) => s + (o.total_amount || 0), 0)
  const totalRevenue         = deliveredOrders.reduce((s, o) => s + (o.total_amount || 0), 0)

  const formatDT = (ds: string) =>
    new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }).format(new Date(ds))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col justify-between shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
            <span className="bg-orange-600 p-2 rounded-lg"><ChefHat className="w-5 h-5 text-white" /></span>
            Cafe Cookies
          </h2>
            <div className="space-y-2">
            <SidebarBtn active={activeTab === 'dashboard'}   onClick={() => setActiveTab('dashboard')}   icon={LayoutDashboard} label="Dashboard" />
            <SidebarBtn active={activeTab === 'live_orders'} onClick={() => setActiveTab('live_orders')} icon={Receipt}         label={`Live Kitchen (${activeOrders.length})`} />
            <SidebarBtn active={activeTab === 'payments'}    onClick={() => setActiveTab('payments')}    icon={Receipt}         label={`Payments (${unpaidOrders.length})`} />
            <SidebarBtn active={activeTab === 'history'}     onClick={() => setActiveTab('history')}     icon={History}         label="Order History" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-800">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">

        {/* ── TAB: DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4">Business Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-2xl shadow-lg border border-orange-500/30">
                <p className="text-orange-100/70 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Today's Revenue
                </p>
                <h2 className="text-4xl font-black text-white mb-1">₹{todaysRevenue}</h2>
                <p className="text-orange-200/80 text-sm">{todaysDelivered.length} orders today</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">This Month</p>
                <h2 className="text-3xl font-bold text-white mb-1">₹{thisMonthsRevenue}</h2>
                <p className="text-slate-500 text-sm flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" /> {thisMonthsDelivered.length} orders
                </p>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">All-Time</p>
                <h2 className="text-3xl font-bold text-emerald-400 mb-1">₹{totalRevenue}</h2>
                <p className="text-slate-500 text-sm">Lifetime revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard title="Total Orders" value={orders.length}          sub="All time"     Icon={ShoppingBag} color="text-blue-500" />
              <StatCard title="Pending"      value={pendingOrders.length}   sub="Needs action" Icon={Clock}       color="text-red-500" />
              <StatCard title="Preparing"    value={preparingOrders.length} sub="In Kitchen"   Icon={ChefHat}     color="text-orange-500" />
              <StatCard title="Delivered"    value={deliveredOrders.length} sub="Completed"    Icon={CheckCircle} color="text-emerald-500" />
            </div>
          </div>
        )}

        {/* ── TAB: LIVE KITCHEN ── */}
        {activeTab === 'live_orders' && (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Live Kitchen
                <span className="bg-orange-600/20 text-orange-500 text-sm py-1 px-3 rounded-full border border-orange-500/20">
                  {activeOrders.length} Active
                </span>
              </h1>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-500">Loading orders...</div>
            ) : activeOrders.length === 0 ? (
              <div className="bg-slate-900 p-12 rounded-2xl border border-slate-800 text-center">
                <ChefHat className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-300">Kitchen is clear!</h3>
                <p className="text-slate-500 mt-2">Waiting for new orders...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`bg-slate-900 rounded-2xl border shadow-xl overflow-hidden flex flex-col transition-all duration-500 ${
                      newOrderId === order.id
                        ? 'border-orange-500 ring-2 ring-orange-500/40 scale-[1.02]'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-slate-800 flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-white">Table {order.table_number}</h3>
                        <p className="text-sm text-slate-400 mt-0.5 capitalize">{order.customer_name}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${
                        order.status === 'pending'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="p-5 flex-1">
                      <div className="space-y-3">
                        {order.order_items?.map((item: any, idx: number) => (
                          <div key={idx} className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start text-sm">
                              <span className="flex items-center gap-2 text-slate-200 font-medium">
                                <span className="bg-slate-800 text-orange-400 px-2 py-0.5 rounded text-xs">
                                  {item.quantity}x
                                </span>
                                {item.item_name || 'Item'}
                              </span>
                              {/* ✅ addOns milake price */}
                              <span className="text-slate-400 font-medium text-sm">
                                ₹{(item.item_price * item.quantity)}
                              </span>
                            </div>

                            {/* ✅ Add-ons dikhao */}
                            {item.add_ons && item.add_ons.length > 0 && (
                              <p className="text-[11px] text-slate-500 mt-1 ml-8">
                                Add-ons: {item.add_ons.map((a: any) => `${a.name} (+₹${a.price})`).join(', ')}
                              </p>
                            )}

                            {/* ✅ Item-level instructions */}
                            {item.instructions && (
                              <p className="text-[11px] text-amber-400 mt-1 ml-8 italic">
                                Note: {item.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* ✅ Order-level customer notes */}
                      {order.customer_notes && (
                        <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                          <p className="text-xs text-orange-400 font-semibold uppercase mb-1">Chef Note:</p>
                          <p className="text-sm text-slate-300 italic">"{order.customer_notes}"</p>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Grand Total</span>
                        <span className="text-orange-400 text-xl font-bold">₹{order.total_amount}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-4 border-t border-slate-800">
                      {order.status === 'pending' ? (
                        <Button
                          className="w-full bg-orange-600 hover:bg-orange-700 font-bold h-12"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                        >
                          <ChefHat className="w-5 h-5 mr-2" /> Accept & Prepare
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-12"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                        >
                          <CheckCircle className="w-5 h-5 mr-2" /> Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: PAYMENTS ── */}
        {activeTab === 'payments' && (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4 flex items-center gap-3">
              Pending Payments
              <span className="bg-red-600/20 text-red-500 text-sm py-1 px-3 rounded-full border border-red-500/20">
                {unpaidOrders.length} Unpaid
              </span>
            </h1>

            {unpaidOrders.length === 0 ? (
              <div className="bg-slate-900 p-12 rounded-2xl border border-slate-800 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-300">All caught up!</h3>
                <p className="text-slate-500 mt-2">No pending payments to collect.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unpaidOrders.map((order) => (
                  <div key={order.id} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-800 flex justify-between items-start bg-slate-950/50">
                      <div>
                        <h3 className="text-2xl font-bold text-white">Table {order.table_number}</h3>
                        <p className="text-sm text-slate-400 mt-0.5 capitalize">{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 text-xl font-bold">₹{order.total_amount}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Amount Due</p>
                      </div>
                    </div>

                    <div className="p-5 flex-1">
                      <div className="space-y-2 mb-4">
                        {order.order_items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-slate-400">{item.quantity}x {item.item_name}</span>
                            <span className="text-slate-500">₹{item.item_price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-600 flex justify-between">
                        <span>Ordered at: {new Date(order.created_at).toLocaleTimeString()}</span>
                        <span>ID: #{order.id.slice(0, 6)}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-12 shadow-lg shadow-emerald-600/10"
                        onClick={() => markAsPaid(order.id)}
                        disabled={updatingPayment === order.id}
                      >
                        {updatingPayment === order.id ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Receipt className="w-5 h-5" /> Mark as Paid
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: HISTORY ── */}
        {activeTab === 'history' && (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4 flex items-center gap-3">
              Order History
              <span className="text-sm font-normal text-slate-500">({deliveredOrders.length} records)</span>
            </h1>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Order ID / Date</th>
                      <th className="px-6 py-4">Customer & Table</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No delivered orders yet.
                        </td>
                      </tr>
                    ) : (
                      deliveredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-slate-300 font-mono text-xs mb-1">#{order.id.slice(0, 8)}</p>
                            <p className="text-[11px] text-slate-500">{formatDT(order.created_at)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-white font-medium capitalize">{order.customer_name}</p>
                            <p className="text-xs text-slate-500">Table {order.table_number}</p>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <p className="truncate text-slate-300">
                              {order.order_items?.map((i: any) => `${i.quantity}x ${i.item_name}`).join(', ')}
                            </p>
                            {/* ✅ Add-ons in history */}
                            {order.order_items?.some((i: any) => i.add_ons?.length > 0) && (
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                {order.order_items
                                  .filter((i: any) => i.add_ons?.length > 0)
                                  .map((i: any) => i.add_ons.map((a: any) => a.name).join(', '))
                                  .join(' · ')}
                              </p>
                            )}
                            {/* ✅ Instructions in history */}
                            {order.order_items?.some((i: any) => i.instructions) && (
                              <p className="text-[11px] text-amber-500/70 mt-0.5 italic truncate">
                                Note: {order.order_items.filter((i: any) => i.instructions).map((i: any) => i.instructions).join(' | ')}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-400">₹{order.total_amount}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                              Delivered
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

function SidebarBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
      active ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  )
}

function StatCard({ title, value, sub, Icon, color }: any) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={`p-3 bg-slate-950 rounded-xl ${color} border border-slate-800`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  )
}