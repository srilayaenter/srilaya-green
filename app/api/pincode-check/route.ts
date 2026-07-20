import { NextRequest, NextResponse } from "next/server";

// PIN codes NOT serviceable (remotes/restricted areas)
const UNSERVICEABLE_PREFIXES = ["95", "79", "83", "84", "85", "86", "87", "88", "89", "19"];

// Metro / express zones — 2-day delivery
const EXPRESS_PREFIXES = ["11", "12", "40", "41", "42", "43", "44", "56", "57", "60", "66", "70"];

export async function GET(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get("pin") ?? "";

  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ serviceable: false, message: "Invalid PIN code." });
  }

  const prefix2 = pin.slice(0, 2);

  if (UNSERVICEABLE_PREFIXES.includes(prefix2)) {
    return NextResponse.json({
      serviceable: false,
      message: "Sorry, we don't deliver to this area yet.",
    });
  }

  const isExpress = EXPRESS_PREFIXES.includes(prefix2);
  return NextResponse.json({
    serviceable: true,
    message: `Delivery available to ${pin}`,
    eta: isExpress ? "Expected in 2–3 business days" : "Expected in 4–7 business days",
  });
}
