// ─── LANDING PAGE ───────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { PRODUCTS, CATEGORIES, formatCurrency } from "@/assets/constants";
import { Badge, Stars, NavBar, Notification, ProductCard } from "@/components/SharedUI";

export default function LandingPage({
  cart, wishlist,
  onAddToCart, onToggleWishlist,
  onNavigate, onSelectProduct,
  onSetCategory,
  search, onSearchChange,
  notification,
}) {
  const [heroIndex, setHeroIndex] = useState(0);
  const heroProducts = [PRODUCTS[0], PRODUCTS[1], PRODUCTS[4]];
  const heroProduct = heroProducts[heroIndex];

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex((h) => (h + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <NavBar
        search={search}
        onSearchChange={(e) => { onSearchChange(e.target.value); onNavigate("browse"); }}
        onLogoClick={() => onNavigate("landing")}
        onShopClick={() => onNavigate("browse")}
        onWishlistClick={() => onNavigate("wishlist")}
        onCartClick={() => onNavigate("checkout")}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
      />
      <Notification notification={notification} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="hero-section">
        <div className="hero-section-1" />
        <div className="hero-section-img">
          {heroProduct.img}
        </div>
        <div className="relative z-[2] max-w-[560px]">
          <div className="flex gap-[8px] mb-[16]">
            <Badge text={heroProduct.badge} />
            <span className="text-[13px] text-[#ffffff80]">{heroProduct.category}</span>
          </div>
          <h1 className="text-[42px] font-[900] text-[#fff] leading-(1.15)"
          style={{ 
            fontFamily: "'Orbitron', sans-serif",
            margin: "0 0 16px"
            }}>
            {heroProduct.name}
          </h1>
          <p 
            className="text-[#ffffffa6] font-[17px] mb-[28px] leading-(1.7)"
          >
            {heroProduct.description}
          </p>
          <div class="flex items-baseline gap-[12px] mb-[32px]">
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 36, fontWeight: 900, color: "#3B82F6" }}>
              {formatCurrency(heroProduct.price)}
            </span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 20, textDecoration: "line-through" }}>
              {formatCurrency(heroProduct.originalPrice)}
            </span>
            <span style={{ background: "#EF4444", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
              SAVE P {heroProduct.originalPrice - heroProduct.price}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-primary btn" onClick={() => onAddToCart(heroProduct)}>
              Add to Cart
            </button>
            <button className="btn-ghost" onClick={() => { onSelectProduct(heroProduct); onNavigate("product"); }}>
              View Details
            </button>
          </div>
        </div>
        {/* Hero dots */}
        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
          {heroProducts.map((_, i) => (
            <div
              key={i}
              onClick={() => setHeroIndex(i)}
              style={{ width: i === heroIndex ? 24 : 8, height: 8, borderRadius: 4, background: i === heroIndex ? "#3B82F6" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.3s" }}
            />
          ))}
        </div>
      </div>

      {/* ── Trust bar ────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "14px 60px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
          {[["🚚", "Free Shipping $50+"], ["🔒", "Secure Checkout"], ["↩️", "30-Day Returns"], ["📞", "24/7 Support"], ["🏆", "Certified Products"]].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, color: "#374151", fontSize: 13, fontWeight: 600 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>{text}
            </div>
          ))}
        </div>
      </div>

      <div className="page">
        {/* ── Shop by Category ─────────────────────────────────────────── */}
        <div style={{ padding: "56px 60px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", margin: 0 }}>
              Shop by Category
            </h2>
            <button style={{ color: "#3B82F6", fontSize: 14, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => onNavigate("browse")}>
              View All →
            </button>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {CATEGORIES.slice(1).map((cat) => (
              <button
                key={cat}
                className="cat-chip"
                onClick={() => { onSetCategory(cat); onNavigate("browse"); }}
                style={{ background: "#EFF6FF", color: "#1D4ED8", border: "none", borderRadius: 100, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Featured Products ─────────────────────────────────────────── */}
        <div style={{ padding: "0 60px 60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", margin: 0 }}>
              Featured Products
            </h2>
            <button style={{ color: "#3B82F6", fontSize: 14, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => onNavigate("browse")}>
              See All Products →
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {PRODUCTS.slice(0, 6).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                wishlisted={wishlist.includes(p.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onClick={() => { onSelectProduct(p); onNavigate("product"); }}
              />
            ))}
          </div>
        </div>

        {/* ── Promo Banner ──────────────────────────────────────────────── */}
        <div style={{ margin: "0 60px 60px", background: "linear-gradient(135deg, #1E3A8A, #1D4ED8)", borderRadius: 20, padding: "48px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: 60, fontSize: 120, opacity: 0.15 }}>💻</div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              Limited Time Offer
            </div>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: "#fff", fontSize: 32, margin: "0 0 12px", fontWeight: 900 }}>
              Up to 30% Off Laptops
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24, fontSize: 16 }}>
              Premium computing at unbeatable prices. Ends Sunday.
            </p>
            <button
              className="btn"
              style={{ background: "#fff", color: "#1D4ED8" }}
              onClick={() => { onSetCategory("Laptops"); onNavigate("browse"); }}
            >
              Shop Laptops
            </button>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div style={{ background: "#0A0F1E", padding: "48px 60px 32px", color: "rgba(255,255,255,0.6)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 12 }}>
                ⚡ Nex<span style={{ color: "#3B82F6" }}>Volt</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>
                Your trusted destination for premium computers & electronics. Cutting-edge technology, unbeatable value.
              </p>
            </div>
            {[
              ["Shop", ["Laptops", "Desktops", "Tablets", "Audio", "Cameras", "Gaming"]],
              ["Support", ["Track Order", "Returns", "Warranty", "Contact Us", "FAQ"]],
              ["Company", ["About", "Careers", "Press", "Privacy", "Terms"]],
            ].map(([title, links]) => (
              <div key={title}>
                <div style={{ color: "#fff", fontWeight: 700, marginBottom: 16, fontSize: 14 }}>{title}</div>
                {links.map((l) => <div key={l} style={{ fontSize: 13, marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
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
}
