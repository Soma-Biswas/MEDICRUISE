import { useState } from 'react'
import { cancelOrder } from '../lib/orders'

// Orders in these statuses can still be cancelled
const CANCELLABLE = ['placed', 'pending', 'processing']

export default function CancelOrderButton({ order, onCancelled }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hide the button for shipped, delivered or already cancelled orders
  if (!CANCELLABLE.includes(String(order.status).toLowerCase())) return null

  const handleCancel = async () => {
    setLoading(true)
    setError('')

    const { order: updated, error } = await cancelOrder(order.id)

    setLoading(false)
    setConfirming(false)

    if (error) {
      setError(error)
      return
    }

    onCancelled(updated)
  }

  if (!confirming) {
    return (
      <div>
        <button type="button" onClick={() => setConfirming(true)}>
          Cancel Order
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <p>Cancel this order? This can't be undone.</p>
      <button type="button" onClick={handleCancel} disabled={loading}>
        {loading ? 'Cancelling...' : 'Yes, cancel order'}
      </button>{' '}
      <button type="button" onClick={() => setConfirming(false)} disabled={loading}>
        Keep order
      </button>
    </div>
  )
}
