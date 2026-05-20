// ─── PRODUCT PAGE ───────────────────────────────────────────────────────────

import { useState } from "react";
import { PRODUCTS, REVIEWS, formatCurrency } from "@/assets/constants";
import { styles } from "@/assets/styles";
import { Stars, Badge, NavBar, Notification } from "@/components/SharedUI";

export default function ProductPage({
  product,
  cart, wishlist,
  onAddToCart, onToggleWishlist,
  onNavigate, onSelectProduct,
  onNotify,
  search, onSearchChange,
  notification,
}) {
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, text: "" });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const p = product;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
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

      <div style={{ ...styles.page, padding: "40px 60px" }}>
        <div style={{ color: "#6B7280", fontSize: 13, marginBottom: 24, cursor: "pointer" }} onClick={() => onNavigate("browse")}>
          ← Back to Products
        </div>

        {/* ── Main product detail ──────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>

          {/* Image column */}
          <div>
            <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", borderRadius: 20, height: 380, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 140, marginBottom: 16, border: "1px solid #DBEAFE" }}>
              {p.img}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", borderRadius: 10, height: 72, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, border: "2px solid " + (i === 1 ? "#3B82F6" : "#E5E7EB"), cursor: "pointer" }}>
                  {p.img}
                </div>
              ))}
            </div>
          </div>

          {/* Info column */}
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Badge text={p.badge} />
              <span style={{ fontSize: 13, color: "#6B7280" }}>{p.category}</span>
            </div>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 900, color: "#0A0F1E", margin: "0 0 12px", lineHeight: 1.2 }}>
              {p.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Stars rating={p.rating} size={18} />
              <span style={{ color: "#374151", fontWeight: 600 }}>{p.rating}</span>
              <span style={{ color: "#6B7280", fontSize: 14 }}>({p.reviews} reviews)</span>
            </div>
            <p style={{ color: "#4B5563", lineHeight: 1.7, marginBottom: 20 }}>{p.description}</p>

            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 34, fontWeight: 900, color: "#1D4ED8" }}>
                {formatCurrency(p.price)}
              </span>
              <span style={{ fontSize: 20, color: "#9CA3AF", textDecoration: "line-through" }}>
                {formatCurrency(p.originalPrice)}
              </span>
            </div>
            <div style={{ color: "#10B981", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
              ✓ You save {formatCurrency(p.originalPrice - p.price)} ({Math.round((1 - p.price / p.originalPrice) * 100)}% off)
            </div>

            <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#10B981", fontWeight: 700 }}>✓ In Stock</span>
              <span style={{ color: "#6B7280", fontSize: 13 }}>— {p.stock} units remaining</span>
            </div>

            {/* Quantity selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>Qty:</span>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #D1D5DB", borderRadius: 8, overflow: "hidden" }}>
                <button style={{ border: "none", background: "#F9FAFB", padding: "8px 14px", cursor: "pointer", fontSize: 16, fontWeight: 700 }} onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span style={{ padding: "8px 16px", fontSize: 14, fontWeight: 700, borderLeft: "1px solid #D1D5DB", borderRight: "1px solid #D1D5DB" }}>{quantity}</span>
                <button style={{ border: "none", background: "#F9FAFB", padding: "8px 14px", cursor: "pointer", fontSize: 16, fontWeight: 700 }} onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button style={{ ...styles.btn, flex: 2 }} onClick={() => onAddToCart(p, quantity)}>Add to Cart</button>
              <button style={{ ...styles.btn, background: "#10B981", flex: 2 }} onClick={() => { onAddToCart(p, quantity); onNavigate("checkout"); }}>Buy Now</button>
              <button style={{ ...styles.btnOutline, padding: "10px 16px" }} onClick={() => onToggleWishlist(p.id)}>
                {wishlist.includes(p.id) ? "❤️" : "♡"}
              </button>
            </div>

            {/* Specs */}
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

        {/* ── Reviews ────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#0A0F1E", marginBottom: 24 }}>
            Customer Reviews
          </h2>
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

          {/* Write a review */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #E5E7EB" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Write a Review</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} style={{ fontSize: 28, cursor: "pointer", color: s <= review.rating ? "#F59E0B" : "#D1D5DB" }} onClick={() => setReview((r) => ({ ...r, rating: s }))}>★</span>
              ))}
            </div>
            <textarea
              value={review.text}
              onChange={(e) => setReview((r) => ({ ...r, text: e.target.value }))}
              placeholder="Share your experience with this product..."
              style={{ width: "100%", borderRadius: 10, border: "1px solid #D1D5DB", padding: "12px", fontSize: 14, outline: "none", resize: "vertical", minHeight: 100, boxSizing: "border-box" }}
            />
            <button
              style={{ ...styles.btn, marginTop: 12 }}
              onClick={() => { if (review.text) { onNotify("Review submitted! Thank you."); setReview({ rating: 5, text: "" }); } }}
            >
              Submit Review
            </button>
          </div>
        </div>

        {/* ── Related products ───────────────────────────────────────────── */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#0A0F1E", marginBottom: 24 }}>
            You May Also Like
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {PRODUCTS.filter((pr) => pr.id !== p.id).slice(0, 4).map((pr) => (
              <div key={pr.id} style={{ ...styles.card, cursor: "pointer" }} onClick={() => { onSelectProduct(pr); window.scrollTo(0, 0); }}>
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
