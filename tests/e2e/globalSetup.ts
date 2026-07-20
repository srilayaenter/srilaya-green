import { chromium, FullConfig } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";
import * as fs from "fs";
import * as path from "path";

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3001";
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL,
    extraHTTPHeaders: bypassSecret
      ? { "x-vercel-protection-bypass": bypassSecret }
      : {},
  });

  // Establish Vercel preview bypass cookie (no-op locally or on production)
  if (bypassSecret) {
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.close();
  }

  // Save admin session
  const authDir = path.join(__dirname, ".auth");
  fs.mkdirSync(authDir, { recursive: true });

  const adminPage = await context.newPage();
  await loginAsAdmin(adminPage);
  await context.storageState({ path: path.join(authDir, "admin.json") });
  await browser.close();
}
