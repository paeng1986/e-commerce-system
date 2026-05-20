import { useState, useEffect, useRef } from "react";

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

const STEPS = ["Cart", "Checkout", "Payment", "Confirmation", "Tracking", "Delivery"];

const REVIEWS = [
  { user: "Alex M.", rating: 5, text: "Absolutely phenomenal device. Exceeded all my expectations. The display is stunning.", date: "2 days ago", verified: true },
  { user: "Sarah K.", rating: 4, text: "Great performance and build quality. Battery could be slightly better but overall amazing.", date: "1 week ago", verified: true },
  { user: "Daniel R.", rating: 5, text: "Best purchase I've made in years. Fast shipping, perfect packaging, works flawlessly.", date: "2 weeks ago", verified: true },
];

const Stars = ({ rating, size = 14 }) => (
  <span style={{ fontSize: size, letterSpacing: -1 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB" }}>★</span>
    ))}
  </span>
);

const Badge = ({ text }) => {
  const colors = { "Best Seller": "#3B82F6", "New": "#10B981", "Sale": "#EF4444", "Limited": "#8B5CF6" };
  return (
    <span style={{
      background: colors[text] || "#6B7280", color: "#fff", fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5
    }}>{text}</span>
  );
};

const formatCurrency = (n) => `$${n.toLocaleString()}`;

