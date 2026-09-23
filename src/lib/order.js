import { supabase } from './supabaseClient'

// Place a new order
export async function placeOrder(cartItems, shippingInfo) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('User not logged in')
    return { order: null, error: 'not_logged_in' }
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Step 1: create the order with shipping info
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id: user.id,
      total: total,
      full_name: shippingInfo.fullName,
      phone: shippingInfo.phone,
      address_line: shippingInfo.addressLine,
      city: shippingInfo.city,
      state: shippingInfo.state,
      pincode: shippingInfo.pincode,
    }])
    .select()
    .single()

  if (orderError) {
    console.error('Order creation failed:', orderError.message)
    return { order: null, error: orderError.message }
  }

  // Step 2: insert line items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Order items failed:', itemsError.message)
    return { order: null, error: itemsError.message }
  }

  return { order, error: null }
}

// Get a single order (with items) by ID — for confirmation page
export async function getOrderById(orderId) {
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderErr) {
    console.error('Order fetch failed:', orderErr.message)
    return null
  }

  const { data: items, error: itemsErr } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (itemsErr) {
    console.error('Order items fetch failed:', itemsErr.message)
    return { ...order, items: [] }
  }

  return { ...order, items }
}

// Get all orders for the logged-in user — for order history page
export async function getMyOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items ( * )`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch orders:', error.message)
    return []
  }

  return data
}

// Cancel an order (only works while it's pending or processing)
export async function cancelOrder(orderId) {
  const { data, error } = await supabase.rpc('cancel_order', {
    p_order_id: orderId,
  })

  if (error) {
    console.error('Cancel failed:', error.message)
    return { order: null, error: error.message }
  }

  return { order: data, error: null }
}
