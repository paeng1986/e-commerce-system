import { useState } from "react";
import { CHECKOUT_STEPS, formatCurrency } from "@/assets/constants";
import { styles } from "@/assets/styles";
import { NavBar, Notification, StepIndicator } from "@/components/SharedUI";

// ── Step 0: Cart ─────────────────────────────────────────────────────────────
function CartStep({ cart, cartCount, cartTotal, onUpdateQty, onRemove, onNavigate, onNextStep }) {
  return (
    <div style={{ ...styles.page, padding: "40px 60px" }}>
      <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 32 }}>Shopping Cart</h1>
      <StepIndicator steps={CHECKOUT_STEPS} currentStep={0} />
      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Your cart is empty</div>
          <button style={styles.btn} onClick={() => onNavigate("browse")}>Start Shopping</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
          <div>
            {cart.map((item) => (
              <div key={item.id} style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #E5E7EB", marginBottom: 14, display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)", borderRadius: 12, width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>{item.img}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 10 }}>{item.category}</div>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #D1D5DB", borderRadius: 8, overflow: "hidden", width: "fit-content" }}>
                    <button style={{ border: "none", background: "#F9FAFB", padding: "6px 12px", cursor: "pointer", fontWeight: 700 }} onClick={() => onUpdateQty(item.id, item.qty - 1)}>−</button>
                    <span style={{ padding: "6px 14px", fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                    <button style={{ border: "none", background: "#F9FAFB", padding: "6px 12px", cursor: "pointer", fontWeight: 700 }} onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 18, color: "#1D4ED8", marginBottom: 8 }}>{formatCurrency(item.price * item.qty)}</div>
                  <button style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 13, fontWeight: 600 }} onClick={() => onRemove(item.id)}>Remove</button>
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
              <button style={{ ...styles.btn, width: "100%", marginTop: 16, padding: "14px" }} onClick={onNextStep}>Proceed to Checkout →</button>
              <button style={{ ...styles.btnGhost, width: "100%", marginTop: 8, padding: "12px", color: "#374151", border: "1px solid #D1D5DB" }} onClick={() => onNavigate("browse")}>Continue Shopping</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 1: Shipping info ────────────────────────────────────────────────────
function CheckoutInfoStep({ cart, cartTotal, onNextStep, onPrevStep }) {
  return (
    <div style={{ ...styles.page, padding: "40px 60px" }}>
      <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 32 }}>Checkout</h1>
      <StepIndicator steps={CHECKOUT_STEPS} currentStep={1} />
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

          {/* Shipping address */}
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

        {/* Order summary sidebar */}
        <div>
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB", position: "sticky", top: 100 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "#111827" }}>Your Order</div>
            {cart.map((item) => (
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
            <button style={{ ...styles.btn, width: "100%", marginTop: 20, padding: "14px" }} onClick={onNextStep}>Continue to Payment →</button>
            <button style={{ width: "100%", marginTop: 8, background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13 }} onClick={onPrevStep}>← Back to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Payment ──────────────────────────────────────────────────────────
function PaymentStep({ cart, cartTotal, onNextStep, onPrevStep }) {
  return (
    <div style={{ ...styles.page, padding: "40px 60px" }}>
      <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: "#0A0F1E", marginBottom: 32 }}>Payment</h1>
      <StepIndicator steps={CHECKOUT_STEPS} currentStep={2} />
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
                  <input placeholder="123" type="password" maxLength={4} style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <span style={{ fontSize: 13, color: "#047857" }}>Your payment is encrypted with 256-bit SSL security</span>
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
            <button style={{ ...styles.btn, width: "100%", marginTop: 20, padding: "14px", background: "linear-gradient(135deg, #10B981, #059669)", fontSize: 15 }} onClick={onNextStep}>
              🔒 Place Order
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 12 }}>By placing your order you agree to our Terms & Privacy Policy</p>
            <button style={{ width: "100%", marginTop: 4, background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13 }} onClick={onPrevStep}>← Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Order Confirmation ───────────────────────────────────────────────
function ConfirmationStep({ cart, cartTotal, orderNum, onNavigate, onNextStep }) {
  return (
    <div style={{ ...styles.page, padding: "40px 60px", textAlign: "center" }}>
      <StepIndicator steps={CHECKOUT_STEPS} currentStep={3} />
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
          {cart.map((item) => (
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
          <button style={styles.btn} onClick={onNextStep}>Track Order 📦</button>
          <button style={styles.btnOutline} onClick={() => onNavigate("browse")}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Order Tracking ───────────────────────────────────────────────────
function TrackingStep({ orderNum, onNavigate, onNextStep }) {
  return (
    <div style={{ ...styles.page, padding: "40px 60px" }}>
      <StepIndicator steps={CHECKOUT_STEPS} currentStep={4} />
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
          <button style={styles.btn} onClick={onNextStep}>Simulate Delivery ✓</button>
          <button style={styles.btnOutline} onClick={() => onNavigate("browse")}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Delivery & After-sales ───────────────────────────────────────────
function DeliveryStep({ orderNum, onNavigate, onNotify }) {
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  return (
    <div style={{ ...styles.page, padding: "40px 60px" }}>
      <StepIndicator steps={CHECKOUT_STEPS} currentStep={5} />
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
              <button
                style={{ ...styles.btnOutline, padding: "8px 16px", fontSize: 13, width: "100%" }}
                onClick={() => { if (title === "Return & Refund") document.getElementById("return-section").scrollIntoView({ behavior: "smooth" }); }}
              >
                {btn}
              </button>
            </div>
          ))}
        </div>

        {/* Return form */}
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
                <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)}
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
              <button
                style={{ ...styles.btn, background: "#EF4444" }}
                onClick={() => { if (returnReason) setReturnSubmitted(true); else onNotify("Please select a return reason", "error"); }}
              >
                Submit Return Request
              </button>
            </>
          )}
        </div>

        {/* Support */}
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
          <button style={styles.btn} onClick={() => onNavigate("landing")}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}

// ── Main CheckoutPage controller ─────────────────────────────────────────────
export default function CheckoutPage({
  cart, cartCount, cartTotal,
  onUpdateQty, onRemoveFromCart,
  onNavigate, onNotify,
  search, onSearchChange,
  wishlist,
  notification,
  orderNum,
}) {
  const [step, setStep] = useState(0);

  const navProps = {
    search,
    onSearchChange: (e) => { onSearchChange(e.target.value); onNavigate("browse"); },
    onLogoClick: () => onNavigate("landing"),
    onShopClick: () => onNavigate("browse"),
    onWishlistClick: () => onNavigate("wishlist"),
    onCartClick: () => setStep(0),
    cartCount,
    wishlistCount: wishlist.length,
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <NavBar {...navProps} />
      <Notification notification={notification} />

      {step === 0 && <CartStep cart={cart} cartCount={cartCount} cartTotal={cartTotal} onUpdateQty={onUpdateQty} onRemove={onRemoveFromCart} onNavigate={onNavigate} onNextStep={() => setStep(1)} />}
      {step === 1 && <CheckoutInfoStep cart={cart} cartTotal={cartTotal} onNextStep={() => setStep(2)} onPrevStep={() => setStep(0)} />}
      {step === 2 && <PaymentStep cart={cart} cartTotal={cartTotal} onNextStep={() => setStep(3)} onPrevStep={() => setStep(1)} />}
      {step === 3 && <ConfirmationStep cart={cart} cartTotal={cartTotal} orderNum={orderNum} onNavigate={onNavigate} onNextStep={() => setStep(4)} />}
      {step === 4 && <TrackingStep orderNum={orderNum} onNavigate={onNavigate} onNextStep={() => setStep(5)} />}
      {step === 5 && <DeliveryStep orderNum={orderNum} onNavigate={(p) => { onNavigate(p); }} onNotify={onNotify} />}
    </div>
  );
}
