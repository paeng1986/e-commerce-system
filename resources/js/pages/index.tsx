import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import BrowsePage from "@/components/BrowsePage";
import ProductPage from "@/components/ProductPage";
import WishlistPage from "@/components/WishlistPage";
import CheckoutPage from "@/components/CheckoutPage";

// ─── Types ────────────────────────────────────────────────────────────────

export type Product = {
  id: string | number;
  name: string;
  price: number;
  qty?: number;
  [key: string]: any;
};

type Page =
  | "landing"
  | "browse"
  | "product"
  | "wishlist"
  | "checkout";

type Notification = {
  msg: string;
  type: "success" | "error" | "info";
} | null;

export default function App() {
  // ── Navigation ───────────────────────────────────────────────────────────
  const [page, setPage] = useState<Page>("landing");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // ── Browse state ─────────────────────────────────────────────────────────
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  // ── Cart ─────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<Product[]>([]);

  const cartCount = cart.reduce((s, i) => s + (i.qty ?? 0), 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * (i.qty ?? 0), 0);

  const addToCart = (product: Product, qty: number = 1) => {
    setCart((c) => {
      const existing = c.find((i) => i.id === product.id);

      if (existing) {
        return c.map((i) =>
          i.id === product.id
            ? { ...i, qty: (i.qty ?? 0) + qty }
            : i
        );
      }

      return [...c, { ...product, qty }];
    });

    notify(`${product.name} added to cart!`);
  };

  const removeFromCart = (id: Product["id"]) => {
    setCart((c) => c.filter((i) => i.id !== id));
  };

  const updateQty = (id: Product["id"], qty: number) => {
    if (qty < 1) return removeFromCart(id);

    setCart((c) =>
      c.map((i) =>
        i.id === id ? { ...i, qty } : i
      )
    );
  };

  // ── Wishlist ─────────────────────────────────────────────────────────────
  const [wishlist, setWishlist] = useState<Product["id"][]>([]);

  const toggleWishlist = (id: Product["id"]) => {
    setWishlist((w) =>
      w.includes(id)
        ? w.filter((x) => x !== id)
        : [...w, id]
    );
  };

  // ── Notifications ────────────────────────────────────────────────────────
  const [notification, setNotification] = useState<Notification>(null);

  const notify = (msg: string, type: Notification extends any ? "success" | "error" | "info" : any = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ── Order ────────────────────────────────────────────────────────────────
  const [orderNum] = useState<string>(
    `NV-${Math.floor(Math.random() * 90000 + 10000)}`
  );

  // ── Shared props ─────────────────────────────────────────────────────────
  const sharedProps = {
    cart,
    wishlist,
    onAddToCart: addToCart,
    onToggleWishlist: toggleWishlist,
    onNavigate: setPage,
    onSelectProduct: setSelectedProduct,
    search,
    onSearchChange: setSearch,
    notification,
    onNotify: notify,
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (page === "landing")
    return (
      <LandingPage
        {...sharedProps}
        onSetCategory={setCategory}
      />
    );

  if (page === "browse")
    return (
      <BrowsePage
        {...sharedProps}
        category={category}
        onSetCategory={setCategory}
      />
    );

  if (page === "product" && selectedProduct)
    return (
      <ProductPage
        {...sharedProps}
        product={selectedProduct}
      />
    );

  if (page === "wishlist")
    return <WishlistPage {...sharedProps} />;

  if (page === "checkout")
    return (
      <CheckoutPage
        {...sharedProps}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onUpdateQty={updateQty}
        onRemoveFromCart={removeFromCart}
        orderNum={orderNum}
      />
    );

  return null;
}