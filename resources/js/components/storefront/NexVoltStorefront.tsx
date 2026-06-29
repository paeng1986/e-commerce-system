import { router, useForm, usePage } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import type * as React from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type ListingKind = "product" | "pc_build";

interface Product {
  id: number;
  listingId?: number;
  productId?: number | null;
  kind: ListingKind;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  stock: number;
  badge: string;
  img: string;
  specs: Record<string, string>;
  description: string;
}

interface ServerProduct {
  id?: number | null;
  sku?: string | null;
  name?: string | null;
  brand?: string | null;
  specs?: string | null;
  stock?: number | null;
  category?: string | null;
}

export interface ServerListing {
  id: number;
  kind?: ListingKind | null;
  source_id?: number | null;
  title?: string | null;
  selling_price?: number | string | null;
  sale_price?: number | string | null;
  description?: string | null;
  is_published?: boolean | null;
  featured_image?: string[] | string | null;
  seo_slug?: string | null;
  product?: ServerProduct | null;
}

interface CartItem extends Product {
  qty: number;
}

interface Review {
  user: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

interface NotificationState {
  msg: string;
  type: "success" | "error";
}

interface CompletedOrder {
  id: number;
  number: string;
  status: string;
  subtotal: number;
  total: number;
  items_count: number;
  payment_reference?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  address?: string;
  contactNo?: string;
  joinDate: string;
  orders: string[];
}

interface ServerUser {
  id: number;
  email: string;
  role: string;
  created_at: string;
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
    address?: string | null;
    contact_no?: string | null;
  } | null;
}

interface ServerOrder {
  id: number;
  order_code: string;
  status: string;
  total: number;
  no_of_items: number;
  date: string | null;
  items: { name: string; quantity: number; price: number }[];
}

interface ServerNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  order_id?: number | null;
  read_at?: string | null;
  created_label?: string | null;
}

export type StorefrontPage = "landing" | "browse" | "product" | "wishlist" | "checkout" | "login" | "register" | "portal";
type PaymentMethod = "cod" | "gcash" | "bank_transfer";

// ─── DATA ────────────────────────────────────────────────────────────────────

const STEPS: string[] = ["Cart", "Checkout", "Payment", "Confirmation"];
const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string; detail: string }[] = [
  { value: "cod", label: "COD", detail: "Pay in cash when your order is delivered." },
  { value: "gcash", label: "Manual GCash", detail: "Send payment manually after order confirmation." },
  { value: "bank_transfer", label: "Manual bank transfer", detail: "Transfer to the bank account details provided after checkout." },
];

const toCustomerUser = (serverUser?: ServerUser | null): User | null => {
  if (!serverUser || serverUser.role !== "customer") {
    return null;
  }

  const firstName = serverUser.profile?.first_name || serverUser.email.split("@")[0] || "Customer";
  const lastName = serverUser.profile?.last_name || "Customer";

  return {
    id: String(serverUser.id),
    firstName,
    lastName,
    email: serverUser.email,
    address: serverUser.profile?.address || "",
    contactNo: serverUser.profile?.contact_no || "",
    joinDate: new Date(serverUser.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    orders: [],
  };
};

// ─── UTILITIES ───────────────────────────────────────────────────────────────

const formatCurrency = (n: number): string => `P ${n.toLocaleString()}`;

const orderStatusStyle = (status: string): { background: string; color: string } => {
  switch (status.toLowerCase()) {
    case "delivered":
    case "ready":
      return { background: "#DCFCE7", color: "#15803D" };
    case "cancelled":
      return { background: "#FEE2E2", color: "#B91C1C" };
    case "assembling":
    case "processing":
      return { background: "#DBEAFE", color: "#1D4ED8" };
    default: // pending and anything else
      return { background: "#FEF3C7", color: "#92400E" };
  }
};

const parseAmount = (value: number | string | null | undefined): number => {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) ? amount : 0;
};

const firstImage = (images: ServerListing["featured_image"]): string => {
  if (Array.isArray(images)) {
    return normalizeImagePath(images.find(Boolean) ?? "💻");
  }

  if (typeof images === "string" && images.trim()) {
    try {
      const parsed = JSON.parse(images);

      if (Array.isArray(parsed)) {
        return normalizeImagePath(parsed.find(Boolean) ?? "💻");
      }
    } catch {
      return normalizeImagePath(images);
    }

    return normalizeImagePath(images);
  }

  return "💻";
};

const normalizeImagePath = (src: string): string => {
  if (/^(https?:\/\/|\/|data:image\/)/.test(src)) {
    return src;
  }

  if (/^(images|storage)\//.test(src)) {
    return `/${src}`;
  }

  return src;
};

const parseSpecs = (specs?: string | null): Record<string, string> => {
  if (!specs) {
    return {};
  }

  try {
    const parsed = JSON.parse(specs);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [key, String(value)]),
      );
    }
  } catch {
    return { Specs: specs };
  }

  return { Specs: specs };
};

const listingToProduct = (listing: ServerListing): Product => {
  const kind: ListingKind = listing.kind === "pc_build" ? "pc_build" : "product";
  const sellingPrice = parseAmount(listing.selling_price);
  const salePrice = parseAmount(listing.sale_price);
  const onSale = salePrice > 0 && salePrice < sellingPrice;
  const activePrice = onSale ? salePrice : sellingPrice;
  const originalPrice = onSale ? sellingPrice : activePrice;

  const badge = kind === "pc_build" ? "PC Build" : onSale ? "Sale" : "Listed";

  return {
    id: listing.id,
    listingId: listing.source_id ?? listing.id,
    productId: listing.product?.id ?? null,
    kind,
    name: listing.title || listing.product?.name || "Untitled product",
    category: kind === "pc_build" ? "PC Builds" : listing.product?.category || listing.product?.brand || "Products",
    price: activePrice,
    originalPrice,
    rating: 0,
    reviews: 0,
    stock: Number(listing.product?.stock ?? 0),
    badge,
    img: kind === "pc_build" ? "🖥️" : firstImage(listing.featured_image),
    specs: parseSpecs(listing.product?.specs),
    description: listing.description || listing.product?.name || "No description available.",
  };
};

const ProductVisual: React.FC<{ src: string; size: number | string }> = ({ src, size }) => {
  const imageSrc = normalizeImagePath(src);
  const isImage = /^(https?:\/\/|\/|data:image\/)/.test(imageSrc);

  if (isImage) {
    return (
      <img
        src={imageSrc}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }

  return <span style={{ fontSize: size }}>{imageSrc}</span>;
};

const csrfToken = (): string => {
  if (typeof document === "undefined") {
    return "";
  }

  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? "";
};

// ─── PERSISTENCE (cart + wishlist survive navigation/refresh) ─────────────────

const STORAGE_KEYS = { cart: "nexvolt:cart", wishlist: "nexvolt:wishlist" } as const;

const loadStored = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const saveStored = (key: string, value: unknown): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — ignore */
  }
};

