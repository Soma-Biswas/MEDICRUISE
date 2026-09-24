import { useEffect, useState } from 'react'
import { getMyOrders } from '../lib/orders'
import CancelOrderButton from './CancelOrderButton'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  // Update just the cancelled order in the list (keeps its order_items)
  const handleCancelled = (updated) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
    )
  }

  if (loading) return <p>Loading orders...</p>
  if (orders.length === 0) return <p>No orders yet.</p>

  return (
    <div className="order-history">
      <h2>My Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <p>Order #{order.id.slice(0, 8)} — ₹{order.total}</p>
          <p>Status: {order.status}</p>
          <p>{order.city}, {order.state}</p>
          <ul>
            {order.order_items.map((item) => (
              <li key={item.id}>{item.product_name} × {item.quantity}</li>
            ))}
          </ul>

          <CancelOrderButton order={order} onCancelled={handleCancelled} />
        </div>
      ))}
    </div>
  )
}
