import { useState } from "react";
import { PRODUCTS, CATEGORIES, formatCurrency } from "@/assets/constants";
import { styles } from "@/assets/styles";
import { Stars, Badge, NavBar, Notification } from "@/components/SharedUI";

export default function BrowsePage({
  cart, wishlist,
  onAddToCart, onToggleWishlist,
  onNavigate, onSelectProduct,
  category, onSetCategory,
  search, onSearchChange,
  notification,
}) {
  const [sort, setSort] = useState("featured");

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <NavBar
        search={search}
        onSearchChange={(e) => onSearchChange(e.target.value)}
        onLogoClick={() => onNavigate("landing")}
        onShopClick={() => onNavigate("browse")}
        onWishlistClick={() => onNavigate("wishlist")}
        onCartClick={() => onNavigate("checkout")}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
      />
      <Notification notification={notification} />
      <style>{`.product-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.12) !important; }`}</style>

      <div style={{ ...styles.page, padding: "32px 60px" }}>
        <div style={{ display: "flex", gap: 28 }}>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #E5E7EB", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 14 }}>Categories</div>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  onClick={() => onSetCategory(cat)}
                  style={{
                    padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 14,
                    fontWeight: category === cat ? 700 : 400,
                    color: category === cat ? "#1D4ED8" : "#374151",
                    background: category === cat ? "#EFF6FF" : "transparent",
                    marginBottom: 2, transition: "all 0.15s",
                  }}
                >
                  {cat}
                  <span style={{ float: "right", color: "#9CA3AF", fontSize: 12 }}>
                    {cat === "All" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === cat).length}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 14 }}>Price Range</div>
              {[["Under $300"], ["$300 – $800"], ["$800 – $1,500"], ["$1,500+"]].map(([label]) => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginBottom: 10, cursor: "pointer" }}>
                  <input type="checkbox" /> {label}
                </label>
              ))}
            </div>
          </div>

          {/* ── Product Grid ─────────────────────────────────────────────── */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#0A0F1E" }}>
                {category === "All" ? "All Products" : category}
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 400, color: "#6B7280", marginLeft: 10 }}>
                  {filtered.length} items
                </span>
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, color: "#374151", outline: "none" }}
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="product-card"
                  style={styles.card}
                  onClick={() => { onSelectProduct(p); onNavigate("product"); }}
                >
                  <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", height: 150, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 68, position: "relative" }}>
                    {p.img}
                    <div style={{ position: "absolute", top: 10, left: 10 }}><Badge text={p.badge} /></div>
                    <div
                      style={{ position: "absolute", top: 10, right: 10, fontSize: 18, cursor: "pointer" }}
                      onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }}
                    >
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
                        <br />
                        <span style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "line-through" }}>{formatCurrency(p.originalPrice)}</span>
                      </div>
                      <button
                        style={{ ...styles.btn, padding: "8px 14px", fontSize: 13, borderRadius: 8 }}
                        onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                      >
                        + Cart
                      </button>
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
}