const STYLES = {
  nav: {
    position: "sticky" as const, top: 0, zIndex: 100,
    background: "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 100%)",
    borderBottom: "1px solid rgba(59,130,246,0.2)",
    padding: "0 24px", display: "flex", alignItems: "center",
    justifyContent: "space-between", height: 64, gap: 16,
  },
  logo: { fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", cursor: "pointer", letterSpacing: 1, display: "flex", alignItems: "center", gap: 8 },
  logoAccent: { color: "#3B82F6" },
  navLink: { color: "rgba(255,255,255,0.7)", fontSize: 14, cursor: "pointer", padding: "4px 12px", borderRadius: 6, transition: "all 0.2s", fontWeight: 500, background: "none", border: "none" },
  searchBar: { flex: 1, maxWidth: 400, display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden" },
  searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", padding: "8px 14px", fontSize: 14 } as React.CSSProperties,
  btn: { background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", letterSpacing: 0.3 },
  btnOutline: { background: "transparent", color: "#3B82F6", border: "2px solid #3B82F6", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  btnGhost: { background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  card: { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.08)", border: "1px solid #F0F2F7", transition: "all 0.25s", cursor: "pointer" },
  page: { minHeight: "calc(100vh - 64px)", background: "#F8FAFF" },
  input: { width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" as const },
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

interface StarsProps { rating: number; size?: number; }
const Stars: React.FC<StarsProps> = ({ rating, size = 14 }) => (
  <span style={{ fontSize: size, letterSpacing: -1 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB" }}>★</span>
    ))}
  </span>
);

interface BadgeProps { text: string; }
const Badge: React.FC<BadgeProps> = ({ text }) => {
  const colors: Record<string, string> = { "Best Seller": "#3B82F6", "New": "#10B981", "Sale": "#EF4444", "Limited": "#8B5CF6", "PC Build": "#8B5CF6", "Listed": "#3B82F6" };
  return (
    <span style={{ background: colors[text] || "#6B7280", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {text}
    </span>
  );
};

// ─── NAV BAR ─────────────────────────────────────────────────────────────────

interface NavBarProps {
  search: string;
  setSearch: (v: string) => void;
  cartCount: number;
  wishlistCount: number;
  currentUser: User | null;
  setPage: (p: StorefrontPage) => void;
  setCheckoutStep: (s: number) => void;
}
const NavBar: React.FC<NavBarProps> = ({ search, setSearch, cartCount, wishlistCount, currentUser, setPage, setCheckoutStep }) => (
  <nav style={STYLES.nav}>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <div style={STYLES.logo} onClick={() => setPage("landing")}>
      <span style={{ fontSize: 28 }}>⚡</span>
      <span>E-Commerce<span style={STYLES.logoAccent}> NexVolt</span></span>
    </div>
    <div style={STYLES.searchBar}>
      <span style={{ padding: "0 8px 0 12px", color: "rgba(255,255,255,0.4)", fontSize: 16 }}>🔍</span>
      <input style={STYLES.searchInput} placeholder="Search products..." value={search}
        onChange={e => { setSearch(e.target.value); setPage("browse"); }} />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button style={STYLES.navLink} onClick={() => setPage("browse")}>Shop</button>
      <button style={STYLES.navLink} onClick={() => setPage("wishlist")}>
        ♡ {wishlistCount > 0 && `(${wishlistCount})`}
      </button>
      {currentUser ? (
        <button style={{ ...STYLES.navLink, color: "#60A5FA" }} onClick={() => setPage("portal")}>
          👤 {currentUser.firstName}
        </button>
      ) : (
        <>
          <button style={STYLES.navLink} onClick={() => setPage("login")}>Login</button>
          <button style={{ ...STYLES.btn, padding: "7px 16px", fontSize: 13 }} onClick={() => setPage("register")}>Sign Up</button>
        </>
      )}
      <button style={{ ...STYLES.btn, padding: "8px 18px", position: "relative" }} onClick={() => { setCheckoutStep(0); setPage("checkout"); }}>
        🛒 {cartCount > 0 && (
          <span style={{ background: "#EF4444", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginLeft: 4 }}>
            {cartCount}
          </span>
        )}
      </button>
    </div>
  </nav>
);

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────

interface NotificationProps { notification: NotificationState | null; }
const Notification: React.FC<NotificationProps> = ({ notification }) => {
  if (!notification) return null;
  return (
    <div style={{
      position: "fixed", top: 80, right: 24, zIndex: 999,
      background: notification.type === "success" ? "#10B981" : "#EF4444",
      color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)", animation: "slideIn 0.3s ease",
    }}>
      {notification.type === "success" ? "✓" : "✕"} {notification.msg}
    </div>
  );
};

// ─── FOOTER ──────────────────────────────────────────────────────────────────

const Footer: React.FC = () => (
  <div style={{ background: "#0A0F1E", padding: "40px 60px 32px", color: "rgba(255,255,255,0.6)" }}>
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 12 }}>
        ⚡ Nex<span style={{ color: "#3B82F6" }}>Volt</span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
        Your trusted destination for computer parts, peripherals, and custom PC builds.
      </p>
    </div>
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, textAlign: "center", fontSize: 13 }}>
      © {new Date().getFullYear()} NexVolt. All rights reserved.
    </div>
  </div>
);

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  wishlist: number[];
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (id: number) => void;
  onSelect: (p: Product) => void;
  size?: "sm" | "md";
}
const ProductCard: React.FC<ProductCardProps> = ({ product: p, wishlist, onAddToCart, onToggleWishlist, onSelect, size = "md" }) => {
  const imgH = size === "sm" ? 100 : 150;
  const imgF = size === "sm" ? 48 : 68;
  return (
    <div className="product-card" style={STYLES.card} onClick={() => onSelect(p)}>
      <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", height: imgH, display: "flex", alignItems: "center", justifyContent: "center", fontSize: imgF, position: "relative" }}>
        <ProductVisual src={p.img} size={imgF} />
        <div style={{ position: "absolute", top: 10, left: 10 }}><Badge text={p.badge} /></div>
        <div style={{ position: "absolute", top: 10, right: 10, fontSize: 18, cursor: "pointer" }}
          onClick={e => { e.stopPropagation(); onToggleWishlist(p.id); }}>
          {wishlist.includes(p.id) ? "❤️" : "♡"}
        </div>
      </div>
      <div style={{ padding: size === "sm" ? "12px" : "14px" }}>
        <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{p.category}</div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 5, lineHeight: 1.3 }}>{p.name}</div>
        {/* <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <Stars rating={p.rating} size={12} />
          <span style={{ fontSize: 11, color: "#6B7280" }}>({p.reviews})</span>
        </div> */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 17, fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(p.price)}</span>
            <br /><span style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "line-through" }}>{formatCurrency(p.originalPrice)}</span>
          </div>
          <button style={{ ...STYLES.btn, padding: "8px 14px", fontSize: 13, borderRadius: 8 }}
            onClick={e => { e.stopPropagation(); onAddToCart(p); }}>+ Cart</button>
        </div>
      </div>
    </div>
  );
};

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────

interface StepIndicatorProps { checkoutStep: number; }
const StepIndicator: React.FC<StepIndicatorProps> = ({ checkoutStep }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40, gap: 0 }}>
    {STEPS.map((s, i) => (
      <div key={s} style={{ display: "flex", alignItems: "center" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14,
          background: i < checkoutStep ? "#10B981" : i === checkoutStep ? "#3B82F6" : "#E5E7EB",
          color: i <= checkoutStep ? "#fff" : "#6B7280", transition: "all 0.3s",
        }}>{i < checkoutStep ? "✓" : i + 1}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: i === checkoutStep ? "#3B82F6" : "#9CA3AF", position: "absolute", marginTop: 52, marginLeft: -14, whiteSpace: "nowrap" }}>{s}</div>
        {i < STEPS.length - 1 && <div style={{ width: 60, height: 2, background: i < checkoutStep ? "#10B981" : "#E5E7EB", transition: "all 0.3s" }} />}
      </div>
    ))}
  </div>
);

// ─── TRUST BAR ───────────────────────────────────────────────────────────────

