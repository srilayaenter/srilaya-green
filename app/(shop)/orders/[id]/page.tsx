import OrderVerification from "./OrderVerification";

// No DB lookup happens here. Doing an existence check before verification
// (e.g. notFound() for a missing order) would itself leak whether an order
// exists via a distinguishable page response — the /api/orders/[id]/verify
// endpoint is the only place order existence is checked, and it responds
// identically whether the order is missing or the identity doesn't match.
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderVerification orderId={id} />;
}
