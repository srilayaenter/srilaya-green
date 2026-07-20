import { BRAND } from "./brand";

interface OrderEmailItem {
  title: string;
  size: string;
  quantity: number;
  price: number;
}

export function buildOrderConfirmationEmail(opts: {
  customerName: string;
  orderId: string;
  items: OrderEmailItem[];
  subtotal: number;
  taxTotal: number;
  shippingFee: number;
  total: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isCod?: boolean;
}) {
  const shortId = opts.orderId.slice(0, 8).toUpperCase();
  const rows = opts.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;">${i.title} (${i.size}) × ${i.quantity}</td>
        <td style="padding:8px 0;text-align:right;">₹${(i.price * i.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const introLine = opts.isCod
    ? `Hi ${opts.customerName}, your order is confirmed! Please keep <strong>₹${opts.total.toFixed(2)}</strong> ready to pay on delivery — by <strong>Cash or UPI</strong>. No card machine will be available.`
    : `Hi ${opts.customerName}, thanks for your order!`;

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#212121;">
      <h2 style="color:#006A38;">Order Confirmed — #${shortId}</h2>
      <p>${introLine}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
      <table style="width:100%;border-top:1px solid #E0E0E0;padding-top:8px;">
        <tr><td>Subtotal</td><td style="text-align:right;">₹${opts.subtotal.toFixed(2)}</td></tr>
        <tr><td>Tax</td><td style="text-align:right;">₹${opts.taxTotal.toFixed(2)}</td></tr>
        <tr><td>Shipping</td><td style="text-align:right;">₹${opts.shippingFee.toFixed(2)}</td></tr>
        <tr style="font-weight:bold;"><td>Total</td><td style="text-align:right;">₹${opts.total.toFixed(2)}</td></tr>
      </table>
      <p style="margin-top:16px;">Shipping to: ${opts.address}, ${opts.city}, ${opts.state} ${opts.zipCode}</p>
      ${
        opts.isCod
          ? `<div style="margin-top:16px;background:#FFF8E1;border-radius:8px;padding:14px 18px;font-size:12px;color:#8D6E63;"><strong>💵 Pay on Delivery:</strong> Our delivery partner accepts <strong>Cash or UPI</strong> at the time of delivery. Please keep the exact amount ready. No card/POS machine will be available.</div>`
          : ""
      }
    </div>
  `;
}

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://srilayagreen.com";

const footer = `
  <div style="background:#f5f5f5;padding:20px 32px;text-align:center;font-size:12px;color:#999;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 6px;">${BRAND.name} | ${BRAND.address}</p>
    <p style="margin:0;">📞 ${BRAND.phone} &nbsp;|&nbsp; ✉️ ${BRAND.email}</p>
  </div>`;

const header = `
  <div style="background:#006A38;padding:28px 32px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900;">${BRAND.name}</h1>
    <p style="color:#e8f5e9;margin:6px 0 0;font-size:13px;">${BRAND.tagline}</p>
  </div>`;

export function buildDispatchEmail(opts: {
  customerName: string;
  shortId: string;
  courier: string;
  trackingNumber: string;
  trackingUrl?: string | null;
  estimatedDelivery?: Date | null;
}) {
  const trackingLine = opts.trackingUrl
    ? `<a href="${opts.trackingUrl}" style="color:#006A38;font-weight:bold;">Track your package →</a>`
    : `Tracking No: <strong>${opts.trackingNumber}</strong> via ${opts.courier}`;

  const etaLine = opts.estimatedDelivery
    ? `<p style="margin:8px 0 0;color:#555;font-size:13px;">Estimated delivery: <strong>${new Date(opts.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></p>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      ${header}
      <div style="background:#e8f5e9;border-left:4px solid #006A38;padding:20px 32px;">
        <h2 style="color:#1b5e20;margin:0 0 6px;font-size:18px;">🚚 Your Order is On Its Way!</h2>
        <p style="color:#2e7d32;margin:0;font-size:14px;">
          Hi <strong>${opts.customerName}</strong>! Your order <strong>#${opts.shortId}</strong> has been dispatched.
        </p>
      </div>
      <div style="padding:28px 32px;">
        <div style="background:#f9f9f9;border-radius:8px;padding:20px 24px;font-size:14px;color:#424242;">
          <p style="margin:0 0 8px;font-weight:bold;color:#212121;">Shipment Details</p>
          <p style="margin:0;">Courier: <strong>${opts.courier}</strong></p>
          <p style="margin:8px 0 0;">${trackingLine}</p>
          ${etaLine}
        </div>
        <div style="margin-top:24px;text-align:center;">
          <a href="${BASE_URL}/track"
            style="display:inline-block;background:#006A38;color:#fff;font-weight:bold;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:14px;">
            Track Your Order
          </a>
        </div>
      </div>
      ${footer}
    </div>`;
}

export function buildDeliveredEmail(opts: { customerName: string; shortId: string }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      ${header}
      <div style="background:#e8f5e9;border-left:4px solid #006A38;padding:20px 32px;">
        <h2 style="color:#1b5e20;margin:0 0 6px;font-size:18px;">✅ Order Delivered!</h2>
        <p style="color:#2e7d32;margin:0;font-size:14px;">
          Hi <strong>${opts.customerName}</strong>! Your order <strong>#${opts.shortId}</strong> has been delivered. Enjoy!
        </p>
      </div>
      <div style="padding:28px 32px;text-align:center;">
        <p style="color:#555;font-size:14px;margin:0 0 24px;">
          We hope you love your order. If you have a moment, share how it went — it helps other customers discover our bioenzyme products.
        </p>
        <a href="${BASE_URL}/product"
          style="display:inline-block;background:#006A38;color:#fff;font-weight:bold;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:14px;margin-right:12px;">
          Shop Again
        </a>
        <a href="${BASE_URL}/track"
          style="display:inline-block;border:2px solid #006A38;color:#006A38;font-weight:bold;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;">
          View Order
        </a>
      </div>
      <div style="background:#e8f5e9;margin:0 32px 28px;border-radius:8px;padding:14px 18px;font-size:12px;color:#2e7d32;text-align:center;">
        If anything is wrong with your order, you can raise a return request within 7 days.
      </div>
      ${footer}
    </div>`;
}