export default function NexVolt() {
  const [page, setPage] = useState("landing");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [checkoutStep, setCheckoutStep] = useState(0); // 0=cart, 1=checkout, 2=payment, 3=confirm, 4=tracking, 5=delivery
  const [orderNum] = useState(`NV-${Math.floor(Math.random()*90000+10000)}`);
  const [notification, setNotification] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, text: "" });
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex(h => (h + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = (product, qty = 1) => {
    setCart(c => {
      const existing = c.find(i => i.id === product.id);
      if (existing) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...c, { ...product, qty }];
    });
    notify(`${product.name} added to cart!`);
  };

  const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(c => c.map(i => i.id === id ? { ...i, qty } : i));
  };

  const toggleWishlist = (id) => {
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  };

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

  const styles = {
    nav: {
      position: "sticky", top: 0, zIndex: 100,
      background: "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 100%)",
      borderBottom: "1px solid rgba(59,130,246,0.2)",
      padding: "0 24px", display: "flex", alignItems: "center",
      justifyContent: "space-between", height: 64, gap: 16
    },
    logo: { fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", cursor: "pointer", letterSpacing: 1, display: "flex", alignItems: "center", gap: 8 },
    logoAccent: { color: "#3B82F6" },
    navLink: { color: "rgba(255,255,255,0.7)", fontSize: 14, cursor: "pointer", padding: "4px 12px", borderRadius: 6, transition: "all 0.2s", fontWeight: 500 },
    searchBar: { flex: 1, maxWidth: 400, display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden" },
    searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", padding: "8px 14px", fontSize: 14 },
    btn: { background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", letterSpacing: 0.3 },
    btnOutline: { background: "transparent", color: "#3B82F6", border: "2px solid #3B82F6", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
    btnGhost: { background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
    card: { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.08)", border: "1px solid #F0F2F7", transition: "all 0.25s", cursor: "pointer" },
    page: { minHeight: "calc(100vh - 64px)", background: "#F8FAFF" },
  };

  const NavBar = () => (
    <nav style={styles.nav}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={styles.logo} onClick={() => setPage("landing")}>
        <span style={{ fontSize: 28 }}>⚡</span>
        <span>Nex<span style={styles.logoAccent}>Volt</span></span>
      </div>
      <div style={styles.searchBar}>
        <span style={{ padding: "0 8px 0 12px", color: "rgba(255,255,255,0.4)", fontSize: 16 }}>🔍</span>
        <input style={styles.searchInput} placeholder="Search products..." value={search}
          onChange={e => { setSearch(e.target.value); setPage("browse"); }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button style={styles.navLink} onClick={() => setPage("browse")}>Shop</button>
        <button style={styles.navLink} onClick={() => setPage("wishlist")}>♡ {wishlist.length > 0 && `(${wishlist.length})`}</button>
        <button style={{ ...styles.btn, padding: "8px 18px", position: "relative" }} onClick={() => { setCheckoutStep(0); setPage("checkout"); }}>
          🛒 {cartCount > 0 && <span style={{ background: "#EF4444", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginLeft: 4 }}>{cartCount}</span>}
        </button>
      </div>
    </nav>
  );

  const Notification = () => notification && (
    <div style={{
      position: "fixed", top: 80, right: 24, zIndex: 999,
      background: notification.type === "success" ? "#10B981" : "#EF4444",
      color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)", animation: "slideIn 0.3s ease"
    }}>
      ✓ {notification.msg}
    </div>
  );

  // ─── LANDING PAGE ───
  if (page === "landing") return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <NavBar />
      <Notification />
      <style>{`
        @keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .product-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(0,0,0,0.14) !important; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,0.4); }
        .cat-chip:hover { background: #3B82F6 !important; color: #fff !important; }
      `}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 60%, #0A1628 100%)", minHeight: 520, display: "flex", alignItems: "center", padding: "60px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 70% 50%, rgba(59,130,246,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", fontSize: 180, animation: "float 4s ease-in-out infinite", opacity: 0.9 }}>{heroProduct.img}</div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 560 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <Badge text={heroProduct.badge} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{heroProduct.category}</span>
          </div>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 42, fontWeight: 900, color: "#fff", margin: "0 0 16px", lineHeight: 1.15 }}>{heroProduct.name}</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, marginBottom: 28, lineHeight: 1.7 }}>{heroProduct.description}</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 32 }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 36, fontWeight: 900, color: "#3B82F6" }}>{formatCurrency(heroProduct.price)}</span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 20, textDecoration: "line-through" }}>{formatCurrency(heroProduct.originalPrice)}</span>
            <span style={{ background: "#EF4444", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
              SAVE ${heroProduct.originalPrice - heroProduct.price}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-primary" style={styles.btn} onClick={() => { addToCart(heroProduct); }}>Add to Cart</button>
            <button style={styles.btnGhost} onClick={() => { setSelectedProduct(heroProduct); setPage("product"); }}>View Details</button>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
          {heroProducts.map((_, i) => (
            <div key={i} onClick={() => setHeroIndex(i)} style={{ width: i === heroIndex ? 24 : 8, height: 8, borderRadius: 4, background: i === heroIndex ? "#3B82F6" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "14px 60px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
          {[["🚚", "Free Shipping $50+"], ["🔒", "Secure Checkout"], ["↩️", "30-Day Returns"], ["📞", "24/7 Support"], ["🏆", "Certified Products"]].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, color: "#374151", fontSize: 13, fontWeight: 600 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>{text}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.page}>
        {/* Categories */}
        <div style={{ padding: "56px 60px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", margin: 0 }}>Shop by Category</h2>
            <button style={{ color: "#3B82F6", fontSize: 14, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => setPage("browse")}>View All →</button>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {CATEGORIES.slice(1).map(cat => (
              <button key={cat} className="cat-chip" onClick={() => { setCategory(cat); setPage("browse"); }}
                style={{ background: "#EFF6FF", color: "#1D4ED8", border: "none", borderRadius: 100, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div style={{ padding: "0 60px 60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", margin: 0 }}>Featured Products</h2>
            <button style={{ color: "#3B82F6", fontSize: 14, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => setPage("browse")}>See All Products →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {PRODUCTS.slice(0, 6).map(p => (
              <div key={p.id} className="product-card" style={styles.card} onClick={() => { setSelectedProduct(p); setPage("product"); }}>
                <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, position: "relative" }}>
                  {p.img}
                  <div style={{ position: "absolute", top: 12, left: 12 }}><Badge text={p.badge} /></div>
                  <div style={{ position: "absolute", top: 12, right: 12, fontSize: 18, cursor: "pointer", color: wishlist.includes(p.id) ? "#EF4444" : "#D1D5DB" }}
                    onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}>
                    {wishlist.includes(p.id) ? "❤️" : "♡"}
                  </div>
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{p.category}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 6, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <Stars rating={p.rating} />
                    <span style={{ fontSize: 12, color: "#6B7280" }}>({p.reviews})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(p.price)}</span>
                    <span style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "line-through" }}>{formatCurrency(p.originalPrice)}</span>
                  </div>
                  <button style={{ ...styles.btn, width: "100%", padding: "10px", borderRadius: 8 }}
                    onClick={e => { e.stopPropagation(); addToCart(p); }}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div style={{ margin: "0 60px 60px", background: "linear-gradient(135deg, #1E3A8A, #1D4ED8)", borderRadius: 20, padding: "48px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: 60, fontSize: 120, opacity: 0.15 }}>💻</div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Limited Time Offer</div>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: "#fff", fontSize: 32, margin: "0 0 12px", fontWeight: 900 }}>Up to 30% Off Laptops</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24, fontSize: 16 }}>Premium computing at unbeatable prices. Ends Sunday.</p>
            <button style={{ ...styles.btn, background: "#fff", color: "#1D4ED8" }} onClick={() => { setCategory("Laptops"); setPage("browse"); }}>Shop Laptops</button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#0A0F1E", padding: "48px 60px 32px", color: "rgba(255,255,255,0.6)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 12 }}>⚡ Nex<span style={{ color: "#3B82F6" }}>Volt</span></div>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>Your trusted destination for premium computers & electronics. Cutting-edge technology, unbeatable value.</p>
            </div>
            {[
              ["Shop", ["Laptops", "Desktops", "Tablets", "Audio", "Cameras", "Gaming"]],
              ["Support", ["Track Order", "Returns", "Warranty", "Contact Us", "FAQ"]],
              ["Company", ["About", "Careers", "Press", "Privacy", "Terms"]],
            ].map(([title, links]) => (
              <div key={title}>
                <div style={{ color: "#fff", fontWeight: 700, marginBottom: 16, fontSize: 14 }}>{title}</div>
                {links.map(l => <div key={l} style={{ fontSize: 13, marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, textAlign: "center", fontSize: 13 }}>
            © 2026 NexVolt Electronics, Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );

  // ─── BROWSE PAGE ───
  if (page === "browse") return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <NavBar />
      <Notification />
      <style>{`.product-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.12) !important; } .btn-primary:hover { filter: brightness(1.1); }`}</style>
      <div style={{ ...styles.page, padding: "32px 60px" }}>
        <div style={{ display: "flex", gap: 28 }}>
          {/* Sidebar */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #E5E7EB", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 14 }}>Categories</div>
              {CATEGORIES.map(cat => (
                <div key={cat} onClick={() => setCategory(cat)}
                  style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: category === cat ? 700 : 400, color: category === cat ? "#1D4ED8" : "#374151", background: category === cat ? "#EFF6FF" : "transparent", marginBottom: 2, transition: "all 0.15s" }}>
                  {cat} <span style={{ float: "right", color: "#9CA3AF", fontSize: 12 }}>{cat === "All" ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 14 }}>Price Range</div>
              {[["Under $300", 0, 299], ["$300 – $800", 300, 799], ["$800 – $1,500", 800, 1499], ["$1,500+", 1500, 99999]].map(([label]) => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginBottom: 10, cursor: "pointer" }}>
                  <input type="checkbox" /> {label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#0A0F1E" }}>
                {category === "All" ? "All Products" : category}
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 400, color: "#6B7280", marginLeft: 10 }}>{filtered.length} items</span>
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, color: "#374151", outline: "none" }}>
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
              {filtered.map(p => (
                <div key={p.id} className="product-card" style={styles.card} onClick={() => { setSelectedProduct(p); setPage("product"); }}>
                  <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", height: 150, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 68, position: "relative" }}>
                    {p.img}
                    <div style={{ position: "absolute", top: 10, left: 10 }}><Badge text={p.badge} /></div>
                    <div style={{ position: "absolute", top: 10, right: 10, fontSize: 18, cursor: "pointer" }}
                      onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}>
                      {wishlist.includes(p.id) ? "❤️" : "♡"}
                    </div>
                  </div>
                  <div style={{ padding: "14px" }}>
                    <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{p.category}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 5, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
                      <Stars rating={p.rating} size={12} />
                      <span style={{ fontSize: 11, color: "#6B7280" }}>({p.reviews})</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 17, fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(p.price)}</span>
                        <br /><span style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "line-through" }}>{formatCurrency(p.originalPrice)}</span>
                      </div>
                      <button style={{ ...styles.btn, padding: "8px 14px", fontSize: 13, borderRadius: 8 }}
                        onClick={e => { e.stopPropagation(); addToCart(p); }}>+ Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── PRODUCT PAGE ───
  if (page === "product" && selectedProduct) {
    const p = selectedProduct;
    return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <Notification />
        <div style={{ ...styles.page, padding: "40px 60px" }}>
          <div style={{ color: "#6B7280", fontSize: 13, marginBottom: 24, cursor: "pointer" }} onClick={() => setPage("browse")}>← Back to Products</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
            <div>
              <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", borderRadius: 20, height: 380, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 140, marginBottom: 16, border: "1px solid #DBEAFE" }}>
                {p.img}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", borderRadius: 10, height: 72, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, border: "2px solid " + (i === 1 ? "#3B82F6" : "#E5E7EB"), cursor: "pointer" }}>
                    {p.img}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Badge text={p.badge} />
                <span style={{ fontSize: 13, color: "#6B7280" }}>{p.category}</span>
              </div>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 900, color: "#0A0F1E", margin: "0 0 12px", lineHeight: 1.2 }}>{p.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Stars rating={p.rating} size={18} />
                <span style={{ color: "#374151", fontWeight: 600 }}>{p.rating}</span>
                <span style={{ color: "#6B7280", fontSize: 14 }}>({p.reviews} reviews)</span>
              </div>
              <p style={{ color: "#4B5563", lineHeight: 1.7, marginBottom: 20 }}>{p.description}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 34, fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(p.price)}</span>
                <span style={{ fontSize: 20, color: "#9CA3AF", textDecoration: "line-through" }}>{formatCurrency(p.originalPrice)}</span>
              </div>
              <div style={{ color: "#10B981", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
                ✓ You save {formatCurrency(p.originalPrice - p.price)} ({Math.round((1-p.price/p.originalPrice)*100)}% off)
              </div>
              <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#10B981", fontWeight: 700 }}>✓ In Stock</span>
                <span style={{ color: "#6B7280", fontSize: 13 }}>— {p.stock} units remaining</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>Qty:</span>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #D1D5DB", borderRadius: 8, overflow: "hidden" }}>
                  <button style={{ border: "none", background: "#F9FAFB", padding: "8px 14px", cursor: "pointer", fontSize: 16, fontWeight: 700 }} onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span style={{ padding: "8px 16px", fontSize: 14, fontWeight: 700, borderLeft: "1px solid #D1D5DB", borderRight: "1px solid #D1D5DB" }}>{quantity}</span>
                  <button style={{ border: "none", background: "#F9FAFB", padding: "8px 14px", cursor: "pointer", fontSize: 16, fontWeight: 700 }} onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <button style={{ ...styles.btn, flex: 2 }} onClick={() => addToCart(p, quantity)}>Add to Cart</button>
                <button style={{ ...styles.btn, background: "#10B981", flex: 2 }} onClick={() => { addToCart(p, quantity); setCheckoutStep(0); setPage("checkout"); }}>Buy Now</button>
                <button style={{ ...styles.btnOutline, padding: "10px 16px" }} onClick={() => toggleWishlist(p.id)}>
                  {wishlist.includes(p.id) ? "❤️" : "♡"}
                </button>
              </div>

              <div style={{ background: "#F8FAFF", borderRadius: 12, padding: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 14 }}>Key Specifications</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {Object.entries(p.specs).map(([k, v]) => (
                    <div key={k} style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: "1px solid #E5E7EB" }}>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 2, textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#0A0F1E", marginBottom: 24 }}>Customer Reviews</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
              {REVIEWS.map((r, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, color: "#111827" }}>{r.user}</div>
                    {r.verified && <span style={{ fontSize: 11, color: "#10B981", fontWeight: 600, background: "#F0FDF4", padding: "2px 8px", borderRadius: 4 }}>✓ Verified</span>}
                  </div>
                  <Stars rating={r.rating} size={14} />
                  <p style={{ color: "#4B5563", fontSize: 14, lineHeight: 1.6, marginTop: 10, marginBottom: 8 }}>{r.text}</p>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{r.date}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Write a Review</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize: 28, cursor: "pointer", color: s <= review.rating ? "#F59E0B" : "#D1D5DB" }} onClick={() => setReview(r => ({ ...r, rating: s }))}>★</span>
                ))}
              </div>
              <textarea value={review.text} onChange={e => setReview(r => ({ ...r, text: e.target.value }))}
                placeholder="Share your experience with this product..."
                style={{ width: "100%", borderRadius: 10, border: "1px solid #D1D5DB", padding: "12px", fontSize: 14, outline: "none", resize: "vertical", minHeight: 100, boxSizing: "border-box" }} />
              <button style={{ ...styles.btn, marginTop: 12 }} onClick={() => { if (review.text) { notify("Review submitted! Thank you."); setReview({ rating: 5, text: "" }); } }}>Submit Review</button>
            </div>
          </div>

          {/* Related products */}
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#0A0F1E", marginBottom: 24 }}>You May Also Like</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {PRODUCTS.filter(pr => pr.id !== p.id).slice(0, 4).map(pr => (
                <div key={pr.id} style={{ ...styles.card, cursor: "pointer" }} onClick={() => { setSelectedProduct(pr); window.scrollTo(0,0); }}>
                  <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>{pr.img}</div>
                  <div style={{ padding: "12px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 4 }}>{pr.name}</div>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(pr.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── WISHLIST ───
  if (page === "wishlist") return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <NavBar />
      <Notification />
      <div style={{ ...styles.page, padding: "40px 60px" }}>
        <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 24 }}>Your Wishlist</h1>
        {wishlist.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>♡</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Your wishlist is empty</div>
            <button style={styles.btn} onClick={() => setPage("browse")}>Browse Products</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {PRODUCTS.filter(p => wishlist.includes(p.id)).map(p => (
              <div key={p.id} style={styles.card}>
                <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>{p.img}</div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontWeight: 700, color: "#111827", marginBottom: 8 }}>{p.name}</div>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(p.price)}</span>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button style={{ ...styles.btn, flex: 1, padding: "8px" }} onClick={() => addToCart(p)}>Add to Cart</button>
                    <button style={{ ...styles.btnOutline, padding: "8px 12px" }} onClick={() => toggleWishlist(p.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ─── CHECKOUT FLOW ───
  if (page === "checkout") {
    const StepIndicator = () => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40, gap: 0 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14,
              background: i < checkoutStep ? "#10B981" : i === checkoutStep ? "#3B82F6" : "#E5E7EB",
              color: i <= checkoutStep ? "#fff" : "#6B7280",
              transition: "all 0.3s"
            }}>{i < checkoutStep ? "✓" : i + 1}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: i === checkoutStep ? "#3B82F6" : "#9CA3AF", position: "absolute", marginTop: 52, marginLeft: -14, whiteSpace: "nowrap" }}>{s}</div>
            {i < STEPS.length - 1 && <div style={{ width: 60, height: 2, background: i < checkoutStep ? "#10B981" : "#E5E7EB", transition: "all 0.3s" }} />}
          </div>
        ))}
      </div>
    );

    // Cart step
    if (checkoutStep === 0) return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <Notification />
        <div style={{ ...styles.page, padding: "40px 60px" }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 32 }}>Shopping Cart</h1>
          <StepIndicator />
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Your cart is empty</div>
              <button style={styles.btn} onClick={() => setPage("browse")}>Start Shopping</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
              <div>
                {cart.map(item => (
                  <div key={item.id} style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #E5E7EB", marginBottom: 14, display: "flex", gap: 20, alignItems: "center" }}>
                    <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", borderRadius: 12, width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>{item.img}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 10 }}>{item.category}</div>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid #D1D5DB", borderRadius: 8, overflow: "hidden", width: "fit-content" }}>
                        <button style={{ border: "none", background: "#F9FAFB", padding: "6px 12px", cursor: "pointer", fontWeight: 700 }} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                        <span style={{ padding: "6px 14px", fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                        <button style={{ border: "none", background: "#F9FAFB", padding: "6px 12px", cursor: "pointer", fontWeight: 700 }} onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 18, color: "#1D4ED8", marginBottom: 8 }}>{formatCurrency(item.price * item.qty)}</div>
                      <button style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 13, fontWeight: 600 }} onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB", position: "sticky", top: 100 }}>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "#111827", marginBottom: 20 }}>Order Summary</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#374151" }}><span>Subtotal ({cartCount} items)</span><span>{formatCurrency(cartTotal)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#374151" }}><span>Shipping</span><span style={{ color: "#10B981", fontWeight: 600 }}>FREE</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#374151" }}><span>Tax (8%)</span><span>{formatCurrency(Math.round(cartTotal * 0.08))}</span></div>
                  <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 14, marginTop: 14, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, color: "#1D4ED8" }}>{formatCurrency(cartTotal + Math.round(cartTotal * 0.08))}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <input placeholder="Promo code" style={{ flex: 1, border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none" }} />
                    <button style={{ ...styles.btnOutline, padding: "10px 14px", fontSize: 13 }}>Apply</button>
                  </div>
                  <button style={{ ...styles.btn, width: "100%", marginTop: 16, padding: "14px" }} onClick={() => setCheckoutStep(1)}>Proceed to Checkout →</button>
                  <button style={{ ...styles.btnGhost, width: "100%", marginTop: 8, padding: "12px", color: "#374151", border: "1px solid #D1D5DB" }} onClick={() => setPage("browse")}>Continue Shopping</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    // Checkout info step
    if (checkoutStep === 1) return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <div style={{ ...styles.page, padding: "40px 60px" }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 32 }}>Checkout</h1>
          <StepIndicator />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Contact */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: "#111827" }}>Contact Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[["First Name", "text"], ["Last Name", "text"], ["Email", "email"], ["Phone", "tel"]].map(([label, type]) => (
                    <div key={label}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
                      <input type={type} placeholder={label} style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Shipping */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: "#111827" }}>Shipping Address</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Street Address</label>
                    <input placeholder="123 Main Street" style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    {[["City", "text"], ["State", "text"], ["ZIP Code", "text"]].map(([label, type]) => (
                      <div key={label}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
                        <input type={type} placeholder={label} style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Shipping method */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: "#111827" }}>Shipping Method</div>
                {[["Standard (5-7 days)", "FREE"], ["Express (2-3 days)", "$12.99"], ["Overnight (1 day)", "$29.99"]].map(([label, price]) => (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, border: "1px solid #E5E7EB", marginBottom: 10, cursor: "pointer", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="radio" name="shipping" defaultChecked={label.includes("Standard")} style={{ accentColor: "#3B82F6" }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: price === "FREE" ? "#10B981" : "#374151" }}>{price}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB", position: "sticky", top: 100 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "#111827" }}>Your Order</div>
                {cart.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                    <div style={{ fontSize: 28, width: 40, textAlign: "center" }}>{item.img}</div>
                    <div style={{ flex: 1, fontSize: 13, color: "#374151" }}>{item.name} <span style={{ color: "#9CA3AF" }}>×{item.qty}</span></div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{formatCurrency(item.price * item.qty)}</div>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 14, marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}>
                    <span>Total</span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", color: "#1D4ED8" }}>{formatCurrency(cartTotal + Math.round(cartTotal * 0.08))}</span>
                  </div>
                </div>
                <button style={{ ...styles.btn, width: "100%", marginTop: 20, padding: "14px" }} onClick={() => setCheckoutStep(2)}>Continue to Payment →</button>
                <button style={{ width: "100%", marginTop: 8, background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13 }} onClick={() => setCheckoutStep(0)}>← Back to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // Payment step
    if (checkoutStep === 2) return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <div style={{ ...styles.page, padding: "40px 60px" }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 32 }}>Payment</h1>
          <StepIndicator />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Payment Method</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {[["💳 Credit Card", true], ["🏦 Bank Transfer", false], ["📱 Digital Wallet", false]].map(([label, active]) => (
                    <button key={label} style={{ flex: 1, border: `2px solid ${active ? "#3B82F6" : "#E5E7EB"}`, borderRadius: 10, background: active ? "#EFF6FF" : "#fff", padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: active ? "#1D4ED8" : "#374151" }}>{label}</button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Card Number</label>
                    <input placeholder="1234 5678 9012 3456" style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none", boxSizing: "border-box", letterSpacing: 2 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Cardholder Name</label>
                    <input placeholder="John Doe" style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Expiry</label>
                      <input placeholder="MM/YY" style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>CVV</label>
                      <input placeholder="123" style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} type="password" maxLength={4} />
                    </div>
                  </div>
                </div>
                <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "12px 16px", marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🔒</span>
                  <span style={{ fontSize: 13, color: "#047857" }}>Your payment is encrypted with 256-bit SSL security</span>
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Billing Address</div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginBottom: 14 }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: "#3B82F6" }} />
                  <span style={{ color: "#374151", fontWeight: 500 }}>Same as shipping address</span>
                </label>
              </div>
            </div>
            <div>
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB", position: "sticky", top: 100 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Order Total</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6B7280", marginBottom: 8 }}><span>Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6B7280", marginBottom: 8 }}><span>Shipping</span><span style={{ color: "#10B981", fontWeight: 700 }}>FREE</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6B7280", marginBottom: 12 }}><span>Tax</span><span>{formatCurrency(Math.round(cartTotal * 0.08))}</span></div>
                <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 14, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", color: "#1D4ED8" }}>{formatCurrency(cartTotal + Math.round(cartTotal * 0.08))}</span>
                </div>
                <button style={{ ...styles.btn, width: "100%", marginTop: 20, padding: "14px", background: "linear-gradient(135deg, #10B981, #059669)", fontSize: 15 }}
                  onClick={() => setCheckoutStep(3)}>
                  🔒 Place Order
                </button>
                <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 12 }}>By placing your order you agree to our Terms & Privacy Policy</p>
                <button style={{ width: "100%", marginTop: 4, background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13 }} onClick={() => setCheckoutStep(1)}>← Back</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // Order Confirmation
    if (checkoutStep === 3) return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <div style={{ ...styles.page, padding: "40px 60px", textAlign: "center" }}>
          <StepIndicator />
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 32, fontWeight: 900, color: "#10B981", marginBottom: 12 }}>Order Confirmed!</h1>
            <p style={{ color: "#4B5563", fontSize: 16, marginBottom: 8 }}>Thank you for your purchase! Your order has been successfully placed.</p>
            <div style={{ background: "#F0FDF4", borderRadius: 12, padding: "16px 24px", marginBottom: 28, display: "inline-block" }}>
              <span style={{ fontSize: 14, color: "#047857" }}>Order #: </span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, color: "#065F46", fontSize: 18 }}>{orderNum}</span>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "28px", border: "1px solid #E5E7EB", marginBottom: 24, textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Order Summary</div>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ fontSize: 36 }}>{item.img}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#111827" }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: "#6B7280" }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(item.price * item.qty)}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18, paddingTop: 8 }}>
                <span>Total Paid</span>
                <span style={{ fontFamily: "'Orbitron', sans-serif", color: "#1D4ED8" }}>{formatCurrency(cartTotal + Math.round(cartTotal * 0.08))}</span>
              </div>
            </div>
            <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "16px 24px", marginBottom: 24, textAlign: "left" }}>
              <div style={{ fontSize: 14, color: "#1D4ED8", fontWeight: 600, marginBottom: 4 }}>📧 Confirmation email sent to your inbox</div>
              <div style={{ fontSize: 13, color: "#3B82F6" }}>Estimated delivery: 5-7 business days</div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button style={styles.btn} onClick={() => setCheckoutStep(4)}>Track Order 📦</button>
              <button style={styles.btnOutline} onClick={() => { setPage("browse"); }}>Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    );

    // Order Tracking
    if (checkoutStep === 4) return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <div style={{ ...styles.page, padding: "40px 60px" }}>
          <StepIndicator />
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 8 }}>Track Your Order</h1>
            <div style={{ color: "#6B7280", marginBottom: 28 }}>Order #{orderNum}</div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "28px", border: "1px solid #E5E7EB", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Shipment Status</div>
                <div style={{ background: "#FEF3C7", color: "#92400E", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>🚚 In Transit</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: 32 }}>
                <div style={{ position: "absolute", top: 14, left: "8%", right: "8%", height: 4, background: "#E5E7EB", borderRadius: 2 }}>
                  <div style={{ width: "55%", height: "100%", background: "linear-gradient(90deg, #10B981, #3B82F6)", borderRadius: 2 }} />
                </div>
                {[["✓", "Order Placed", "May 12", true], ["✓", "Processed", "May 12", true], ["🚚", "In Transit", "May 13", true], ["📦", "Out for Delivery", "May 16", false], ["🏠", "Delivered", "Est. May 16", false]].map(([icon, label, date, done]) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? "#3B82F6" : "#E5E7EB", color: done ? "#fff" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: done ? "#111827" : "#9CA3AF", textAlign: "center" }}>{label}</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Tracking Events</div>
              {[
                ["🟢", "Package picked up by courier", "NexVolt Fulfillment Center, CA", "May 12, 2:14 PM"],
                ["🔵", "Package in transit", "Distribution Hub, Phoenix AZ", "May 13, 8:30 AM"],
                ["🟡", "Package arriving soon", "Local Delivery Facility", "Est. May 16, Morning"],
              ].map(([dot, event, location, time]) => (
                <div key={event} style={{ display: "flex", gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ fontSize: 16, marginTop: 2 }}>{dot}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>{event}</div>
                    <div style={{ fontSize: 13, color: "#6B7280" }}>{location}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>{time}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button style={styles.btn} onClick={() => setCheckoutStep(5)}>Simulate Delivery ✓</button>
              <button style={styles.btnOutline} onClick={() => setPage("browse")}>Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    );

    // Delivery & After-sales
    if (checkoutStep === 5) return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <div style={{ ...styles.page, padding: "40px 60px" }}>
          <StepIndicator />
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 72, marginBottom: 12 }}>📦</div>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 900, color: "#10B981", marginBottom: 8 }}>Delivered!</h1>
              <p style={{ color: "#4B5563" }}>Your order #{orderNum} was delivered on May 16, 2026 at 2:47 PM</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              {[
                ["↩️", "Return & Refund", "30-day return policy", "Return Item"],
                ["🔄", "Exchange", "Swap for another item", "Exchange"],
                ["🛡️", "Warranty Claim", "2-year coverage", "Claim Warranty"],
                ["⭐", "Rate Product", "Share your experience", "Write Review"],
              ].map(([icon, title, sub, btn]) => (
                <div key={title} style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #E5E7EB" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>{sub}</div>
                  <button style={{ ...styles.btnOutline, padding: "8px 16px", fontSize: 13, width: "100%" }}
                    onClick={() => { if (title === "Return & Refund") document.getElementById("return-section").scrollIntoView({ behavior: "smooth" }); }}>
                    {btn}
                  </button>
                </div>
              ))}
            </div>

            <div id="return-section" style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Request a Return</div>
              {returnSubmitted ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontWeight: 700, color: "#10B981", fontSize: 16 }}>Return request submitted!</div>
                  <div style={{ color: "#6B7280", fontSize: 14, marginTop: 8 }}>We'll send a prepaid return label within 24 hours.</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Reason for return</label>
                    <select value={returnReason} onChange={e => setReturnReason(e.target.value)}
                      style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }}>
                      <option value="">Select a reason...</option>
                      <option>Defective or damaged</option>
                      <option>Wrong item received</option>
                      <option>Changed my mind</option>
                      <option>Product not as described</option>
                      <option>Found better price</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Additional details</label>
                    <textarea placeholder="Please describe the issue..." style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box" }} />
                  </div>
                  <button style={{ ...styles.btn, background: "#EF4444" }}
                    onClick={() => { if (returnReason) setReturnSubmitted(true); else notify("Please select a return reason", "error"); }}>
                    Submit Return Request
                  </button>
                </>
              )}
            </div>

            <div style={{ background: "#F8FAFF", borderRadius: 16, padding: "24px", border: "1px solid #DBEAFE" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#1D4ED8" }}>Need Help?</div>
              <div style={{ display: "flex", gap: 12 }}>
                {[["💬 Live Chat", "Chat with an agent"], ["📞 Call Us", "1-800-NEXVOLT"], ["📧 Email", "support@nexvolt.com"]].map(([label, sub]) => (
                  <div key={label} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "14px", border: "1px solid #DBEAFE", textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: "#1D4ED8", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button style={styles.btn} onClick={() => { setCart([]); setPage("landing"); setCheckoutStep(0); }}>Back to Home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
