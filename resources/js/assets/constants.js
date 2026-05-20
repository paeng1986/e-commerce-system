// ─── DATA & CONSTANTS ───────────────────────────────────────────────────────

export const PRODUCTS = [
  { id: 1, name: "NexVolt ProBook X1", category: "Laptops", price: 1299, originalPrice: 1599, rating: 4.8, reviews: 342, stock: 12, badge: "Best Seller", img: "💻", specs: { CPU: "Intel Core i9-13900H", RAM: "32GB DDR5", Storage: "1TB NVMe SSD", Display: "14\" 2.8K OLED 120Hz", Battery: "86Wh", GPU: "RTX 4060" }, description: "The ultimate productivity powerhouse with OLED display and next-gen performance for professionals." },
  { id: 2, name: "VoltStation Pro Desktop", category: "Desktops", price: 1899, originalPrice: 2199, rating: 4.9, reviews: 189, stock: 5, badge: "New", img: "🖥️", specs: { CPU: "AMD Ryzen 9 7950X", RAM: "64GB DDR5", Storage: "2TB NVMe SSD", GPU: "RTX 4080 16GB", PSU: "850W Platinum", Cooling: "360mm AIO" }, description: "Unmatched desktop performance for gaming, 3D rendering, and heavy workloads." },
  { id: 3, name: "NexVolt AirPods Studio", category: "Audio", price: 249, originalPrice: 299, rating: 4.7, reviews: 891, stock: 50, badge: "Sale", img: "🎧", specs: { Type: "Over-ear ANC", "Battery Life": "36 hours", Connectivity: "Bluetooth 5.3", Driver: "40mm Dynamic", Codec: "LDAC, aptX HD", Weight: "250g" }, description: "Premium noise-cancelling headphones with audiophile-grade sound and all-day comfort." },
  { id: 4, name: "VoltWatch Ultra S3", category: "Wearables", price: 449, originalPrice: 499, rating: 4.6, reviews: 523, stock: 28, badge: "New", img: "⌚", specs: { Display: "2.1\" LTPO AMOLED", Battery: "Up to 18 days", Health: "ECG, SpO2, Stress", GPS: "Dual-band", Water: "10 ATM", OS: "VoltOS 4" }, description: "Next-generation smartwatch with medical-grade health tracking and exceptional battery life." },
  { id: 5, name: "NexVolt UltraTab X", category: "Tablets", price: 799, originalPrice: 899, rating: 4.8, reviews: 267, stock: 19, badge: "Best Seller", img: "📱", specs: { Chip: "NexChip M3", Display: "12.9\" Mini-LED", RAM: "16GB", Storage: "256GB", Camera: "12MP Ultra Wide", Battery: "10,758 mAh" }, description: "The most powerful tablet ever built, designed for creative professionals on the go." },
  { id: 6, name: "VoltCam Pro 8K", category: "Cameras", price: 2499, originalPrice: 2999, rating: 4.9, reviews: 94, stock: 3, badge: "Limited", img: "📷", specs: { Sensor: "Full-Frame 45MP", Video: "8K @ 30fps", ISO: "100-51200", Stabilization: "7-stop IBIS", AF: "AI Subject Tracking", Mount: "VoltMount L" }, description: "Revolutionary 8K full-frame mirrorless camera with AI-powered autofocus." },
  { id: 7, name: "NexVolt ThinkPad Slim", category: "Laptops", price: 899, originalPrice: 1099, rating: 4.5, reviews: 456, stock: 24, badge: "Sale", img: "💻", specs: { CPU: "Intel Core i7-1365U", RAM: "16GB LPDDR5", Storage: "512GB SSD", Display: "13.3\" IPS FHD", Battery: "72Wh", Weight: "1.1kg" }, description: "Ultra-portable business laptop with all-day battery life and legendary keyboard." },
  { id: 8, name: "VoltSound Beam Pro", category: "Audio", price: 349, originalPrice: 399, rating: 4.7, reviews: 312, stock: 15, badge: "New", img: "🔊", specs: { Type: "Soundbar", Channels: "3.1.2 Atmos", Power: "450W", Connectivity: "eARC, Optical, BT", Sub: "8\" Wireless", Dimensions: "1100mm wide" }, description: "Cinema-quality Dolby Atmos soundbar with wireless subwoofer for immersive audio." },
  { id: 9, name: "NexVolt GamingPad X", category: "Gaming", price: 699, originalPrice: 799, rating: 4.8, reviews: 731, stock: 9, badge: "Best Seller", img: "🎮", specs: { Display: "7\" IPS 144Hz", CPU: "AMD Ryzen Z1 Extreme", RAM: "16GB LPDDR5X", Storage: "512GB SSD", Battery: "50Wh", Controls: "Hall-effect joysticks" }, description: "Handheld gaming powerhouse running full PC titles anywhere you go." },
];

export const CATEGORIES = ["All", "Laptops", "Desktops", "Tablets", "Audio", "Cameras", "Wearables", "Gaming"];

export const CHECKOUT_STEPS = ["Cart", "Checkout", "Payment", "Confirmation", "Tracking", "Delivery"];

export const REVIEWS = [
  { user: "Alex M.", rating: 5, text: "Absolutely phenomenal device. Exceeded all my expectations. The display is stunning.", date: "2 days ago", verified: true },
  { user: "Sarah K.", rating: 4, text: "Great performance and build quality. Battery could be slightly better but overall amazing.", date: "1 week ago", verified: true },
  { user: "Daniel R.", rating: 5, text: "Best purchase I've made in years. Fast shipping, perfect packaging, works flawlessly.", date: "2 weeks ago", verified: true },
];

export const formatCurrency = (n) => `P ${n.toLocaleString()}`;
