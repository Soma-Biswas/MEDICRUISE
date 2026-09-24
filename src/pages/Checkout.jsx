import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { placeOrder } from '../lib/orders'

export default function Checkout({ cartItems }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { order, error } = await placeOrder(cartItems, form)

    setLoading(false)

    if (error) {
      setError(error === 'not_logged_in' ? 'Please log in to place an order.' : error)
      return
    }

    navigate(`/order-confirmation/${order.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h2>Shipping Details</h2>

      <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
      <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
      <input name="addressLine" placeholder="Address" value={form.addressLine} onChange={handleChange} required />
      <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
      <input name="state" placeholder="State" value={form.state} onChange={handleChange} required />
      <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  )
}