import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderById } from '../lib/orders'
import CancelOrderButton from './CancelOrderButton'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrderById(orderId).then((data) => {
      setOrder(data)
      setLoading(false)
    })
  }, [orderId])

  // Update the status on screen after cancelling (keeps the items list)
  const handleCancelled = (updated) => {
    setOrder((prev) => ({ ...prev, ...updated }))
  }

  if (loading) return <p>Loading order...</p>
  if (!order) return <p>Order not found.</p>

  const isCancelled = order.status === 'cancelled'

  return (
    <div className="order-confirmation">
      <h2>{isCancelled ? 'Order Cancelled' : 'Order Confirmed ✅'}</h2>
      <p>Order ID: {order.id}</p>
      <p>Status: {order.status}</p>
      <p>Total: ₹{order.total}</p>

      <h3>Shipping To:</h3>
      <p>{order.full_name}</p>
      <p>{order.address_line}, {order.city}, {order.state} - {order.pincode}</p>
      <p>Phone: {order.phone}</p>

      <h3>Items:</h3>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            {item.product_name} × {item.quantity} — ₹{item.price * item.quantity}
          </li>
        ))}
      </ul>

      <CancelOrderButton order={order} onCancelled={handleCancelled} />
    </div>
  )
}
