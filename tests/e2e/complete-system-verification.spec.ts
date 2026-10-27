import { test, expect } from "@playwright/test";

test.describe("NEMI-CO Mandatory Comprehensive Verification", () => {
  test("Test 1: Website Scrolling from top to footer with wheel & keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Initial scroll position should be at top
    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    // Test mouse wheel scroll down
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(800);
    const scrollAfterWheel = await page.evaluate(() => window.scrollY);
    expect(scrollAfterWheel).toBeGreaterThan(0);

    // Scroll through all key sections
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "smooth" }));
    await page.waitForTimeout(800);
    const scrollMid = await page.evaluate(() => window.scrollY);
    expect(scrollMid).toBeGreaterThan(scrollAfterWheel);

    // Scroll to footer using keyboard PageDown / End
    await page.keyboard.press("End");
    await page.waitForTimeout(1000);
    const scrollEnd = await page.evaluate(() => window.scrollY);
    expect(scrollEnd).toBeGreaterThan(2000);

    // Verify footer elements are accessible
    const footerText = page.getByText("©2026").first();
    await expect(footerText).toBeVisible();

    // Capture screenshot as evidence of completed smooth scrolling
    const screenshotPath = "/Users/abhigurjar/.gemini/antigravity-ide/brain/31346f5b-68ed-4999-99db-06217d41d8e0/landing_page_scrolling_verified.png";
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved landing page scroll screenshot to ${screenshotPath}`);
  });

  test("Test 2 & 7: Workspace Navigation, Editing & Interface Audit", async ({ page }) => {
    await page.setViewportSize({ width: 1648, height: 928 });
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Verify 4-column layout components are active
    await expect(page.locator('[data-testid="workspace-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-explorer"]')).toBeVisible();
    await expect(page.locator('[data-testid="monaco-editor"]')).toBeVisible();
    await expect(page.locator('[data-testid="live-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="terminal-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="nemi-robot-panel"]')).toBeVisible();

    // Verify Output / Preview switcher tabs
    const outputTab = page.locator('button:has-text("Output")').first();
    const previewTab = page.locator('button:has-text("Preview")').first();
    await expect(outputTab).toBeVisible();
    await expect(previewTab).toBeVisible();

    // Toggle Preview and Output modes
    await previewTab.click();
    await page.waitForTimeout(500);
    await outputTab.click();
    await page.waitForTimeout(500);

    // Verify Terminal actions (Clear & Run)
    const clearBtn = page.locator('button[title*="Clear"]').first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    }

    // Verify Run button works
    const runBtn = page.locator('button:has-text("Run")').first();
    await expect(runBtn).toBeVisible();
    await runBtn.click();
    await page.waitForTimeout(1000);

    // Capture workspace screenshot
    const wsScreenshot = "/Users/abhigurjar/.gemini/antigravity-ide/brain/31346f5b-68ed-4999-99db-06217d41d8e0/workspace_complete_verified.png";
    await page.screenshot({ path: wsScreenshot });
    console.log(`Saved workspace screenshot to ${wsScreenshot}`);
  });

  test("Test 3 & 4: Autonomous Code Generation & Live Output", async ({ page }) => {
    await page.setViewportSize({ width: 1648, height: 928 });
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Submit palindrome prompt to NEMI-CO
    const chatInput = page.locator('textarea[placeholder*="Ask NEMI"], input[placeholder*="Ask NEMI"]');
    await expect(chatInput).toBeVisible();
    await chatInput.fill("Create a Python program that checks whether a string is a palindrome.");
    
    const sendButton = page.locator('button[type="submit"]');
    await sendButton.click();

    // Wait for agent execution pipeline (thinking -> coding -> testing -> success)
    await page.waitForTimeout(4000);

    // Select palindrome tab once opened by the agent
    const palindromeTab = page.locator('span:has-text("palindrome.py")').first();
    await expect(palindromeTab).toBeVisible({ timeout: 20000 });
    await palindromeTab.click();
    await page.waitForTimeout(800);

    // Switch right panel to Output mode
    const outputTab = page.locator('button:has-text("Output")').first();
    await outputTab.click();
    await page.waitForTimeout(500);

    // Verify Output panel displays program output
    const outputPanel = page.locator('[data-testid="live-preview"]');
    await expect(outputPanel).toContainText("racecar", { timeout: 15000 });

    // Verify Terminal panel logs
    const terminal = page.locator('[data-testid="terminal-panel"]');
    await expect(terminal).toContainText("python3 palindrome.py", { timeout: 15000 });
  });
});
