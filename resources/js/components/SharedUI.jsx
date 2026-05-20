// ─── SHARED UI PRIMITIVES ───────────────────────────────────────────────────
// Stars, Badge, Notification, NavBar
// These are stateless (or near-stateless) pieces used across multiple pages.

import { styles } from "@/assets/styles";
import { formatCurrency } from "@/assets/constants";

// ── Stars ──────────────────────────────────────────────────────────────────
export const Stars = ({ rating, size = 14 }) => (
  <span style={{ fontSize: size, letterSpacing: -1 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB" }}>★</span>
    ))}
  </span>
);

// ── Badge ──────────────────────────────────────────────────────────────────
export const Badge = ({ text }) => {
  const colors = { "Best Seller": "#3B82F6", New: "#10B981", Sale: "#EF4444", Limited: "#8B5CF6" };
  return (
    <span style={{
      background: colors[text] || "#6B7280", color: "#fff", fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5,
    }}>
      {text}
    </span>
  );
};

// ── Notification toast ─────────────────────────────────────────────────────
export const Notification = ({ notification }) =>
  notification ? (
    <div style={{
      position: "fixed", top: 80, right: 24, zIndex: 999,
      background: notification.type === "success" ? "#10B981" : "#EF4444",
      color: "#fff", padding: "12px 20px", borderRadius: 12,
      fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)", animation: "slideIn 0.3s ease",
    }}>
      ✓ {notification.msg}
    </div>
  ) : null;

export const NavBar = ({
  search,
  onSearchChange,
  onLogoClick,
  onShopClick,
  onWishlistClick,
  onCartClick,
  cartCount,
  wishlistCount,
}) => (
  <nav style={styles.nav}>
    <link
      href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <div style={styles.logo} onClick={onLogoClick}>
      <span style={{ fontSize: 28 }}>💻</span>
      <span><span style={{color:"#f75b5b"}}>E-Commerce</span> <span style={styles.logoAccent}>NexVolt</span></span>
    </div>
    <div style={styles.searchBar}>
      <span style={{ padding: "0 8px 0 12px", color: "rgba(255,255,255,0.4)", fontSize: 16 }}>🔍</span>
      <input
        style={styles.searchInput}
        placeholder="Search products..."
        value={search}
        onChange={onSearchChange}
      />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button style={styles.navLink} onClick={onShopClick}>Shop</button>
      <button style={styles.navLink} onClick={onWishlistClick}>
        ♡ {wishlistCount > 0 && `(${wishlistCount})`}
      </button>
      <button
        style={{ ...styles.btn, padding: "8px 18px", position: "relative" }}
        onClick={onCartClick}
      >
        🛒{" "}
        {cartCount > 0 && (
          <span style={{
            background: "#EF4444", borderRadius: "50%", width: 18, height: 18,
            fontSize: 11, display: "inline-flex", alignItems: "center",
            justifyContent: "center", fontWeight: 700, marginLeft: 4,
          }}>
            {cartCount}
          </span>
        )}
      </button>
    </div>
  </nav>
);

// ── ProductCard ────────────────────────────────────────────────────────────
// Reusable card used on Landing, Browse, and Related products sections.
// size: "lg" (landing, 160px image) | "sm" (browse/related, 150px image)
export const ProductCard = ({
  product,
  wishlisted,
  onToggleWishlist,
  onAddToCart,
  onClick,
  size = "lg",
}) => {
  const imgHeight = size === "lg" ? 160 : 150;
  const fontSize = size === "lg" ? 72 : 68;
  const priceSize = size === "lg" ? 20 : 17;

  return (
    <div
      className="product-card"
      style={styles.card}
      onClick={onClick}
    >
      <div style={{
        background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)",
        height: imgHeight, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize, position: "relative",
      }}>
        {product.img}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <Badge text={product.badge} />
        </div>
        <div
          style={{ position: "absolute", top: 12, right: 12, fontSize: 18, cursor: "pointer", color: wishlisted ? "#EF4444" : "#D1D5DB" }}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
        >
          {wishlisted ? "❤️" : "♡"}
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
          {product.category}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 6, lineHeight: 1.3 }}>
          {product.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Stars rating={product.rating} />
          <span style={{ fontSize: 12, color: "#6B7280" }}>({product.reviews})</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: priceSize, fontWeight: 900, color: "#1D4ED8" }}>
            {formatCurrency(product.price)}
          </span>
          <span style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "line-through" }}>
            {formatCurrency(product.originalPrice)}
          </span>
        </div>
        <button
          style={{ ...styles.btn, width: "100%", padding: "10px", borderRadius: 8 }}
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// ── StepIndicator (checkout progress bar) ─────────────────────────────────
export const StepIndicator = ({ steps, currentStep }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40, gap: 0 }}>
    {steps.map((s, i) => (
      <div key={s} style={{ display: "flex", alignItems: "center" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", display: "flex",
          alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14,
          background: i < currentStep ? "#10B981" : i === currentStep ? "#3B82F6" : "#E5E7EB",
          color: i <= currentStep ? "#fff" : "#6B7280", transition: "all 0.3s",
        }}>
          {i < currentStep ? "✓" : i + 1}
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: i === currentStep ? "#3B82F6" : "#9CA3AF",
          position: "absolute", marginTop: 52, marginLeft: -14, whiteSpace: "nowrap",
        }}>
          {s}
        </div>
        {i < steps.length - 1 && (
          <div style={{
            width: 60, height: 2,
            background: i < currentStep ? "#10B981" : "#E5E7EB",
            transition: "all 0.3s",
          }} />
        )}
      </div>
    ))}
  </div>
);
