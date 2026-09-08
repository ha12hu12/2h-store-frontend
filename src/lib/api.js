const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ERROR_TRANSLATIONS = [
  [/there is no products? in the database/i, 'ما فيه منتجات حاليًا'],
  [/you have no products\.?/i, 'ما عندك منتجات بعد'],
  [/there is no product with name/i, 'ما لقينا منتج بهذا الاسم'],
  [/no product found with id/i, 'ما لقينا هذا المنتج'],
  [/there is no product with id/i, 'ما لقينا هذا المنتج'],
  [/you don.?t have permission to edit this product/i, 'ما تقدر تعدل هذا المنتج لأنه مو لك'],
  [/you cant delete this product bc its not yours/i, 'ما تقدر تحذف هذا المنتج لأنه مو لك'],
  [/already added .* to the cart/i, 'أنت مشتري هذا المنتج بالفعل'],
  [/the product is out! ?- ?sry/i, 'نفدت كمية هذا المنتج'],
  [/you dont have enough cash to buy/i, 'رصيدك ما يكفي لشراء هذا المنتج'],
  [/you have no debts/i, 'ما فيه ديون عليك حاليًا'],
  [/is not allowed to alter paid/i, 'ما تقدر تعلّم هذا الدفع لأنك مو صاحب المنتج'],
  [/cant change/i, 'ما تقدر تعدل هذا العنصر لأنه مو لك'],
  [/could not validate credentials/i, 'تعذّر التحقق من هويتك، سجل دخولك من جديد'],
  [/^not found$/i, 'ما لقينا الشيء المطلوب'],
  [/incorrect (username|password)/i, 'اسم المستخدم أو كلمة المرور غير صحيحة'],
  // v2 — pledge errors
  [/user .* is not in the pledge/i, 'أنت مو من ضمن المشاركين في هذه القطة'],
  [/already pledged/i, 'اشتركت بهذه القطة من قبل'],
  [/pledge amount exceeds/i, 'مبلغ القطة تجاوز السعر الكامل'],
  [/not a pledge product/i, 'هذا المنتج مو قطة'],
]

function translateDetail(detail) {
  const match = ERROR_TRANSLATIONS.find(([pattern]) => pattern.test(detail))
  return match ? match[1] : detail
}

async function request(path, { method = 'GET', body, token, isForm = false } = {}) {
  const headers = {}
  if (!isForm) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const detail = data?.detail
    const message = Array.isArray(detail)
      ? 'تأكد إن كل الحقول معبأة بشكل صحيح'
      : detail
      ? translateDetail(detail)
      : 'حدث خطأ غير متوقع'
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  return data
}

export const api = {
  // ---- auth ----
  login: (username, password) =>
    request('/login', { method: 'POST', body: { username, password } }),

  signup: (username, password) =>
    request('/users', { method: 'POST', body: { username, password } }),

  // ---- products ----
  getProducts: (token) => request('/products', { token }),
  getMyProducts: (token) => request('/products/my', { token }),
  searchProducts: (name, token) =>
    request(`/products/${encodeURIComponent(name)}`, { token }),
  createProduct: (data, token) =>
    request('/products', { method: 'POST', body: data, token }),
  updateProduct: (name, data, token) =>
    request(`/products/${encodeURIComponent(name)}`, { method: 'PATCH', body: data, token }),
  deleteProduct: (name, token) =>
    request(`/products/${encodeURIComponent(name)}`, { method: 'DELETE', token }),

  // ---- cart / purchases / debts ----
  buyProduct: (productId, token) =>
    request(`/carts/${productId}`, { method: 'POST', token }),

  pledgeProduct: (productId, token) =>
    request(`/carts/pledges/${productId}`, { method: 'POST', token }),

  getMyPurchases: (token) => request('/carts/me', { token }),

  getDebts: (username, token) =>
    request(`/carts/unpaid_sells${username ? `?username=${encodeURIComponent(username)}` : ''}`, { token }),

  markPaid: (cartId, token) =>
    request('/carts', { method: 'PATCH', body: { cart_id: cartId, status: true }, token }),

  cancelPurchase: (cartId, token) =>
    request(`/carts/${cartId}`, { method: 'DELETE', token }),

  // ---- users ----
  getMe: (token) => request('/users/me', { token }),
  getAllUsers: (token) => request('/users', { token }),

  updateUsername: (username, token) =>
    request('/users/username', { method: 'PUT', body: { username }, token }),

  updatePassword: (current_password, new_password, token) =>
    request('/users/password', { method: 'PUT', body: { current_password, new_password }, token }),

  updateMoney: (money, token) =>
    request('/users/money', { method: 'PUT', body: { money }, token }),

  deleteAccount: (token) => request('/users', { method: 'DELETE', token }),
}
