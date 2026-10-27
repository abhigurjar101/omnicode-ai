import { test } from "@playwright/test";

const OUTPUT_DIR = "/Users/abhigurjar/.gemini/antigravity/brain/90414bd5-d345-429c-b8d8-d93583d110e9";

test("Capture high-fidelity screenshots of Reconstructed Landing Hero", async ({ page }) => {
  // 1. Capture Desktop 1648 x 928 (matching Junca Studio reference screenshot dimension)
  await page.setViewportSize({ width: 1648, height: 928 });
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  // Wait 3.5 seconds to allow Three.js canvas, materials, lighting, and CRT screen typing animation to render
  await page.waitForTimeout(3500);
  await page.screenshot({
    path: `${OUTPUT_DIR}/reconstructed_desktop_1648x928.png`,
    fullPage: false,
  });

  // 2. Capture Mobile Landing Page (390 x 844)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: `${OUTPUT_DIR}/reconstructed_mobile_390x844.png`,
    fullPage: false,
  });
});
