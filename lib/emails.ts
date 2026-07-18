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
