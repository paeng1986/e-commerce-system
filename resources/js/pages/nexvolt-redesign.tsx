import { useState, useEffect } from "react";

const PRODUCTS = [
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

const CATEGORIES = ["All", "Laptops", "Desktops", "Tablets", "Audio", "Cameras", "Wearables", "Gaming"];
const STEPS = ["Cart", "Checkout", "Payment", "Confirm", "Tracking", "Delivered"];
const REVIEWS = [
  { user: "Alex M.", rating: 5, text: "Absolutely phenomenal device. Exceeded all my expectations. The display is stunning.", date: "2 days ago", verified: true },
  { user: "Sarah K.", rating: 4, text: "Great performance and build quality. Battery could be slightly better but overall amazing.", date: "1 week ago", verified: true },
  { user: "Daniel R.", rating: 5, text: "Best purchase I've made in years. Fast shipping, perfect packaging, works flawlessly.", date: "2 weeks ago", verified: true },
];

const $ = (n) => `$${n.toLocaleString()}`;

const BADGE_COLORS = {
  "Best Seller": { bg: "#2563EB", text: "#fff" },
  "New": { bg: "#059669", text: "#fff" },
  "Sale": { bg: "#DC2626", text: "#fff" },
  "Limited": { bg: "#7C3AED", text: "#fff" },
};

const Stars = ({ rating, size = 13 }) => (
  <span style={{ fontSize: size, letterSpacing: -1 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB" }}>★</span>
    ))}
  </span>
);

const BadgePill = ({ text }) => {
  const c = BADGE_COLORS[text] || { bg: "#555", text: "#fff" };
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 2, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'DM Mono', monospace" }}>
      {text}
    </span>
  );
};

