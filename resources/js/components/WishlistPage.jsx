// ─── WISHLIST PAGE ──────────────────────────────────────────────────────────

import { PRODUCTS, formatCurrency } from "@/assets/constants";
import { styles } from "@/assets/styles";
import { NavBar, Notification } from "@/components/SharedUI";

export default function WishlistPage({
  cart, wishlist,
  onAddToCart, onToggleWishlist,
  onNavigate,
  search, onSearchChange,
  notification,
}) {
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

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
        <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 24 }}>
          Your Wishlist
        </h1>

        {wishlistedProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>♡</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Your wishlist is empty</div>
            <button style={styles.btn} onClick={() => onNavigate("browse")}>Browse Products</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {wishlistedProducts.map((p) => (
              <div key={p.id} style={styles.card}>
                <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
                  {p.img}
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontWeight: 700, color: "#111827", marginBottom: 8 }}>{p.name}</div>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 900, color: "#1D4ED8" }}>
                    {formatCurrency(p.price)}
                  </span>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button style={{ ...styles.btn, flex: 1, padding: "8px" }} onClick={() => onAddToCart(p)}>Add to Cart</button>
                    <button style={{ ...styles.btnOutline, padding: "8px 12px" }} onClick={() => onToggleWishlist(p.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
