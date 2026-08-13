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
    await page.goto("/cart", { waitUntil: "networkidle" });
    let removeBtn = page.getByRole("button", { name: /remove/i }).first();
    while (await removeBtn.isVisible().catch(() => false)) {
      await removeBtn.click();
      await page.waitForTimeout(500);
      removeBtn = page.getByRole("button", { name: /remove/i }).first();
    }
  } catch {
    // ignore cleanup errors
  }
}