export default function NexVoltPro() {
  const [page, setPage] = useState("landing");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [orderNum] = useState(`NV-${Math.floor(Math.random()*90000+10000)}`);
  const [notification, setNotification] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, text: "" });
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex(h => (h + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = (product, qty = 1) => {
    setCart(c => {
      const ex = c.find(i => i.id === product.id);
      if (ex) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...c, { ...product, qty }];
    });
    notify(`${product.name} added to cart`);
  };

  const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(c => c.map(i => i.id === id ? { ...i, qty } : i));
  };
  const toggleWishlist = (id) => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  const filtered = PRODUCTS.filter(p => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  const heroProducts = [PRODUCTS[0], PRODUCTS[1], PRODUCTS[4]];
  const heroProduct = heroProducts[heroIndex];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #F5F7FF;
      --surface: #FFFFFF;
      --surface2: #EEF1FB;
      --border: #DDE2F0;
      --border2: #C7CEE8;
      --text: #0F1733;
      --text2: #4B5680;
      --text3: #8E97BE;
      --gold: #2563EB;
      --gold2: #1D4ED8;
      --green: #059669;
      --red: #DC2626;
      --purple: #7C3AED;
      --accent: #2563EB;
    }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }
    .nvp-nav { position: sticky; top: 0; z-index: 200; background: rgba(255,255,255,0.96); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 0 48px; display: flex; align-items: center; justify-content: space-between; height: 68px; gap: 24px; box-shadow: 0 1px 12px rgba(37,99,235,0.07); }
    .nvp-logo { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 900; color: var(--text); cursor: pointer; letter-spacing: -0.5px; display: flex; align-items: center; gap: 6px; }
    .nvp-logo span { color: var(--gold); }
    .nvp-navlinks { display: flex; align-items: center; gap: 32px; }
    .nvp-navlink { color: var(--text2); font-size: 13px; font-weight: 500; cursor: pointer; letter-spacing: 0.5px; text-transform: uppercase; transition: color 0.2s; background: none; border: none; font-family: 'DM Sans', sans-serif; }
    .nvp-navlink:hover { color: var(--text); }
    .nvp-navactions { display: flex; align-items: center; gap: 16px; }
    .nvp-icon-btn { background: none; border: none; color: var(--text2); cursor: pointer; font-size: 16px; padding: 8px; border-radius: 6px; display: flex; align-items: center; transition: color 0.2s, background 0.2s; position: relative; }
    .nvp-icon-btn:hover { color: var(--text); background: var(--surface2); }
    .nvp-cart-btn { background: var(--gold); color: #dfdfdf; border: none; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 4px; cursor: pointer; letter-spacing: 0.3px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .nvp-cart-btn:hover { background: var(--gold2); }
    .nvp-badge-count { background: var(--red); color: #fff; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }
    .nvp-search-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 300; display: flex; align-items: flex-start; justify-content: center; padding-top: 100px; }
    .nvp-search-box { background: var(--surface); border: 1px solid var(--border2); border-radius: 8px; width: 600px; max-width: 90vw; overflow: hidden; box-shadow: 0 20px 60px rgba(37,99,235,0.15); }
    .nvp-search-input { width: 100%; background: transparent; border: none; outline: none; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 18px; padding: 20px 24px; letter-spacing: 0.2px; }
    .nvp-search-input::placeholder { color: var(--text3); }
    .nvp-hero { position: relative; min-height: 600px; background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #DBEAFE 100%); overflow: hidden; display: grid; grid-template-columns: 1fr 1fr; }
    .nvp-hero-content { padding: 80px 60px; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 2; }
    .nvp-hero-visual { display: flex; align-items: center; justify-content: center; font-size: 200px; position: relative; background: linear-gradient(135deg, #C7D7FD, #BFDBFE); }
    .nvp-hero-visual::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(37,99,235,0.10) 0%, transparent 70%); }
    .nvp-hero-eyebrow { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--gold); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
    .nvp-hero-title { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 900; color: var(--text); line-height: 1.1; margin-bottom: 20px; }
    .nvp-hero-desc { color: var(--text2); font-size: 16px; line-height: 1.8; margin-bottom: 36px; max-width: 440px; }
    .nvp-hero-price { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 700; color: var(--gold); margin-bottom: 8px; }
    .nvp-hero-orig { font-size: 18px; color: var(--text3); text-decoration: line-through; margin-bottom: 32px; }
    .nvp-hero-dots { position: absolute; bottom: 32px; left: 60px; display: flex; gap: 8px; }
    .nvp-hero-dot { width: 28px; height: 3px; border-radius: 2px; cursor: pointer; transition: all 0.3s; }
    .nvp-btn-primary { background: var(--gold); color: #f0f0f0; border: none; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 4px; cursor: pointer; letter-spacing: 0.3px; transition: all 0.2s; }
    .nvp-btn-primary:hover { background: var(--gold2); transform: translateY(-1px); }
    .nvp-btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border2); font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; padding: 14px 32px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
    .nvp-btn-outline:hover { border-color: var(--text); }
    .nvp-btn-ghost { background: var(--surface2); color: var(--text2); border: 1px solid var(--border); font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 13px; padding: 12px 24px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
    .nvp-btn-ghost:hover { background: var(--border); color: var(--text); }
    .nvp-trustbar { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 16px 48px; }
    .nvp-trustbar-inner { display: flex; justify-content: center; gap: 56px; flex-wrap: wrap; }
    .nvp-trust-item { display: flex; align-items: center; gap: 10px; color: var(--text2); font-size: 12px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; }
    .nvp-trust-icon { font-size: 16px; }
    .nvp-section { padding: 80px 60px; }
    .nvp-section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 48px; }
    .nvp-section-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: var(--text); }
    .nvp-section-link { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--gold); letter-spacing: 1px; text-transform: uppercase; cursor: pointer; background: none; border: none; }
    .nvp-cat-grid { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 56px; }
    .nvp-cat-chip { background: var(--surface); color: var(--text2); border: 1px solid var(--border); border-radius: 100px; padding: 8px 20px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
    .nvp-cat-chip.active, .nvp-cat-chip:hover { background: var(--gold); color: #fff; border-color: var(--gold); }
    .nvp-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .nvp-product-card { background: var(--surface); cursor: pointer; transition: all 0.3s; border: 1px solid var(--border); position: relative; overflow: hidden; border-radius: 12px; }
    .nvp-product-card:hover { border-color: var(--gold); box-shadow: 0 8px 32px rgba(37,99,235,0.12); transform: translateY(-2px); }
    .nvp-product-card:hover .nvp-card-overlay { opacity: 1; }
    .nvp-card-img { height: 200px; display: flex; align-items: center; justify-content: center; font-size: 88px; background: linear-gradient(135deg, #EEF2FF, #DBEAFE); position: relative; }
    .nvp-card-img-inner { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .nvp-product-card:hover .nvp-card-img-inner { transform: scale(1.08); }
    .nvp-card-overlay { position: absolute; inset: 0; background: rgba(37,99,235,0.04); opacity: 0; transition: opacity 0.3s; }
    .nvp-card-body { padding: 20px; }
    .nvp-card-cat { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text3); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
    .nvp-card-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 10px; line-height: 1.3; }
    .nvp-card-stars { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
    .nvp-card-reviews { font-size: 11px; color: var(--text3); font-family: 'DM Mono', monospace; }
    .nvp-card-footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid var(--border); padding-top: 16px; }
    .nvp-card-price { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--gold); }
    .nvp-card-orig { font-size: 12px; color: var(--text3); text-decoration: line-through; margin-top: 2px; font-family: 'DM Mono', monospace; }
    .nvp-card-add { background: var(--gold); border: none; color: #fff; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 12px; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
    .nvp-card-add:hover { background: var(--gold2); }
    .nvp-card-wish { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); border: 1px solid var(--border); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .nvp-card-wish:hover { background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
    .nvp-card-badge { position: absolute; top: 12px; left: 12px; }
    .nvp-page { min-height: calc(100vh - 68px); background: var(--bg); }
    .nvp-notification { position: fixed; top: 84px; right: 24px; z-index: 999; padding: 14px 22px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'DM Mono', monospace; letter-spacing: 0.5px; animation: nvpSlideIn 0.3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    @keyframes nvpSlideIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes nvpFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
    .nvp-float { animation: nvpFloat 5s ease-in-out infinite; }
    .nvp-divider { height: 1px; background: var(--border); margin: 0 60px; }
    .nvp-browse-controls { display: flex; gap: 12px; align-items: center; }
    .nvp-select { background: var(--surface); border: 1px solid var(--border); color: var(--text2); font-family: 'DM Mono', monospace; font-size: 11px; padding: 8px 14px; border-radius: 8px; outline: none; cursor: pointer; letter-spacing: 0.5px; }
    .nvp-browse-search { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; padding: 0 14px; gap: 8px; }
    .nvp-browse-search input { background: transparent; border: none; outline: none; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 9px 0; width: 220px; }
    .nvp-browse-search input::placeholder { color: var(--text3); }
    .nvp-step-bar { color: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 48px; gap: 0; }
    .nvp-step { color: #fff; display: flex; align-items: center; }
    .nvp-step-dot { color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; font-family: 'DM Mono', monospace; }
    .nvp-step-line { width: 60px; height: 1px; }
    .nvp-step-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 6px; text-align: center; }
    .nvp-checkout-grid { display: grid; grid-template-columns: 1fr 360px; gap: 32px; }
    .nvp-card-surface { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(37,99,235,0.06); }
    .nvp-form-label { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text3); letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 8px; }
    .nvp-form-input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: var(--text); outline: none; transition: border-color 0.2s; }
    .nvp-form-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .nvp-form-input::placeholder { color: var(--text3); }
    .nvp-form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .nvp-form-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .nvp-section-heading { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 20px; }
    .nvp-summary-item { display: flex; justify-content: space-between; font-size: 13px; color: var(--text2); margin-bottom: 10px; }
    .nvp-summary-total { display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; color: var(--text); border-top: 1px solid var(--border); padding-top: 16px; margin-top: 8px; }
    .nvp-summary-total-price { font-family: 'Playfair Display', serif; color: var(--gold); font-size: 22px; }
    .nvp-cart-item { display: grid; grid-template-columns: 80px 1fr auto; gap: 20px; align-items: center; padding: 24px 0; border-bottom: 1px solid var(--border); }
    .nvp-qty-ctrl { display: flex; align-items: center; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .nvp-qty-btn { background: var(--surface2); border: none; color: var(--text); padding: 8px 14px; cursor: pointer; font-weight: 700; font-size: 14px; transition: background 0.2s; font-family: 'DM Sans', sans-serif; }
    .nvp-qty-btn:hover { background: var(--border); }
    .nvp-qty-val { padding: 8px 16px; font-weight: 700; font-size: 14px; border-left: 1px solid var(--border); border-right: 1px solid var(--border); color: var(--text); font-family: 'DM Mono', monospace; }
    .nvp-remove-btn { background: none; border: none; color: var(--text3); cursor: pointer; font-size: 12px; font-family: 'DM Mono', monospace; letter-spacing: 0.5px; transition: color 0.2s; }
    .nvp-remove-btn:hover { color: var(--red); }
    .nvp-promo-row { display: flex; gap: 10px; margin-top: 16px; }
    .nvp-promo-input { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 11px 14px; font-size: 13px; font-family: 'DM Mono', monospace; color: var(--text); outline: none; letter-spacing: 1px; }
    .nvp-promo-input::placeholder { color: var(--text3); }
    .nvp-radio-option { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; cursor: pointer; justify-content: space-between; transition: border-color 0.2s, background 0.2s; }
    .nvp-radio-option:hover { border-color: var(--gold); background: rgba(37,99,235,0.02); }
    .nvp-tracking-step { display: flex; flex-direction: column; align-items: center; }
    .nvp-tracking-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; }
    .nvp-tracking-line { width: 80px; height: 3px; border-radius: 2px; }
    .nvp-after-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .nvp-after-card { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 24px; }
    .nvp-footer { background: var(--surface); border-top: 1px solid var(--border); padding: 48px 60px 32px; margin-top: 80px; }
    .nvp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
    .nvp-footer-brand { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: var(--text); margin-bottom: 12px; }
    .nvp-footer-brand span { color: var(--gold); }
    .nvp-footer-desc { color: var(--text3); font-size: 13px; line-height: 1.8; }
    .nvp-footer-col-title { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px; color: var(--gold); text-transform: uppercase; margin-bottom: 16px; }
    .nvp-footer-link { color: var(--text3); font-size: 13px; margin-bottom: 10px; cursor: pointer; transition: color 0.2s; display: block; }
    .nvp-footer-link:hover { color: var(--text); }
    .nvp-footer-bottom { border-top: 1px solid var(--border); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; color: var(--text3); font-size: 12px; font-family: 'DM Mono', monospace; }
    .nvp-spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .nvp-spec-item { background: var(--surface2); border: 1px solid var(--border); border-radius: 3px; padding: 12px 14px; }
    .nvp-spec-key { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--text3); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .nvp-spec-val { font-size: 13px; color: var(--text); font-weight: 500; }
    .nvp-pay-method { display: flex; gap: 10px; margin-bottom: 20px; }
    .nvp-pay-tab { flex: 1; border: 1px solid var(--border); border-radius: 3px; background: var(--surface2); padding: 12px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text2); font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
    .nvp-pay-tab.active { border-color: var(--gold); background: rgba(200,169,110,0.08); color: var(--gold); }
    .nvp-wishlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .nvp-hero-features { display: flex; gap: 24px; margin-top: 28px; flex-wrap: wrap; }
    .nvp-hero-feature { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text2); font-family: 'DM Mono', monospace; letter-spacing: 0.5px; }
    .nvp-hero-feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }
    .nvp-browse-header { padding: 48px 60px 0; }
    .nvp-browse-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .nvp-empty-state { text-align: center; padding: 100px 0; }
    .nvp-product-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
    .nvp-detail-thumb-row { display: flex; gap: 10px; margin-top: 14px; }
    .nvp-detail-thumb { flex: 1; height: 76px; background: var(--surface2); border: 1px solid var(--border); border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 32px; cursor: pointer; transition: all 0.2s; }
    .nvp-detail-thumb:hover, .nvp-detail-thumb.active { border-color: var(--gold); }
    .nvp-detail-main-img { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; height: 420px; display: flex; align-items: center; justify-content: center; font-size: 160px; }
    .nvp-qty-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .nvp-product-action-row { display: flex; gap: 12px; margin-bottom: 28px; }
    .nvp-save-badge { display: inline-block; background: rgba(255,107,107,0.15); color: var(--red); font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1px; padding: 4px 10px; border-radius: 2px; border: 1px solid rgba(255,107,107,0.3); }
    .nvp-review-card { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 24px; }
    .nvp-review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .nvp-verified-tag { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--green); letter-spacing: 1.5px; background: rgba(78,205,196,0.1); padding: 3px 8px; border-radius: 2px; }
    .nvp-review-text { color: var(--text2); font-size: 14px; line-height: 1.7; margin-bottom: 10px; }
    .nvp-review-date { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text3); letter-spacing: 0.5px; }
    .nvp-write-stars { display: flex; gap: 6px; margin-bottom: 16px; }
    .nvp-write-star { font-size: 28px; cursor: pointer; transition: transform 0.1s; }
    .nvp-write-star:hover { transform: scale(1.2); }
    .nvp-textarea { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: 3px; padding: 14px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: var(--text); outline: none; resize: vertical; min-height: 110px; }
    .nvp-textarea:focus { border-color: var(--gold); }
    .nvp-textarea::placeholder { color: var(--text3); }
    .nvp-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .nvp-mini-card { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; cursor: pointer; transition: all 0.2s; overflow: hidden; }
    .nvp-mini-card:hover { border-color: var(--border2); }
    .nvp-mini-card-img { height: 110px; display: flex; align-items: center; justify-content: center; font-size: 50px; background: var(--surface2); }
    .nvp-mini-card-body { padding: 14px; }
    .nvp-confirm-icon { font-size: 80px; margin-bottom: 24px; }
    .nvp-tracking-event { display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border); align-items: flex-start; }
    .nvp-track-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
    .nvp-support-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .nvp-support-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 3px; padding: 16px; text-align: center; }
    .nvp-in-stock { background: rgba(78,205,196,0.1); border: 1px solid rgba(78,205,196,0.2); border-radius: 3px; padding: 10px 14px; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px; }
    .nvp-select-native { background: var(--surface2); border: 1px solid var(--border2); color: var(--text); font-family: 'DM Mono', monospace; font-size: 12px; padding: 10px 14px; border-radius: 3px; outline: none; width: 100%; cursor: pointer; }
  `;

  // ─── SHARED COMPONENTS ───
  const NavBar = () => (
    <nav className="nvp-nav">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div className="nvp-logo" onClick={() => setPage("landing")}>
        ⚡ Nex<span>Volt</span>
      </div>
      <div className="nvp-navlinks">
        <button className="nvp-navlink" onClick={() => setPage("browse")}>Shop</button>
        <button className="nvp-navlink" onClick={() => setPage("browse")}>Laptops</button>
        <button className="nvp-navlink" onClick={() => setPage("browse")}>Gaming</button>
        <button className="nvp-navlink" onClick={() => setPage("browse")}>Audio</button>
      </div>
      <div className="nvp-navactions">
        <button className="nvp-icon-btn" onClick={() => setSearchOpen(true)} title="Search">🔍</button>
        <button className="nvp-icon-btn" onClick={() => setPage("wishlist")} title="Wishlist">
          {wishlist.length > 0 ? "❤️" : "♡"}
          {wishlist.length > 0 && <span style={{ position: "absolute", top: 2, right: 2, fontSize: 9, background: "var(--red)", color: "#fff", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{wishlist.length}</span>}
        </button>
        <button className="nvp-cart-btn" onClick={() => { setCheckoutStep(0); setPage("checkout"); }}>
          Cart {cartCount > 0 && <span className="nvp-badge-count">{cartCount}</span>}
        </button>
      </div>
    </nav>
  );

  const Notify = () => notification && (
    <div className="nvp-notification" style={{ background: notification.type === "success" ? "var(--green)" : "var(--red)", color: "#0E0E0E" }}>
      {notification.type === "success" ? "✓" : "✕"} {notification.msg}
    </div>
  );

  const SearchOverlay = () => searchOpen && (
    <div className="nvp-search-overlay" onClick={() => setSearchOpen(false)}>
      <div className="nvp-search-box" onClick={e => e.stopPropagation()}>
        <input
          className="nvp-search-input"
          placeholder="Search products, categories..."
          autoFocus
          value={search}
          onChange={e => { setSearch(e.target.value); }}
          onKeyDown={e => { if (e.key === "Enter") { setPage("browse"); setSearchOpen(false); } if (e.key === "Escape") setSearchOpen(false); }}
        />
        <div style={{ borderTop: "1px solid var(--border)", padding: "12px 24px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.slice(1).map(c => (
            <button key={c} style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text3)", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 1, padding: "5px 12px", borderRadius: 2, cursor: "pointer", textTransform: "uppercase" }}
              onClick={() => { setCategory(c); setSearch(""); setPage("browse"); setSearchOpen(false); }}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const Footer = () => (
    <footer className="nvp-footer">
      <div className="nvp-footer-grid">
        <div>
          <div className="nvp-footer-brand">⚡ Nex<span>Volt</span></div>
          <div className="nvp-footer-desc">Premium computer hardware and tech accessories. Built for those who demand excellence in every component.</div>
        </div>
        {[["Products", ["Laptops", "Desktops", "Tablets", "Gaming", "Audio", "Wearables", "Cameras"]], ["Support", ["Track Order", "Returns", "Warranty", "Live Chat", "Documentation"]], ["Company", ["About Us", "Careers", "Press", "Blog", "Partners"]]].map(([title, links]) => (
          <div key={title}>
            <div className="nvp-footer-col-title">{title}</div>
            {links.map(l => <span key={l} className="nvp-footer-link">{l}</span>)}
          </div>
        ))}
      </div>
      <div className="nvp-footer-bottom">
        <span>© 2026 NexVolt. All rights reserved.</span>
        <span>Secure payments · 30-day returns · Free shipping $50+</span>
      </div>
    </footer>
  );

  // ─── LANDING PAGE ───
  if (page === "landing") return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
      <style>{css}</style>
      <NavBar />
      <Notify />
      <SearchOverlay />

      {/* Hero */}
      <div className="nvp-hero">
        <div className="nvp-hero-content">
          <div className="nvp-hero-eyebrow">{heroProduct.category} · Featured</div>
          <h1 className="nvp-hero-title">{heroProduct.name}</h1>
          <p className="nvp-hero-desc">{heroProduct.description}</p>
          <div style={{ marginBottom: 8 }}>
            <BadgePill text={heroProduct.badge} />
            <span className="nvp-save-badge" style={{ marginLeft: 10 }}>
              Save ${heroProduct.originalPrice - heroProduct.price}
            </span>
          </div>
          <div className="nvp-hero-price">{$(heroProduct.price)}</div>
          <div className="nvp-hero-orig">{$(heroProduct.originalPrice)}</div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="nvp-btn-primary" onClick={() => addToCart(heroProduct)}>Add to Cart</button>
            <button className="nvp-btn-outline" onClick={() => { setSelectedProduct(heroProduct); setPage("product"); }}>View Specs</button>
          </div>
          <div className="nvp-hero-features">
            {Object.entries(heroProduct.specs).slice(0, 3).map(([k, v]) => (
              <div key={k} className="nvp-hero-feature"><span className="nvp-hero-feature-dot" />{k}: {v}</div>
            ))}
          </div>
        </div>
        <div className="nvp-hero-visual">
          <span className="nvp-float" style={{ fontSize: 200, userSelect: "none" }}>{heroProduct.img}</span>
        </div>
        <div className="nvp-hero-dots">
          {heroProducts.map((_, i) => (
            <div key={i} onClick={() => setHeroIndex(i)} className="nvp-hero-dot"
              style={{ background: i === heroIndex ? "var(--gold)" : "var(--border2)", width: i === heroIndex ? 32 : 10 }} />
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div className="nvp-trustbar">
        <div className="nvp-trustbar-inner">
          {[["🚚", "Free Shipping $50+"], ["🔒", "Secure Checkout"], ["↩️", "30-Day Returns"], ["📞", "24/7 Support"], ["🏆", "Certified Products"]].map(([icon, text]) => (
            <div key={text} className="nvp-trust-item"><span className="nvp-trust-icon">{icon}</span>{text}</div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="nvp-section">
        <div className="nvp-section-header">
          <h2 className="nvp-section-title">Featured Products</h2>
          <button className="nvp-section-link" onClick={() => setPage("browse")}>View All →</button>
        </div>
        <div className="nvp-products-grid">
          {PRODUCTS.slice(0, 6).map(p => (
            <div key={p.id} className="nvp-product-card" onClick={() => { setSelectedProduct(p); setPage("product"); }}>
              <div className="nvp-card-img">
                <span className="nvp-card-img-inner">{p.img}</span>
                <div className="nvp-card-overlay" />
                <div className="nvp-card-badge"><BadgePill text={p.badge} /></div>
                <button className="nvp-card-wish" onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}>
                  {wishlist.includes(p.id) ? "❤️" : "♡"}
                </button>
              </div>
              <div className="nvp-card-body">
                <div className="nvp-card-cat">{p.category}</div>
                <div className="nvp-card-name">{p.name}</div>
                <div className="nvp-card-stars">
                  <Stars rating={p.rating} />
                  <span className="nvp-card-reviews">({p.reviews})</span>
                </div>
                <div className="nvp-card-footer">
                  <div>
                    <div className="nvp-card-price">{$(p.price)}</div>
                    <div className="nvp-card-orig">{$(p.originalPrice)}</div>
                  </div>
                  <button className="nvp-card-add" onClick={e => { e.stopPropagation(); addToCart(p); }}>+ Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="nvp-divider" />

      {/* Categories */}
      <div className="nvp-section">
        <div className="nvp-section-header">
          <h2 className="nvp-section-title">Shop by Category</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px" }}>
          {CATEGORIES.slice(1).map((cat, idx) => {
            const icons = { Laptops: "💻", Desktops: "🖥️", Tablets: "📱", Audio: "🎧", Cameras: "📷", Wearables: "⌚", Gaming: "🎮" };
            const counts = PRODUCTS.filter(p => p.category === cat).length;
            return (
              <div key={cat} onClick={() => { setCategory(cat); setPage("browse"); }}
                style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "36px 28px", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 12 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "var(--surface2)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}>
                <span style={{ fontSize: 40 }}>{icons[cat]}</span>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{cat}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text3)", letterSpacing: 1, textTransform: "uppercase" }}>{counts} Products</div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );

  // ─── BROWSE PAGE ───
  if (page === "browse") return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
      <style>{css}</style>
      <NavBar />
      <Notify />
      <SearchOverlay />
      <div className="nvp-page">
        <div className="nvp-browse-header">
          <div className="nvp-browse-top">
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                {filtered.length} Products
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "var(--text)" }}>
                {category === "All" ? "All Products" : category}
              </h1>
            </div>
            <div className="nvp-browse-controls">
              <div className="nvp-browse-search">
                <span style={{ color: "var(--text3)", fontSize: 14 }}>🔍</span>
                <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="nvp-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
          <div className="nvp-cat-grid">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`nvp-cat-chip ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 60px 80px" }}>
          {filtered.length === 0 ? (
            <div className="nvp-empty-state">
              <div style={{ fontSize: 60, marginBottom: 20 }}>🔍</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "var(--text)", marginBottom: 12 }}>No products found</div>
              <button className="nvp-btn-ghost" onClick={() => { setSearch(""); setCategory("All"); }}>Clear filters</button>
            </div>
          ) : (
            <div className="nvp-products-grid">
              {filtered.map(p => (
                <div key={p.id} className="nvp-product-card" onClick={() => { setSelectedProduct(p); setPage("product"); }}>
                  <div className="nvp-card-img">
                    <span className="nvp-card-img-inner">{p.img}</span>
                    <div className="nvp-card-overlay" />
                    <div className="nvp-card-badge"><BadgePill text={p.badge} /></div>
                    <button className="nvp-card-wish" onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}>
                      {wishlist.includes(p.id) ? "❤️" : "♡"}
                    </button>
                  </div>
                  <div className="nvp-card-body">
                    <div className="nvp-card-cat">{p.category}</div>
                    <div className="nvp-card-name">{p.name}</div>
                    <div className="nvp-card-stars">
                      <Stars rating={p.rating} />
                      <span className="nvp-card-reviews">({p.reviews})</span>
                    </div>
                    <div className="nvp-card-footer">
                      <div>
                        <div className="nvp-card-price">{$(p.price)}</div>
                        <div className="nvp-card-orig">{$(p.originalPrice)}</div>
                      </div>
                      <button className="nvp-card-add" onClick={e => { e.stopPropagation(); addToCart(p); }}>+ Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );

  // ─── PRODUCT PAGE ───
  if (page === "product" && selectedProduct) {
    const p = selectedProduct;
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
        <style>{css}</style>
        <NavBar />
        <Notify />
        <SearchOverlay />
        <div className="nvp-page" style={{ padding: "40px 60px" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text3)", marginBottom: 28, cursor: "pointer", letterSpacing: 0.5, display: "flex", gap: 8, alignItems: "center" }}
            onClick={() => setPage("browse")}>
            ← Back to Products
          </div>

          <div className="nvp-product-detail-grid">
            {/* Left */}
            <div>
              <div className="nvp-detail-main-img">{p.img}</div>
              <div className="nvp-detail-thumb-row">
                {[1,2,3].map(i => (
                  <div key={i} className={`nvp-detail-thumb ${i === 1 ? "active" : ""}`}>{p.img}</div>
                ))}
              </div>
            </div>
            {/* Right */}
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
                <BadgePill text={p.badge} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text3)", letterSpacing: 2, textTransform: "uppercase" }}>{p.category}</span>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "var(--text)", marginBottom: 16, lineHeight: 1.15 }}>{p.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Stars rating={p.rating} size={16} />
                <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{p.rating}</span>
                <span style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>({p.reviews} reviews)</span>
              </div>
              <p style={{ color: "var(--text2)", lineHeight: 1.8, marginBottom: 24, fontSize: 15 }}>{p.description}</p>

              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: "var(--gold)" }}>{$(p.price)}</span>
                <span style={{ fontSize: 20, color: "var(--text3)", textDecoration: "line-through", fontFamily: "'DM Mono', monospace" }}>{$(p.originalPrice)}</span>
              </div>
              <div style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
                <span className="nvp-save-badge">Save ${p.originalPrice - p.price} ({Math.round((1-p.price/p.originalPrice)*100)}% off)</span>
              </div>

              <div className="nvp-in-stock">
                <span style={{ color: "var(--green)", fontSize: 12 }}>●</span>
                <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 13 }}>In Stock</span>
                <span style={{ color: "var(--text3)", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>— {p.stock} units</span>
              </div>

              <div className="nvp-qty-row">
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text3)", letterSpacing: 1.5, textTransform: "uppercase" }}>Qty</span>
                <div className="nvp-qty-ctrl">
                  <button className="nvp-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span className="nvp-qty-val">{quantity}</span>
                  <button className="nvp-qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <div className="nvp-product-action-row">
                <button className="nvp-btn-primary" style={{ flex: 2 }} onClick={() => addToCart(p, quantity)}>Add to Cart</button>
                <button className="nvp-btn-primary" style={{ flex: 2, background: "var(--green)", color: "#0D1F1F" }} onClick={() => { addToCart(p, quantity); setCheckoutStep(0); setPage("checkout"); }}>Buy Now</button>
                <button className="nvp-btn-outline" style={{ padding: "14px 18px" }} onClick={() => toggleWishlist(p.id)}>
                  {wishlist.includes(p.id) ? "❤️" : "♡"}
                </button>
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: 20 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--gold)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Specifications</div>
                <div className="nvp-spec-grid">
                  {Object.entries(p.specs).map(([k, v]) => (
                    <div key={k} className="nvp-spec-item">
                      <div className="nvp-spec-key">{k}</div>
                      <div className="nvp-spec-val">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div style={{ marginTop: 72 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 32 }}>Customer Reviews</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
              {REVIEWS.map((r, i) => (
                <div key={i} className="nvp-review-card">
                  <div className="nvp-review-header">
                    <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{r.user}</div>
                    {r.verified && <span className="nvp-verified-tag">✓ Verified</span>}
                  </div>
                  <Stars rating={r.rating} size={14} />
                  <p className="nvp-review-text" style={{ marginTop: 10 }}>{r.text}</p>
                  <div className="nvp-review-date">{r.date}</div>
                </div>
              ))}
            </div>
            <div className="nvp-card-surface">
              <div className="nvp-section-heading">Write a Review</div>
              <div className="nvp-write-stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="nvp-write-star" style={{ color: s <= review.rating ? "var(--gold)" : "var(--border2)" }}
                    onClick={() => setReview(r => ({ ...r, rating: s }))}>★</span>
                ))}
              </div>
              <textarea className="nvp-textarea" value={review.text} onChange={e => setReview(r => ({ ...r, text: e.target.value }))}
                placeholder="Share your experience with this product..." />
              <button className="nvp-btn-primary" style={{ marginTop: 14 }} onClick={() => { if (review.text) { notify("Review submitted!"); setReview({ rating: 5, text: "" }); } }}>
                Submit Review
              </button>
            </div>
          </div>

          {/* Related */}
          <div style={{ marginTop: 72 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 28 }}>You May Also Like</h2>
            <div className="nvp-related-grid">
              {PRODUCTS.filter(pr => pr.id !== p.id).slice(0, 4).map(pr => (
                <div key={pr.id} className="nvp-mini-card" onClick={() => { setSelectedProduct(pr); window.scrollTo(0,0); }}>
                  <div className="nvp-mini-card-img">{pr.img}</div>
                  <div className="nvp-mini-card-body">
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{pr.category}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "var(--text)", marginBottom: 8, fontSize: 14, lineHeight: 1.3 }}>{pr.name}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>{$(pr.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── WISHLIST ───
  if (page === "wishlist") return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
      <style>{css}</style>
      <NavBar />
      <Notify />
      <div className="nvp-page" style={{ padding: "48px 60px" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Your Collection</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "var(--text)", marginBottom: 40 }}>Wishlist</h1>
        {wishlist.length === 0 ? (
          <div className="nvp-empty-state">
            <div style={{ fontSize: 60, marginBottom: 20 }}>♡</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "var(--text)", marginBottom: 12 }}>Nothing saved yet</div>
            <div style={{ color: "var(--text3)", marginBottom: 24 }}>Browse our products and save your favorites.</div>
            <button className="nvp-btn-primary" onClick={() => setPage("browse")}>Browse Products</button>
          </div>
        ) : (
          <div className="nvp-wishlist-grid">
            {PRODUCTS.filter(p => wishlist.includes(p.id)).map(p => (
              <div key={p.id} className="nvp-product-card">
                <div className="nvp-card-img" onClick={() => { setSelectedProduct(p); setPage("product"); }}>
                  <span className="nvp-card-img-inner">{p.img}</span>
                  <div className="nvp-card-overlay" />
                </div>
                <div className="nvp-card-body">
                  <div className="nvp-card-cat">{p.category}</div>
                  <div className="nvp-card-name">{p.name}</div>
                  <div className="nvp-card-price" style={{ marginBottom: 16 }}>{$(p.price)}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="nvp-btn-primary" style={{ flex: 1, padding: "10px" }} onClick={() => addToCart(p)}>Add to Cart</button>
                    <button className="nvp-btn-ghost" style={{ padding: "10px 14px" }} onClick={() => toggleWishlist(p.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );

  // ─── CHECKOUT FLOW ───
  if (page === "checkout") {
    const StepBar = () => (
      <div className="nvp-step-bar">
        {STEPS.map((s, i) => (
          <div key={s} className="nvp-step">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="nvp-step-dot" style={{
                background: i < checkoutStep ? "var(--gold)" : i === checkoutStep ? "var(--gold)" : "var(--surface2)",
                color: i <= checkoutStep ? "#0E0E0E" : "var(--text3)",
                border: i === checkoutStep ? "2px solid var(--gold)" : "2px solid transparent",
              }}>
                {i < checkoutStep ? "✓" : i + 1}
              </div>
              <div className="nvp-step-label" style={{ color: i <= checkoutStep ? "var(--gold)" : "var(--text3)" }}>{s}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="nvp-step-line" style={{ background: i < checkoutStep ? "var(--gold)" : "var(--border2)", margin: "0 6px", marginBottom: 18 }} />
            )}
          </div>
        ))}
      </div>
    );

    const CartSummaryPanel = ({ onNext, nextLabel = "Continue →", onBack }) => (
      <div style={{ position: "sticky", top: 90 }}>
        <div className="nvp-card-surface">
          <div className="nvp-section-heading" style={{ marginBottom: 20 }}>Order Summary</div>
          {cart.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
              <span style={{ fontSize: 28, width: 36, textAlign: "center" }}>{item.img}</span>
              <div style={{ flex: 1, fontSize: 13, color: "var(--text2)" }}>{item.name} <span style={{ color: "var(--text3)", fontFamily: "'DM Mono', monospace" }}>×{item.qty}</span></div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", fontFamily: "'DM Mono', monospace" }}>{$(item.price * item.qty)}</div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 16, paddingTop: 16 }}>
            <div className="nvp-summary-item"><span>Subtotal</span><span>{$(cartTotal)}</span></div>
            <div className="nvp-summary-item"><span>Shipping</span><span style={{ color: "var(--green)", fontWeight: 600 }}>FREE</span></div>
            <div className="nvp-summary-item"><span>Tax (8%)</span><span>{$(Math.round(cartTotal * 0.08))}</span></div>
            <div className="nvp-summary-total">
              <span>Total</span>
              <span className="nvp-summary-total-price">{$(cartTotal + Math.round(cartTotal * 0.08))}</span>
            </div>
          </div>
          {onNext && <button className="nvp-btn-primary" style={{ width: "100%", marginTop: 20, padding: "14px" }} onClick={onNext}>{nextLabel}</button>}
          {onBack && <button className="nvp-btn-ghost" style={{ width: "100%", marginTop: 10, padding: "12px" }} onClick={onBack}>← Back</button>}
        </div>
      </div>
    );

    // Cart view
    if (checkoutStep === 0) return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
        <style>{css}</style>
        <NavBar />
        <Notify />
        <div className="nvp-page" style={{ padding: "40px 60px" }}>
          <StepBar />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "var(--text)", marginBottom: 32 }}>Shopping Cart</h1>
          {cart.length === 0 ? (
            <div className="nvp-empty-state">
              <div style={{ fontSize: 60, marginBottom: 20 }}>🛒</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "var(--text)", marginBottom: 12 }}>Your cart is empty</div>
              <button className="nvp-btn-primary" onClick={() => setPage("browse")}>Start Shopping</button>
            </div>
          ) : (
            <div className="nvp-checkout-grid">
              <div>
                {cart.map(item => (
                  <div key={item.id} className="nvp-cart-item">
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{item.img}</div>
                    <div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{item.category}</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: "var(--text)", marginBottom: 12 }}>{item.name}</div>
                      <div className="nvp-qty-ctrl" style={{ display: "inline-flex" }}>
                        <button className="nvp-qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                        <span className="nvp-qty-val">{item.qty}</span>
                        <button className="nvp-qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                      <button className="nvp-remove-btn" style={{ marginLeft: 12 }} onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: "var(--gold)" }}>{$(item.price * item.qty)}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{$(item.price)} each</div>
                    </div>
                  </div>
                ))}
                <div className="nvp-promo-row">
                  <input className="nvp-promo-input" placeholder="PROMO CODE" />
                  <button className="nvp-btn-outline" style={{ padding: "11px 20px", fontSize: 13 }}>Apply</button>
                </div>
              </div>
              <CartSummaryPanel onNext={() => setCheckoutStep(1)} nextLabel="Proceed to Checkout →" onBack={() => setPage("browse")} />
            </div>
          )}
        </div>
      </div>
    );

    // Checkout info
    if (checkoutStep === 1) return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
        <style>{css}</style>
        <NavBar />
        <div className="nvp-page" style={{ padding: "40px 60px" }}>
          <StepBar />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "var(--text)", marginBottom: 32 }}>Checkout</h1>
          <div className="nvp-checkout-grid">
            <div>
              <div className="nvp-card-surface">
                <div className="nvp-section-heading">Contact Information</div>
                <div className="nvp-form-2col" style={{ marginBottom: 16 }}>
                  {[["First Name", "text"], ["Last Name", "text"], ["Email Address", "email"], ["Phone Number", "tel"]].map(([label, type]) => (
                    <div key={label}>
                      <label className="nvp-form-label">{label}</label>
                      <input type={type} className="nvp-form-input" placeholder={label} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="nvp-card-surface">
                <div className="nvp-section-heading">Shipping Address</div>
                <div style={{ marginBottom: 16 }}>
                  <label className="nvp-form-label">Street Address</label>
                  <input className="nvp-form-input" placeholder="123 Main Street, Apt 4B" />
                </div>
                <div className="nvp-form-3col">
                  {[["City", "text"], ["State", "text"], ["ZIP Code", "text"]].map(([label, type]) => (
                    <div key={label}>
                      <label className="nvp-form-label">{label}</label>
                      <input type={type} className="nvp-form-input" placeholder={label} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="nvp-card-surface">
                <div className="nvp-section-heading">Shipping Method</div>
                {[["Standard Delivery", "5–7 business days", "FREE"], ["Express Delivery", "2–3 business days", "$12.99"], ["Overnight Delivery", "Next business day", "$29.99"]].map(([label, sub, price]) => (
                  <label key={label} className="nvp-radio-option">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input type="radio" name="shipping" defaultChecked={label.includes("Standard")} style={{ accentColor: "var(--gold)" }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{label}</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text3)" }}>{sub}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: price === "FREE" ? "var(--green)" : "var(--text)", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{price}</span>
                  </label>
                ))}
              </div>
            </div>
            <CartSummaryPanel onNext={() => setCheckoutStep(2)} nextLabel="Continue to Payment →" onBack={() => setCheckoutStep(0)} />
          </div>
        </div>
      </div>
    );

    // Payment
    if (checkoutStep === 2) return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
        <style>{css}</style>
        <NavBar />
        <div className="nvp-page" style={{ padding: "40px 60px" }}>
          <StepBar />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "var(--text)", marginBottom: 32 }}>Payment</h1>
          <div className="nvp-checkout-grid">
            <div>
              <div className="nvp-card-surface">
                <div className="nvp-section-heading">Payment Method</div>
                <div className="nvp-pay-method">
                  {[["💳 Credit Card", true], ["🏦 Bank Transfer", false], ["📱 Digital Wallet", false]].map(([label, active]) => (
                    <button key={label} className={`nvp-pay-tab ${active ? "active" : ""}`}>{label}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label className="nvp-form-label">Card Number</label>
                    <input className="nvp-form-input" placeholder="1234  5678  9012  3456" style={{ letterSpacing: 2 }} />
                  </div>
                  <div className="nvp-form-2col">
                    <div>
                      <label className="nvp-form-label">Cardholder Name</label>
                      <input className="nvp-form-input" placeholder="John Doe" />
                    </div>
                    <div className="nvp-form-2col">
                      <div>
                        <label className="nvp-form-label">Expiry</label>
                        <input className="nvp-form-input" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="nvp-form-label">CVV</label>
                        <input className="nvp-form-input" placeholder="•••" type="password" maxLength={4} />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 3, padding: "12px 16px", marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🔒</span>
                  <span style={{ fontSize: 12, color: "var(--green)", fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 }}>256-bit SSL encryption · Your payment is secure</span>
                </div>
              </div>
              <div className="nvp-card-surface">
                <div className="nvp-section-heading">Billing Address</div>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: "var(--gold)", width: 16, height: 16 }} />
                  <span style={{ color: "var(--text2)", fontSize: 14 }}>Same as shipping address</span>
                </label>
              </div>
            </div>
            <div style={{ position: "sticky", top: 90 }}>
              <div className="nvp-card-surface">
                <div className="nvp-section-heading" style={{ marginBottom: 20 }}>Order Total</div>
                <div className="nvp-summary-item"><span>Subtotal</span><span>{$(cartTotal)}</span></div>
                <div className="nvp-summary-item"><span>Shipping</span><span style={{ color: "var(--green)", fontWeight: 600 }}>FREE</span></div>
                <div className="nvp-summary-item"><span>Tax (8%)</span><span>{$(Math.round(cartTotal * 0.08))}</span></div>
                <div className="nvp-summary-total">
                  <span>Total</span>
                  <span className="nvp-summary-total-price">{$(cartTotal + Math.round(cartTotal * 0.08))}</span>
                </div>
                <button className="nvp-btn-primary" style={{ width: "100%", marginTop: 24, padding: "16px", background: "var(--green)", color: "#0D1F1F", fontSize: 15 }}
                  onClick={() => setCheckoutStep(3)}>
                  🔒 Place Order
                </button>
                <p style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text3)", marginTop: 14, letterSpacing: 0.5, lineHeight: 1.7 }}>
                  By placing your order you agree to our Terms &amp; Privacy Policy
                </p>
                <button className="nvp-btn-ghost" style={{ width: "100%", marginTop: 8, padding: "12px" }} onClick={() => setCheckoutStep(1)}>← Back</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // Confirmation
    if (checkoutStep === 3) return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
        <style>{css}</style>
        <NavBar />
        <div className="nvp-page" style={{ padding: "40px 60px" }}>
          <StepBar />
          <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <div className="nvp-confirm-icon">🎉</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 900, color: "var(--green)", marginBottom: 12 }}>Order Confirmed!</h1>
            <p style={{ color: "var(--text2)", fontSize: 16, marginBottom: 32 }}>Thank you for your purchase. Your order has been successfully placed.</p>
            <div style={{ background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 4, padding: "16px 28px", marginBottom: 32, display: "inline-block" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--green)", letterSpacing: 2 }}>ORDER # </span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, color: "var(--green)", fontSize: 22 }}>{orderNum}</span>
            </div>
            <div className="nvp-card-surface" style={{ textAlign: "left" }}>
              <div className="nvp-section-heading">Order Summary</div>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 36 }}>{item.img}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--text)" }}>{item.name}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text3)" }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "var(--gold)", fontSize: 18 }}>{$(item.price * item.qty)}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 20, paddingTop: 16 }}>
                <span style={{ color: "var(--text)" }}>Total Paid</span>
                <span style={{ fontFamily: "'Playfair Display', serif", color: "var(--gold)" }}>{$(cartTotal + Math.round(cartTotal * 0.08))}</span>
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: "14px 20px", marginBottom: 28, textAlign: "left" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--gold)", letterSpacing: 1 }}>📧 Confirmation email sent · Est. delivery: 5-7 business days</div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="nvp-btn-primary" onClick={() => setCheckoutStep(4)}>Track Order 📦</button>
              <button className="nvp-btn-outline" onClick={() => setPage("browse")}>Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    );

    // Tracking
    if (checkoutStep === 4) return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
        <style>{css}</style>
        <NavBar />
        <div className="nvp-page" style={{ padding: "40px 60px" }}>
          <StepBar />
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Order #{orderNum}</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "var(--text)", marginBottom: 36 }}>Track Your Order</h1>

            <div className="nvp-card-surface" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div className="nvp-section-heading" style={{ marginBottom: 0 }}>Shipment Status</div>
                <span style={{ background: "rgba(200,169,110,0.12)", color: "var(--gold)", padding: "6px 16px", borderRadius: 3, fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1, border: "1px solid rgba(200,169,110,0.3)" }}>🚚 IN TRANSIT</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: 16 }}>
                <div style={{ position: "absolute", top: 18, left: "8%", right: "8%", height: 3, background: "var(--border2)", borderRadius: 2 }}>
                  <div style={{ width: "55%", height: "100%", background: "linear-gradient(90deg, var(--gold), var(--green))", borderRadius: 2 }} />
                </div>
                {[["✓", "Placed", "May 12", true], ["✓", "Processed", "May 12", true], ["🚚", "In Transit", "May 13", true], ["📦", "Out for Delivery", "May 16", false], ["🏠", "Delivered", "Est. May 16", false]].map(([icon, label, date, done]) => (
                  <div key={label} className="nvp-tracking-step">
                    <div className="nvp-tracking-dot" style={{ background: done ? "var(--gold)" : "var(--surface2)", color: done ? "#0E0E0E" : "var(--text3)", border: `2px solid ${done ? "var(--gold)" : "var(--border2)"}`, fontSize: 12, fontWeight: 700 }}>{icon}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700, color: done ? "var(--text)" : "var(--text3)", textAlign: "center", marginTop: 8, letterSpacing: 0.5 }}>{label}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--text3)", marginTop: 3 }}>{date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="nvp-card-surface" style={{ marginBottom: 20 }}>
              <div className="nvp-section-heading" style={{ marginBottom: 20 }}>Tracking Events</div>
              {[
                ["var(--green)", "Package picked up by courier", "NexVolt Fulfillment Center, CA", "May 12, 2:14 PM"],
                ["var(--gold)", "Package in transit", "Distribution Hub, Phoenix AZ", "May 13, 8:30 AM"],
                ["var(--gold)", "Package arriving soon", "Local Delivery Facility", "Est. May 16, Morning"],
              ].map(([color, event, loc, time]) => (
                <div key={event} className="nvp-tracking-event">
                  <div className="nvp-track-dot" style={{ background: color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{event}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{loc}</div>
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text3)", whiteSpace: "nowrap" }}>{time}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="nvp-btn-primary" onClick={() => setCheckoutStep(5)}>Simulate Delivery ✓</button>
              <button className="nvp-btn-outline" onClick={() => setPage("browse")}>Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    );

    // Delivery & After-sales
    if (checkoutStep === 5) return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
        <style>{css}</style>
        <NavBar />
        <div className="nvp-page" style={{ padding: "40px 60px" }}>
          <StepBar />
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 80, marginBottom: 20 }}>📦</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 900, color: "var(--green)", marginBottom: 12 }}>Delivered!</h1>
              <p style={{ color: "var(--text2)", fontSize: 16 }}>Order #{orderNum} was delivered on May 16, 2026 at 2:47 PM</p>
            </div>

            <div className="nvp-after-grid">
              {[
                ["↩️", "Return & Refund", "30-day return policy", "Return Item"],
                ["🔄", "Exchange", "Swap for another item", "Exchange"],
                ["🛡️", "Warranty Claim", "2-year coverage", "Claim Warranty"],
                ["⭐", "Rate Product", "Share your experience", "Write Review"],
              ].map(([icon, title, sub, btn]) => (
                <div key={title} className="nvp-after-card">
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "var(--text)", marginBottom: 6, fontSize: 17 }}>{title}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text3)", marginBottom: 18 }}>{sub}</div>
                  <button className="nvp-btn-ghost" style={{ width: "100%", padding: "10px" }}
                    onClick={() => { if (title === "Return & Refund") document.getElementById("return-section")?.scrollIntoView({ behavior: "smooth" }); }}>
                    {btn}
                  </button>
                </div>
              ))}
            </div>

            <div id="return-section" className="nvp-card-surface" style={{ marginBottom: 20 }}>
              <div className="nvp-section-heading" style={{ marginBottom: 20 }}>Request a Return</div>
              {returnSubmitted ? (
                <div style={{ textAlign: "center", padding: "24px" }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "var(--green)", fontSize: 20 }}>Return request submitted!</div>
                  <div style={{ color: "var(--text3)", fontSize: 14, marginTop: 8, fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 }}>Prepaid return label sent within 24 hours.</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label className="nvp-form-label">Reason for Return</label>
                    <select className="nvp-select-native" value={returnReason} onChange={e => setReturnReason(e.target.value)}>
                      <option value="">Select a reason...</option>
                      <option>Defective or damaged</option>
                      <option>Wrong item received</option>
                      <option>Changed my mind</option>
                      <option>Product not as described</option>
                      <option>Found better price</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label className="nvp-form-label">Additional Details</label>
                    <textarea className="nvp-textarea" placeholder="Please describe the issue..." />
                  </div>
                  <button className="nvp-btn-primary" style={{ background: "var(--red)", color: "#fff" }}
                    onClick={() => { if (returnReason) setReturnSubmitted(true); else notify("Please select a return reason", "error"); }}>
                    Submit Return Request
                  </button>
                </>
              )}
            </div>

            <div className="nvp-card-surface">
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--gold)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Need Help?</div>
              <div className="nvp-support-grid">
                {[["💬", "Live Chat", "Chat with an agent"], ["📞", "Call Us", "1-800-NEXVOLT"], ["📧", "Email", "support@nexvolt.com"]].map(([icon, label, sub]) => (
                  <div key={label} className="nvp-support-card">
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4, fontSize: 14 }}>{label}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text3)", letterSpacing: 0.5 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 28 }}>
              <button className="nvp-btn-primary" onClick={() => { setCart([]); setPage("landing"); setCheckoutStep(0); }}>Back to Home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}