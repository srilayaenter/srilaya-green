import { Page, expect } from "@playwright/test";

/** Navigates to /product, opens the first product, and clicks Add to Cart. */
export async function addFirstProductToCart(page: Page, qty = 1): Promise<void> {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  await firstLink.waitFor({ state: "visible" });
  await firstLink.click();
  await page.waitForLoadState("networkidle");

  // Increase qty if needed
  for (let i = 1; i < qty; i++) {
    await page.getByRole("button", { name: "+" }).click();
    await page.waitForTimeout(200);
  }

  await page.getByRole("button", { name: /add to cart/i }).click();
  // Wait for the actual completion signal (server action + cart-count
  // refresh both resolved) instead of a flat delay — a fixed timeout can be
  // outlasted by a cold Vercel serverless function, and unlike a random
  // race, that fails identically on every retry.
  await expect(page.getByText("Added!")).toBeVisible({ timeout: 15000 });
}

/** Empties the cart by navigating to /cart and removing all items. */
export async function emptyCart(page: Page): Promise<void> {
  try {
    // "networkidle" waits for a 500ms gap with zero network activity —
    // on a deployed site that gap can never open (analytics beacons, bot-
    // protection scripts, etc. keep something in flight), so this hung for
    // the full 60s test-timeout instead of failing fast.
    await page.goto("/cart", { waitUntil: "domcontentloaded" });

    // Hard wall-clock deadline, well under the 60s test/hook budget, and
    // every individual operation is itself explicitly bounded and caught.
    // Confirmed by direct reproduction: the DOM correctly reaches the empty-
    // cart state, but the promise chain still didn't resolve in time — a
    // deterministic content-based waitFor()/.or() combinator wasn't
    // sufficient on its own, so this doesn't rely on any single Playwright
    // wait resolving cleanly; it just refuses to run past the deadline.
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      const btn = page.getByRole("button", { name: /remove/i }).first();
      const visible = await btn.isVisible().catch(() => false);
      if (!visible) break;
      await btn.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch {
    // ignore cleanup errors
  }
}