const TrustBar: React.FC = () => (
  <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "14px 60px" }}>
    <div style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
      {[["🔒", "Secure Checkout"], ["🛠️", "Custom PC Builds"], ["🏆", "Authentic Products"], ["📦", "Nationwide Delivery"]].map(([icon, text]) => (
        <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, color: "#374151", fontSize: 13, fontWeight: 600 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>{text}
        </div>
      ))}
    </div>
  </div>
);

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

interface HeroProps {
  heroProduct: Product;
  heroIndex: number;
  heroProducts: Product[];
  setHeroIndex: (i: number) => void;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}
const Hero: React.FC<HeroProps> = ({ heroProduct, heroIndex, heroProducts, setHeroIndex, onAddToCart, onViewDetails }) => (
  <div style={{ background: "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 60%, #0A1628 100%)", minHeight: 520, display: "flex", alignItems: "center", padding: "60px 60px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 70% 50%, rgba(59,130,246,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 180, animation: "float 4s ease-in-out infinite", opacity: 0.9, borderRadius: 18, overflow: "hidden" }}>
      <ProductVisual src={heroProduct.img} size={180} />
    </div>
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
        <button className="btn-primary" style={STYLES.btn} onClick={() => onAddToCart(heroProduct)}>Add to Cart</button>
        <button style={STYLES.btnGhost} onClick={() => onViewDetails(heroProduct)}>View Details</button>
      </div>
    </div>
    <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
      {heroProducts.map((_, i) => (
        <div key={i} onClick={() => setHeroIndex(i)} style={{ width: i === heroIndex ? 24 : 8, height: 8, borderRadius: 4, background: i === heroIndex ? "#3B82F6" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.3s" }} />
      ))}
    </div>
  </div>
);

// ─── ORDER SUMMARY SIDEBAR ────────────────────────────────────────────────────

interface OrderSummarySidebarProps { cart: CartItem[]; cartTotal: number; cartCount: number; }
const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({ cart, cartTotal, cartCount }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
    <div style={{ fontWeight: 700, fontSize: 17, color: "#111827", marginBottom: 20 }}>Order Summary</div>
    {cart.map(item => (
      <div key={item.id} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ProductVisual src={item.img} size={28} />
        </div>
        <div style={{ flex: 1, fontSize: 13, color: "#374151" }}>{item.name} <span style={{ color: "#9CA3AF" }}>×{item.qty}</span></div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{formatCurrency(item.price * item.qty)}</div>
      </div>
    ))}
    <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 14, marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#374151" }}><span>Subtotal ({cartCount} items)</span><span>{formatCurrency(cartTotal)}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#374151" }}><span>Shipping</span><span style={{ color: "#10B981", fontWeight: 600 }}>FREE</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "#374151" }}><span>Tax (8%)</span><span>{formatCurrency(Math.round(cartTotal * 0.08))}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}>
        <span>Total</span>
        <span style={{ fontFamily: "'Orbitron', sans-serif", color: "#1D4ED8" }}>{formatCurrency(cartTotal + Math.round(cartTotal * 0.08))}</span>
      </div>
    </div>
  </div>
);

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

interface LandingPageProps {
  heroIndex: number;
  heroProducts: Product[];
  products: Product[];
  categories: string[];
  setHeroIndex: (i: number) => void;
  wishlist: number[];
  addToCart: (p: Product) => void;
  toggleWishlist: (id: number) => void;
  setSelectedProduct: (p: Product) => void;
  setPage: (p: StorefrontPage) => void;
  setCategory: (c: string) => void;
}
const LandingPage: React.FC<LandingPageProps> = ({ heroIndex, heroProducts, products, categories, setHeroIndex, wishlist, addToCart, toggleWishlist, setSelectedProduct, setPage, setCategory }) => {
  const heroProduct = heroProducts[heroIndex];

  if (!heroProduct) {
    return (
      <div style={{ ...STYLES.page, fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900, color: "#0A0F1E", marginBottom: 8 }}>No products listed yet</h2>
        <p style={{ color: "#6B7280" }}>Check back soon — new listings are on the way.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .product-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(0,0,0,0.14) !important; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,0.4); }
        .cat-chip:hover { background: #3B82F6 !important; color: #fff !important; }
      `}</style>
      <Hero heroProduct={heroProduct} heroIndex={heroIndex} heroProducts={heroProducts} setHeroIndex={setHeroIndex}
        onAddToCart={addToCart} onViewDetails={setSelectedProduct} />
      <TrustBar />
      <div style={STYLES.page}>
        {/* Categories */}
        <div style={{ padding: "56px 60px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", margin: 0 }}>Shop by Category</h2>
            <button style={{ color: "#3B82F6", fontSize: 14, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => setPage("browse")}>View All →</button>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {categories.filter(c => c !== "All").map(cat => (
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
            {products.map(p => (
              <ProductCard key={p.id} product={p} wishlist={wishlist} onAddToCart={addToCart} onToggleWishlist={toggleWishlist}
                onSelect={setSelectedProduct} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

// ─── BROWSE PAGE ──────────────────────────────────────────────────────────────

interface BrowsePageProps {
  search: string;
  category: string;
  sort: string;
  products: Product[];
  categories: string[];
  setCategory: (c: string) => void;
  setSort: (s: string) => void;
  wishlist: number[];
  addToCart: (p: Product) => void;
  toggleWishlist: (id: number) => void;
  setSelectedProduct: (p: Product) => void;
  setPage: (p: StorefrontPage) => void;
}
const BrowsePage: React.FC<BrowsePageProps> = ({ search, category, sort, products, categories, setCategory, setSort, wishlist, addToCart, toggleWishlist, setSelectedProduct, setPage }) => {
  const filtered = products.filter(p => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`.product-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.12) !important; }`}</style>
      <div style={{ ...STYLES.page, padding: "32px 60px" }}>
        <div style={{ display: "flex", gap: 28 }}>
          {/* Sidebar */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 14 }}>Categories</div>
              {categories.map(cat => (
                <div key={cat} onClick={() => setCategory(cat)}
                  style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: category === cat ? 700 : 400, color: category === cat ? "#1D4ED8" : "#374151", background: category === cat ? "#EFF6FF" : "transparent", marginBottom: 2, transition: "all 0.15s" }}>
                  {cat} <span style={{ float: "right", color: "#9CA3AF", fontSize: 12 }}>{cat === "All" ? products.length : products.filter(p => p.category === cat).length}</span>
                </div>
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
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} wishlist={wishlist} onAddToCart={addToCart} onToggleWishlist={toggleWishlist}
                  onSelect={setSelectedProduct} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PRODUCT PAGE ─────────────────────────────────────────────────────────────

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
  wishlist: number[];
  quantity: number;
  setQuantity: (q: number) => void;
  addToCart: (p: Product, qty?: number) => void;
  toggleWishlist: (id: number) => void;
  setSelectedProduct: (p: Product) => void;
  setPage: (p: StorefrontPage) => void;
  setCheckoutStep: (s: number) => void;
}
const ProductPage: React.FC<ProductPageProps> = ({ product: p, relatedProducts, wishlist, quantity, setQuantity, addToCart, toggleWishlist, setSelectedProduct, setPage, setCheckoutStep }) => (
  <div style={{ fontFamily: "'Inter', sans-serif" }}>
    <div style={{ ...STYLES.page, padding: "40px 60px" }}>
      <div style={{ color: "#6B7280", fontSize: 13, marginBottom: 24, cursor: "pointer" }} onClick={() => setPage("browse")}>← Back to Products</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div>
          <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", borderRadius: 20, height: 380, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 140, marginBottom: 16, border: "1px solid #DBEAFE", overflow: "hidden" }}>
            <ProductVisual src={p.img} size={140} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", borderRadius: 10, height: 72, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, border: `2px solid ${i === 1 ? "#3B82F6" : "#E5E7EB"}`, cursor: "pointer", overflow: "hidden" }}>
                <ProductVisual src={p.img} size={36} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><Badge text={p.badge} /><span style={{ fontSize: 13, color: "#6B7280" }}>{p.category}</span></div>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 900, color: "#0A0F1E", margin: "0 0 12px", lineHeight: 1.2 }}>{p.name}</h1>
          {/* <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Stars rating={p.rating} size={18} />
            <span style={{ color: "#374151", fontWeight: 600 }}>{p.rating}</span>
            <span style={{ color: "#6B7280", fontSize: 14 }}>({p.reviews} reviews)</span>
          </div> */}
          <p style={{ color: "#4B5563", lineHeight: 1.7, marginBottom: 20 }}>{p.description}</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 34, fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(p.price)}</span>
            <span style={{ fontSize: 20, color: "#9CA3AF", textDecoration: "line-through" }}>{formatCurrency(p.originalPrice)}</span>
          </div>
          <div style={{ color: "#10B981", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            ✓ You save {formatCurrency(p.originalPrice - p.price)} ({Math.round((1 - p.price / p.originalPrice) * 100)}% off)
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
            <button style={{ ...STYLES.btn, flex: 2 }} onClick={() => addToCart(p, quantity)}>Add to Cart</button>
            <button style={{ ...STYLES.btn, background: "#10B981", flex: 2 }} onClick={() => { addToCart(p, quantity); setCheckoutStep(0); setPage("checkout"); }}>Buy Now</button>
            <button style={{ ...STYLES.btnOutline, padding: "10px 16px" }} onClick={() => toggleWishlist(p.id)}>{wishlist.includes(p.id) ? "❤️" : "♡"}</button>
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
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#0A0F1E", marginBottom: 24 }}>You May Also Like</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {relatedProducts.map(pr => (
              <div key={pr.id} style={{ ...STYLES.card, cursor: "pointer" }} onClick={() => { setSelectedProduct(pr); window.scrollTo(0, 0); }}>
                <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, overflow: "hidden" }}>
                  <ProductVisual src={pr.img} size={48} />
                </div>
                <div style={{ padding: "12px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 4 }}>{pr.name}</div>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(pr.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// ─── WISHLIST PAGE ────────────────────────────────────────────────────────────

interface WishlistPageProps {
  wishlist: number[];
  products: Product[];
  toggleWishlist: (id: number) => void;
  addToCart: (p: Product) => void;
  setPage: (p: StorefrontPage) => void;
}
const WishlistPage: React.FC<WishlistPageProps> = ({ wishlist, products, toggleWishlist, addToCart, setPage }) => (
  <div style={{ fontFamily: "'Inter', sans-serif" }}>
    <div style={{ ...STYLES.page, padding: "40px 60px" }}>
      <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 24 }}>Your Wishlist</h1>
      {wishlist.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>♡</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Your wishlist is empty</div>
          <button style={STYLES.btn} onClick={() => setPage("browse")}>Browse Products</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {products.filter(p => wishlist.includes(p.id)).map(p => (
            <div key={p.id} style={STYLES.card}>
              <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, overflow: "hidden" }}>
                <ProductVisual src={p.img} size={64} />
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ fontWeight: 700, color: "#111827", marginBottom: 8 }}>{p.name}</div>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(p.price)}</span>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={{ ...STYLES.btn, flex: 1, padding: "8px" }} onClick={() => addToCart(p)}>Add to Cart</button>
                  <button style={{ ...STYLES.btnOutline, padding: "8px 12px" }} onClick={() => toggleWishlist(p.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─── CHECKOUT PAGES ───────────────────────────────────────────────────────────

interface CheckoutPageProps {
  checkoutStep: number;
  setCheckoutStep: (s: number) => void;
  cart: CartItem[];
  completedCart: CartItem[];
  cartTotal: number;
  cartCount: number;
  orderNum: string;
  currentUser: User | null;
  completedOrder: CompletedOrder | null;
  isPlacingOrder: boolean;
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: (m: PaymentMethod) => void;
  placeOrder: () => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  returnReason: string;
  setReturnReason: (r: string) => void;
  returnSubmitted: boolean;
  setReturnSubmitted: (v: boolean) => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setPage: (p: StorefrontPage) => void;
  notify: (msg: string, type?: "success" | "error") => void;
}
const CheckoutPage: React.FC<CheckoutPageProps> = ({ checkoutStep, setCheckoutStep, cart, completedCart, cartTotal, cartCount, orderNum, currentUser, completedOrder, isPlacingOrder, selectedPaymentMethod, setSelectedPaymentMethod, placeOrder, removeFromCart, updateQty, returnReason, setReturnReason, returnSubmitted, setReturnSubmitted, setCart, setPage, notify }) => {
  const confirmationCart = completedCart.length > 0 ? completedCart : cart;
  const confirmationTotal = completedOrder?.total ?? confirmationCart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (checkoutStep === 0) return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ ...STYLES.page, padding: "40px 60px" }}>
        <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 32 }}>Shopping Cart</h1>
        <StepIndicator checkoutStep={checkoutStep} />
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Your cart is empty</div>
            <button style={STYLES.btn} onClick={() => setPage("browse")}>Start Shopping</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
            <div>
              {cart.map(item => (
                <div key={item.id} style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #E5E7EB", marginBottom: 14, display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", borderRadius: 12, width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                    <ProductVisual src={item.img} size={40} />
                  </div>
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
            <div style={{ position: "sticky", top: 100, height: "fit-content" }}>
              <OrderSummarySidebar cart={cart} cartTotal={cartTotal} cartCount={cartCount} />
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #E5E7EB", marginTop: 16 }}>
                <button style={{ ...STYLES.btn, width: "100%", padding: "14px" }} onClick={() => setCheckoutStep(1)}>Proceed to Checkout →</button>
                <button style={{ ...STYLES.btnGhost, width: "100%", marginTop: 8, padding: "12px", color: "#374151", border: "1px solid #D1D5DB" }} onClick={() => setPage("browse")}>Continue Shopping</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (checkoutStep === 1) return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ ...STYLES.page, padding: "40px 60px" }}>
        <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 32 }}>Checkout</h1>
        <StepIndicator checkoutStep={checkoutStep} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: "#111827" }}>Customer Account</div>
              {currentUser ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Customer</label>
                    <div style={{ fontWeight: 700, color: "#111827" }}>{currentUser.firstName} {currentUser.lastName}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Email</label>
                    <div style={{ fontWeight: 700, color: "#111827" }}>{currentUser.email}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Contact No.</label>
                    <div style={{ color: "#374151" }}>{currentUser.contactNo || "Not set"}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Customer ID</label>
                    <div style={{ color: "#374151" }}>{currentUser.id}</div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "16px", color: "#991B1B", fontWeight: 600 }}>
                  Please sign in with a customer account before placing an order.
                </div>
              )}
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: "#111827" }}>Shipping Details</div>
              <div style={{ background: "#F8FAFF", borderRadius: 12, padding: "16px", border: "1px solid #DBEAFE" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Saved Address</label>
                <div style={{ color: "#374151", lineHeight: 1.6 }}>
                  {currentUser?.address || "No saved address on profile. This simulated checkout will still process the order."}
                </div>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: "#111827" }}>Shipping Method</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, border: "1px solid #DBEAFE", background: "#F8FAFF" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Standard delivery</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>FREE</span>
              </div>
            </div>
          </div>
          <div>
            <div style={{ position: "sticky", top: 100 }}>
              <OrderSummarySidebar cart={cart} cartTotal={cartTotal} cartCount={cartCount} />
              <button style={{ ...STYLES.btn, width: "100%", marginTop: 16, padding: "14px" }} onClick={() => setCheckoutStep(2)}>Continue to Payment →</button>
              <button style={{ width: "100%", marginTop: 8, background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13 }} onClick={() => setCheckoutStep(0)}>← Back to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (checkoutStep === 2) return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ ...STYLES.page, padding: "40px 60px" }}>
        <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 32 }}>Payment</h1>
        <StepIndicator checkoutStep={checkoutStep} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Payment Method</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 20 }}>
                {PAYMENT_METHOD_OPTIONS.map(option => {
                  const active = selectedPaymentMethod === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(option.value)}
                      style={{ border: `2px solid ${active ? "#3B82F6" : "#E5E7EB"}`, borderRadius: 10, background: active ? "#EFF6FF" : "#fff", padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: active ? "#1D4ED8" : "#374151", textAlign: "left", minHeight: 92 }}
                    >
                      <div>{option.label}</div>
                      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 500, lineHeight: 1.4, color: active ? "#2563EB" : "#6B7280" }}>{option.detail}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "16px", border: "1px solid #E5E7EB" }}>
                {selectedPaymentMethod === "cod" && (
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>Cash on Delivery</div>
                    <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6 }}>Prepare the exact amount when the courier delivers your order.</div>
                  </div>
                )}
                {selectedPaymentMethod === "gcash" && (
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>Manual GCash payment</div>
                    <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6 }}>After placing your order, send your payment manually and keep your GCash receipt for verification.</div>
                  </div>
                )}
                {selectedPaymentMethod === "bank_transfer" && (
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>Manual bank transfer</div>
                    <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6 }}>Transfer the total manually after order confirmation and keep your bank receipt for verification.</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🔒</span>
              <span style={{ fontSize: 13, color: "#047857" }}>Your payment is encrypted with 256-bit SSL security</span>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Billing Address</div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "#3B82F6" }} />
                <span style={{ color: "#374151", fontWeight: 500 }}>Same as shipping address</span>
              </label>
            </div>
          </div>
          <div>
            <div style={{ position: "sticky", top: 100 }}>
              <OrderSummarySidebar cart={cart} cartTotal={cartTotal} cartCount={cartCount} />
              <button style={{ ...STYLES.btn, width: "100%", marginTop: 16, padding: "14px", background: "linear-gradient(135deg, #10B981, #059669)", fontSize: 15, opacity: isPlacingOrder ? 0.75 : 1 }} onClick={placeOrder} disabled={isPlacingOrder}>
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

  if (checkoutStep === 3) return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ ...STYLES.page, padding: "40px 60px", textAlign: "center" }}>
        <StepIndicator checkoutStep={checkoutStep} />
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 32, fontWeight: 900, color: "#10B981", marginBottom: 12 }}>Order Confirmed!</h1>
          <p style={{ color: "#4B5563", fontSize: 16, marginBottom: 8 }}>Thank you for your purchase! Your order has been placed.</p>
          <div style={{ background: "#F0FDF4", borderRadius: 12, padding: "16px 24px", marginBottom: 28, display: "inline-block" }}>
            <span style={{ fontSize: 14, color: "#047857" }}>Order #: </span>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, color: "#065F46", fontSize: 18 }}>{orderNum}</span>
            {completedOrder?.payment_reference && (
              <div style={{ fontSize: 12, color: "#047857", marginTop: 6 }}>Payment Ref: {completedOrder.payment_reference}</div>
            )}
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px", border: "1px solid #E5E7EB", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Order Summary</div>
            {confirmationCart.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ProductVisual src={item.img} size={36} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#111827" }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>Qty: {item.qty}</div>
                </div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, color: "#1D4ED8" }}>{formatCurrency(item.price * item.qty)}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18, paddingTop: 8 }}>
              <span>Total Paid</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", color: "#1D4ED8" }}>{formatCurrency(confirmationTotal)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button style={STYLES.btn} onClick={() => setPage("portal")}>View My Orders</button>
            <button style={STYLES.btnOutline} onClick={() => setPage("browse")}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
};

// ─── AUTH FIELD ───────────────────────────────────────────────────────────────

interface AuthFieldProps { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; }
const AuthField: React.FC<AuthFieldProps> = ({ label, type = "text", value, onChange, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || label}
      style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
      onFocus={e => (e.target.style.borderColor = "#3B82F6")}
      onBlur={e => (e.target.style.borderColor = "#D1D5DB")} />
  </div>
);

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

interface LoginPageProps {
  setPage: (p: StorefrontPage) => void;
  notify: (msg: string, type?: "success" | "error") => void;
}
const LoginPage: React.FC<LoginPageProps> = ({ setPage }) => {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    role: "customer",
  });
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (!data.email || !data.password) {
      setError("Please enter your email and password.");
      return;
    }

    post("/account/login", {
      onError: () => setError("Invalid email or password. Please try again."),
    });
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 900, color: "#fff", cursor: "pointer", marginBottom: 8 }} onClick={() => setPage("landing")}>
            ⚡ Nex<span style={{ color: "#3B82F6" }}>Volt</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Sign in to your account</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: "40px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#0A0F1E", marginBottom: 28, textAlign: "center" }}>Welcome Back</h2>
          {(error || errors.email) && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 14px", marginBottom: 20, color: "#DC2626", fontSize: 13, fontWeight: 500 }}>
              ⚠️ {error || errors.email}
            </div>
          )}
          <AuthField label="Email Address" type="email" value={data.email} onChange={(value) => setData("email", value)} placeholder="you@example.com" />
          <AuthField label="Password" type="password" value={data.password} onChange={(value) => setData("password", value)} placeholder="Your password" />
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: "#3B82F6", cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
          </div>
          <button style={{ ...STYLES.btn, width: "100%", padding: "14px", fontSize: 15, borderRadius: 12, marginBottom: 16, opacity: processing ? 0.7 : 1 }} onClick={handleLogin} disabled={processing}>
            {processing ? "Signing In..." : "Sign In"}
          </button>
          <div style={{ textAlign: "center", fontSize: 13, color: "#6B7280" }}>
            Don't have an account?{" "}
            <span style={{ color: "#3B82F6", fontWeight: 700, cursor: "pointer" }} onClick={() => setPage("register")}>Create Account</span>
          </div>
          <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 24, paddingTop: 20, textAlign: "center" }}>
            <button style={{ background: "none", border: "none", color: "#6B7280", fontSize: 13, cursor: "pointer" }} onClick={() => setPage("landing")}>
              ← Back to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────

interface RegisterPageProps {
  setPage: (p: StorefrontPage) => void;
  notify: (msg: string, type?: "success" | "error") => void;
}
const RegisterPage: React.FC<RegisterPageProps> = ({ setPage, notify }) => {
  const { data, setData, post, processing, errors } = useForm({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");

  const handleRegister = () => {
    setError("");
    if (!data.first_name || !data.last_name || !data.email || !data.password) { setError("Please fill in all required fields."); return; }
    if (data.password !== data.password_confirmation) { setError("Passwords do not match."); return; }
    if (data.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    post("/account/register", {
      onSuccess: () => notify(`Welcome to NexVolt, ${data.first_name}!`),
      onError: () => setError("Please check the highlighted fields and try again."),
    });
  };

  const firstServerError = errors.first_name || errors.last_name || errors.email || errors.password;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 900, color: "#fff", cursor: "pointer", marginBottom: 8 }} onClick={() => setPage("landing")}>
            ⚡ Nex<span style={{ color: "#3B82F6" }}>Volt</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Create your NexVolt account</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: "40px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#0A0F1E", marginBottom: 28, textAlign: "center" }}>Create Account</h2>
          {(error || firstServerError) && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 14px", marginBottom: 20, color: "#DC2626", fontSize: 13, fontWeight: 500 }}>
              ⚠️ {error || firstServerError}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 }}>
            <AuthField label="First Name" value={data.first_name} onChange={(value) => setData("first_name", value)} />
            <AuthField label="Last Name" value={data.last_name} onChange={(value) => setData("last_name", value)} />
          </div>
          <AuthField label="Email Address" type="email" value={data.email} onChange={(value) => setData("email", value)} placeholder="you@example.com" />
          <AuthField label="Password" type="password" value={data.password} onChange={(value) => setData("password", value)} placeholder="Min. 8 characters" />
          <AuthField label="Confirm Password" type="password" value={data.password_confirmation} onChange={(value) => setData("password_confirmation", value)} placeholder="Repeat password" />
          <div style={{ background: "#F8FAFF", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 12, color: "#6B7280" }}>
            By creating an account, you agree to our{" "}
            <span style={{ color: "#3B82F6", cursor: "pointer" }}>Terms of Service</span> and{" "}
            <span style={{ color: "#3B82F6", cursor: "pointer" }}>Privacy Policy</span>.
          </div>
          <button style={{ ...STYLES.btn, width: "100%", padding: "14px", fontSize: 15, borderRadius: 12, marginBottom: 16, opacity: processing ? 0.7 : 1 }} onClick={handleRegister} disabled={processing}>
            {processing ? "Creating Account..." : "Create Account"}
          </button>
          <div style={{ textAlign: "center", fontSize: 13, color: "#6B7280" }}>
            Already have an account?{" "}
            <span style={{ color: "#3B82F6", fontWeight: 700, cursor: "pointer" }} onClick={() => setPage("login")}>Sign In</span>
          </div>
          <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 24, paddingTop: 20, textAlign: "center" }}>
            <button style={{ background: "none", border: "none", color: "#6B7280", fontSize: 13, cursor: "pointer" }} onClick={() => setPage("landing")}>
              ← Back to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CUSTOMER PORTAL ─────────────────────────────────────────────────────────

interface CustomerPortalProps {
  currentUser: User;
  cart: CartItem[];
  wishlist: number[];
  products: Product[];
  orders: ServerOrder[];
  notifications: ServerNotification[];
  unreadNotifications: number;
  setCurrentUser: (u: User | null) => void;
  setPage: (p: StorefrontPage) => void;
  setCheckoutStep: (s: number) => void;
  notify: (msg: string, type?: "success" | "error") => void;
}
const CustomerPortal: React.FC<CustomerPortalProps> = ({ currentUser, cart, wishlist, products, orders, notifications, unreadNotifications, setCurrentUser, setPage, setCheckoutStep, notify }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "notifications" | "wishlist" | "settings">("overview");
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(currentUser.firstName);

  const tabs = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "orders", label: "My Orders", icon: "📦" },
    { id: "notifications", label: `Notifications${unreadNotifications ? ` (${unreadNotifications})` : ""}`, icon: "!" },
    { id: "wishlist", label: "Saved Items", icon: "♡" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ] as const;

  const handleLogout = () => {
    setCurrentUser(null);
    router.post("/logout");
  };

  const markNotificationsRead = () => {
    router.put("/notifications/read", {}, {
      preserveScroll: true,
      onSuccess: () => notify("Notifications marked as read."),
    });
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F8FAFF" }}>
      {/* Portal Header */}
      <div style={{ background: "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 100%)", padding: "24px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", cursor: "pointer" }} onClick={() => setPage("landing")}>
          ⚡ Nex<span style={{ color: "#3B82F6" }}>Volt</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#fff", fontWeight: 700 }}>{currentUser.firstName} {currentUser.lastName}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{currentUser.email}</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", fontWeight: 700 }}>
            {currentUser.firstName[0]}{currentUser.lastName[0]}
          </div>
          <button style={{ ...STYLES.btnGhost, fontSize: 13, padding: "8px 16px" }} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 88px)" }}>
        {/* Sidebar */}
        <div style={{ width: 240, background: "#fff", borderRight: "1px solid #E5E7EB", padding: "32px 20px", flexShrink: 0 }}>
          {/* Avatar */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", fontWeight: 700, margin: "0 auto 12px" }}>
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
            <div style={{ fontWeight: 700, color: "#111827", marginBottom: 2 }}>{currentUser.firstName} {currentUser.lastName}</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Member since {currentUser.joinDate}</div>
          </div>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, marginBottom: 4, border: "none", cursor: "pointer", fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 500, background: activeTab === tab.id ? "#EFF6FF" : "transparent", color: activeTab === tab.id ? "#1D4ED8" : "#374151", textAlign: "left", transition: "all 0.15s" }}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
          <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 20, paddingTop: 20 }}>
            <button onClick={() => { setCheckoutStep(0); setPage("checkout"); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, background: "transparent", color: "#374151", textAlign: "left" }}>
              <span style={{ fontSize: 18 }}>🛒</span> Cart ({cart.reduce((s, i) => s + i.qty, 0)})
            </button>
            <button onClick={() => setPage("browse")}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, background: "transparent", color: "#374151", textAlign: "left" }}>
              <span style={{ fontSize: 18 }}>🛍️</span> Browse Store
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900, color: "#0A0F1E", marginBottom: 8 }}>
                Good to see you, {currentUser.firstName}! 👋
              </h1>
              <p style={{ color: "#6B7280", marginBottom: 36 }}>Here's a summary of your account activity.</p>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
                {([
                  ["📦", "Total Orders", orders.length.toString(), "#3B82F6"],
                  ["♡", "Saved Items", wishlist.length.toString(), "#EF4444"],
                  ["🛒", "In Cart", cart.reduce((s, i) => s + i.qty, 0).toString(), "#10B981"],
                ] as [string, string, string, string][]).map(([icon, label, val, color]) => (
                  <div key={label} style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #E5E7EB" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "'Orbitron', sans-serif", marginBottom: 4 }}>{val}</div>
                    <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>
              {/* Recent Order */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Recent Activity</div>
                  <button style={{ background: "none", border: "none", color: "#3B82F6", fontSize: 13, fontWeight: 600, cursor: "pointer" }} onClick={() => setActiveTab("orders")}>View All →</button>
                </div>
                {orders.length > 0 ? (
                  <div style={{ background: "#F8FAFF", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>Order #{orders[0].order_code}</div>
                      <div style={{ fontSize: 13, color: "#6B7280" }}>{orders[0].date} · {formatCurrency(orders[0].total)}</div>
                    </div>
                    <div style={{ ...orderStatusStyle(orders[0].status), padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{orders[0].status}</div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div>No orders yet. <span style={{ color: "#3B82F6", cursor: "pointer" }} onClick={() => setPage("browse")}>Start shopping →</span></div>
                  </div>
                )}
              </div>
              {/* Quick Actions */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 18 }}>Quick Actions</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button style={STYLES.btn} onClick={() => setPage("browse")}>🛍️ Browse Products</button>
                  <button style={STYLES.btnOutline} onClick={() => setActiveTab("wishlist")}>♡ View Wishlist</button>
                  <button style={STYLES.btnOutline} onClick={() => setActiveTab("settings")}>⚙️ Edit Profile</button>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900, color: "#0A0F1E", marginBottom: 8 }}>My Orders</h1>
              <p style={{ color: "#6B7280", marginBottom: 32 }}>Track and manage your purchases.</p>
              {orders.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden" }}>
                      <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 16, color: "#111827" }}>Order #{order.order_code}</div>
                          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{order.date} · {order.no_of_items} item(s)</div>
                        </div>
                        <div style={{ ...orderStatusStyle(order.status), padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{order.status}</div>
                      </div>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ padding: "16px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: "#111827" }}>{item.name}</div>
                            <div style={{ fontSize: 13, color: "#6B7280" }}>Qty: {item.quantity}</div>
                          </div>
                          <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, color: "#1D4ED8", fontSize: 15 }}>{formatCurrency(item.price * item.quantity)}</div>
                        </div>
                      ))}
                      <div style={{ padding: "16px 24px", background: "#F8FAFF", display: "flex", justifyContent: "flex-end", fontWeight: 700, color: "#111827" }}>
                        Total: <span style={{ fontFamily: "'Orbitron', sans-serif", color: "#1D4ED8", marginLeft: 8 }}>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No orders yet</div>
                  <button style={STYLES.btn} onClick={() => setPage("browse")}>Start Shopping</button>
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900, color: "#0A0F1E", marginBottom: 8 }}>Notifications</h1>
                  <p style={{ color: "#6B7280" }}>Order confirmations, delivery updates, and store announcements.</p>
                </div>
                <button style={STYLES.btnOutline} onClick={markNotificationsRead}>Mark all read</button>
              </div>
              {notifications.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {notifications.map(item => (
                    <div key={item.id} style={{ background: "#fff", borderRadius: 16, border: item.read_at ? "1px solid #E5E7EB" : "1px solid #93C5FD", padding: "20px 24px", display: "flex", gap: 16 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: item.read_at ? "#F3F4F6" : "#EFF6FF", color: item.read_at ? "#6B7280" : "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                        {item.type === "announcement" ? "A" : item.type === "delivery_update" ? "D" : "O"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                          <div style={{ fontWeight: 800, color: "#111827" }}>{item.title}</div>
                          {!item.read_at && (
                            <span style={{ background: "#DBEAFE", color: "#1D4ED8", borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 800 }}>Unread</span>
                          )}
                        </div>
                        <div style={{ color: "#4B5563", fontSize: 14, lineHeight: 1.6 }}>{item.message}</div>
                        <div style={{ marginTop: 10, color: "#9CA3AF", fontSize: 12 }}>{item.created_label || "Just now"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280" }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>!</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No notifications yet</div>
                  <div>Order and announcement updates will appear here.</div>
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900, color: "#0A0F1E", marginBottom: 8 }}>Saved Items</h1>
              <p style={{ color: "#6B7280", marginBottom: 32 }}>Products you've saved for later.</p>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>♡</div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Your wishlist is empty</div>
                  <button style={STYLES.btn} onClick={() => setPage("browse")}>Browse Products</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                  {products.filter(p => wishlist.includes(p.id)).map(p => (
                    <div key={p.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden" }}>
                      <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, overflow: "hidden" }}>
                        <ProductVisual src={p.img} size={56} />
                      </div>
                      <div style={{ padding: "16px" }}>
                        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4, fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: "#1D4ED8", marginBottom: 14 }}>{formatCurrency(p.price)}</div>
                        <button style={{ ...STYLES.btn, width: "100%", padding: "10px", fontSize: 13 }} onClick={() => setPage("browse")}>Browse Store</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900, color: "#0A0F1E", marginBottom: 8 }}>Account Settings</h1>
              <p style={{ color: "#6B7280", marginBottom: 36 }}>Manage your profile and preferences.</p>
              {/* Profile Card */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "32px", border: "1px solid #E5E7EB", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Personal Information</div>
                  <button style={{ ...STYLES.btnOutline, padding: "8px 16px", fontSize: 13 }} onClick={() => setEditMode(e => !e)}>
                    {editMode ? "Cancel" : "Edit Profile"}
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 700 }}>
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827", fontSize: 18 }}>{currentUser.firstName} {currentUser.lastName}</div>
                    <div style={{ color: "#6B7280", fontSize: 14 }}>Customer ID: {currentUser.id}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {([
                    ["First Name", currentUser.firstName],
                    ["Last Name", currentUser.lastName],
                    ["Email", currentUser.email],
                    ["Member Since", currentUser.joinDate],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
                      {editMode && label === "First Name" ? (
                        <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...STYLES.input }} />
                      ) : (
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{val}</div>
                      )}
                    </div>
                  ))}
                </div>
                {editMode && (
                  <button style={{ ...STYLES.btn, marginTop: 24 }} onClick={() => { setEditMode(false); notify("Profile updated!"); }}>
                    Save Changes
                  </button>
                )}
              </div>
              {/* Preferences */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "32px", border: "1px solid #E5E7EB", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 20 }}>Notifications & Preferences</div>
                {[
                  ["📧 Email promotions and deals", true],
                  ["🔔 Order status updates", true],
                  ["📦 Shipping notifications", true],
                  ["⭐ Product review reminders", false],
                ].map(([label, checked]) => (
                  <label key={label as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F3F4F6", cursor: "pointer" }}>
                    <span style={{ fontSize: 14, color: "#374151" }}>{label as string}</span>
                    <input type="checkbox" defaultChecked={checked as boolean} style={{ accentColor: "#3B82F6", width: 18, height: 18 }} />
                  </label>
                ))}
              </div>
              {/* Danger Zone */}
              <div style={{ background: "#FEF2F2", borderRadius: 16, padding: "24px", border: "1px solid #FECACA" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#DC2626", marginBottom: 8 }}>Danger Zone</div>
                <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 16 }}>These actions are irreversible. Please be careful.</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button style={{ ...STYLES.btnOutline, borderColor: "#EF4444", color: "#EF4444", padding: "8px 16px", fontSize: 13 }} onClick={handleLogout}>Sign Out of All Devices</button>
                  <button style={{ ...STYLES.btn, background: "#EF4444", padding: "8px 16px", fontSize: 13 }}>Delete Account</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

export interface NexVoltStorefrontProps {
  initialPage?: StorefrontPage;
  productId?: number | string;
  listings?: ServerListing[];
}

const pagePaths: Record<StorefrontPage, string> = {
  landing: '/',
  browse: '/shop',
  product: '/products',
  wishlist: '/wishlist',
  checkout: '/checkout',
  login: '/account/login',
  register: '/account/register',
  portal: '/account',
};

export function NexVoltStorefront({ initialPage = "landing", productId, listings = [] }: NexVoltStorefrontProps) {
  const { auth } = usePage<{ auth?: { user?: ServerUser | null; orders?: ServerOrder[]; notifications?: ServerNotification[]; unread_notifications?: number } }>().props;
  const authenticatedCustomer = toCustomerUser(auth?.user);
  const customerOrders = auth?.orders ?? [];
  const customerNotifications = auth?.notifications ?? [];
  const unreadNotifications = auth?.unread_notifications ?? 0;
  const listingProducts = listings.map(listingToProduct);
  const categories = ["All", ...Array.from(new Set(listingProducts.map(p => p.category)))];
  const [page, setPageState] = useState<StorefrontPage>(initialPage);
  const [cart, setCart] = useState<CartItem[]>(() => loadStored<CartItem[]>(STORAGE_KEYS.cart, []));
  const [completedCart, setCompletedCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>(() => loadStored<number[]>(STORAGE_KEYS.wishlist, []));
  const [selectedProduct, setSelectedProductState] = useState<Product | null>(() => {
    if (initialPage !== "product" || listingProducts.length === 0) return null;

    return listingProducts.find(product => String(product.id) === String(productId)) ?? listingProducts[0];
  });
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("featured");
  const [checkoutStep, setCheckoutStep] = useState<number>(0);
  const [orderNum, setOrderNum] = useState<string>(`NV-${Math.floor(Math.random() * 90000 + 10000)}`);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("cod");
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [review, setReview] = useState<{ rating: number; text: string }>({ rating: 5, text: "" });
  const [returnReason, setReturnReason] = useState<string>("");
  const [returnSubmitted, setReturnSubmitted] = useState<boolean>(false);
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<User | null>(authenticatedCustomer);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const heroProducts = listingProducts.slice(0, 3);
  const safeHeroIndex = heroProducts.length > 0 ? heroIndex % heroProducts.length : 0;

  const navigateToPage = useCallback((nextPage: StorefrontPage, product?: Product | null) => {
    setPageState(nextPage);

    if (typeof window === "undefined") return;
    if (nextPage === "product" && !product) return;

    const nextPath = nextPage === "product" && product
      ? `/products/${product.id}`
      : pagePaths[nextPage];

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
  }, []);

  const setPage = useCallback((nextPage: StorefrontPage) => {
    // The portal shows server-backed data (orders, statuses), so fetch a fresh
    // render from the server instead of switching client-side.
    if (nextPage === "portal") {
      router.visit("/account");
      return;
    }

    navigateToPage(nextPage, selectedProduct);
  }, [navigateToPage, selectedProduct]);

  const setSelectedProduct = useCallback((product: Product | null) => {
    setSelectedProductState(product);

    if (product) {
      navigateToPage("product", product);
    }
  }, [navigateToPage]);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex(h => (h + 1) % Math.max(heroProducts.length, 1)), 4000);
    return () => clearInterval(t);
  }, [heroProducts.length]);

  // Persist cart + wishlist so they survive navigation and refresh.
  useEffect(() => { saveStored(STORAGE_KEYS.cart, cart); }, [cart]);
  useEffect(() => { saveStored(STORAGE_KEYS.wishlist, wishlist); }, [wishlist]);

  const notify = useCallback((msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addToCart = useCallback((product: Product, qty: number = 1) => {
    setCart(c => {
      const existing = c.find(i => i.id === product.id);
      if (existing) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...c, { ...product, qty }];
    });
    notify(`${product.name} added to cart!`);
  }, [notify]);

  const removeFromCart = useCallback((id: number) => setCart(c => c.filter(i => i.id !== id)), []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty < 1) return removeFromCart(id);
    setCart(c => c.map(i => i.id === id ? { ...i, qty } : i));
  }, [removeFromCart]);

  const toggleWishlist = useCallback((id: number) => {
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  }, []);

  const placeOrder = useCallback(async () => {
    if (!currentUser) {
      notify("Please sign in before placing an order.", "error");
      setPage("login");
      return;
    }

    if (cart.length === 0) {
      notify("Your cart is empty.", "error");
      setCheckoutStep(0);
      return;
    }

    setIsPlacingOrder(true);

    try {
      const response = await fetch("/checkout/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": csrfToken(),
        },
        body: JSON.stringify({
          payment_method: selectedPaymentMethod,
          items: cart.map(item => ({
            listing_id: item.listingId ?? item.id,
            kind: item.kind,
            quantity: item.qty,
          })),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = payload?.message
          || payload?.errors?.checkout?.[0]
          || payload?.errors?.items?.[0]
          || "Unable to place order.";

        throw new Error(message);
      }

      const order: CompletedOrder = {
        id: payload.order.id,
        number: payload.order.number,
        status: payload.order.status,
        subtotal: Number(payload.order.subtotal ?? 0),
        total: Number(payload.order.total ?? 0),
        items_count: Number(payload.order.items_count ?? cartCount),
        payment_reference: payload.payment?.reference_number,
      };

      setCompletedCart(cart);
      setCompletedOrder(order);
      setOrderNum(order.number);
      setCart([]);
      setCheckoutStep(3);
      notify("Order created and payment simulated.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to place order.", "error");
    } finally {
      setIsPlacingOrder(false);
    }
  }, [cart, cartCount, currentUser, notify, selectedPaymentMethod, setPage]);

  const handleSetCurrentUser = useCallback((u: User | null) => setCurrentUser(u), []);

  const navProps = {
    search, setSearch, cartCount, wishlistCount: wishlist.length,
    currentUser, setPage, setCheckoutStep,
  };

  // Auth pages don't have the nav bar
  if (page === "login") return (
    <>
      <Notification notification={notification} />
      <LoginPage setPage={setPage} notify={notify} />
    </>
  );

  if (page === "register") return (
    <>
      <Notification notification={notification} />
      <RegisterPage setPage={setPage} notify={notify} />
    </>
  );

  if (page === "portal" && currentUser) return (
    <>
      <Notification notification={notification} />
      <CustomerPortal currentUser={currentUser} cart={cart} wishlist={wishlist} products={listingProducts} orders={customerOrders}
        notifications={customerNotifications} unreadNotifications={unreadNotifications}
        setCurrentUser={handleSetCurrentUser} setPage={setPage} setCheckoutStep={setCheckoutStep} notify={notify} />
    </>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <NavBar {...navProps} />
      <Notification notification={notification} />

      {page === "landing" && (
        <LandingPage heroIndex={safeHeroIndex} heroProducts={heroProducts} products={listingProducts} categories={categories} setHeroIndex={setHeroIndex}
          wishlist={wishlist} addToCart={addToCart} toggleWishlist={toggleWishlist}
          setSelectedProduct={setSelectedProduct} setPage={setPage} setCategory={setCategory} />
      )}

      {page === "browse" && (
        <BrowsePage search={search} category={category} sort={sort} products={listingProducts} categories={categories} setCategory={setCategory} setSort={setSort}
          wishlist={wishlist} addToCart={addToCart} toggleWishlist={toggleWishlist}
          setSelectedProduct={setSelectedProduct} setPage={setPage} />
      )}

      {page === "product" && selectedProduct && (
        <ProductPage product={selectedProduct} relatedProducts={listingProducts.filter(pr => pr.id !== selectedProduct.id).slice(0, 4)} wishlist={wishlist} quantity={quantity} setQuantity={setQuantity}
          addToCart={addToCart} toggleWishlist={toggleWishlist}
          setSelectedProduct={setSelectedProduct} setPage={setPage} setCheckoutStep={setCheckoutStep} />
      )}

      {page === "wishlist" && (
        <WishlistPage wishlist={wishlist} products={listingProducts} toggleWishlist={toggleWishlist} addToCart={addToCart} setPage={setPage} />
      )}

      {page === "checkout" && (
        <CheckoutPage checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep}
          cart={cart} completedCart={completedCart} cartTotal={cartTotal} cartCount={cartCount} orderNum={orderNum}
          currentUser={currentUser} completedOrder={completedOrder} isPlacingOrder={isPlacingOrder}
          selectedPaymentMethod={selectedPaymentMethod} setSelectedPaymentMethod={setSelectedPaymentMethod} placeOrder={placeOrder}
          removeFromCart={removeFromCart} updateQty={updateQty}
          returnReason={returnReason} setReturnReason={setReturnReason}
          returnSubmitted={returnSubmitted} setReturnSubmitted={setReturnSubmitted}
          setCart={setCart} setPage={setPage} notify={notify} />
      )}
    </div>
  );
}


export default NexVoltStorefront;
