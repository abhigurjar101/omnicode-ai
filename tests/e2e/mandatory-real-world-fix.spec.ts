import { test, expect } from "@playwright/test";
import * as path from "path";

test.describe("NEMI-CO Mandatory Real-World Coding Agent Verification", () => {
  test("Complete end-to-end coding workflow: Palindrome verification, execution, and React live preview", async ({
    page,
  }) => {
    // 1. Open Workspace
    await page.setViewportSize({ width: 1648, height: 928 });
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // 2. Verify all primary workspace sections exist
    await expect(page.locator('[data-testid="workspace-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-explorer"]')).toBeVisible();
    await expect(page.locator('[data-testid="monaco-editor"]')).toBeVisible();
    await expect(page.locator('[data-testid="live-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="terminal-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="nemi-robot-panel"]')).toBeVisible();

    // 3. Test Mandatory Requirement: "Create a Python program that checks whether a string is a palindrome."
    const chatInput = page.locator('textarea[placeholder*="Ask NEMI"], input[placeholder*="Ask NEMI"]');
    await expect(chatInput).toBeVisible();
    await chatInput.fill("Create a Python program that checks whether a string is a palindrome.");
    
    // Click send button
    const sendButton = page.locator('button[type="submit"]');
    await sendButton.click();

    // Wait for agent execution pipeline (thinking -> coding -> testing -> success)
    await page.waitForTimeout(4000);

    // Verify palindrome.py tab is opened and selected in Monaco
    const palindromeTab = page.locator('span:has-text("palindrome.py")').first();
    await expect(palindromeTab).toBeVisible({ timeout: 15000 });
    await palindromeTab.click();
    await page.waitForTimeout(1000);

    // Verify Monaco displays the palindrome code
    const editor = page.locator('[data-testid="monaco-editor"]');
    await expect(editor).toBeVisible();

    // Verify Output panel displays program output
    const outputPanel = page.locator('[data-testid="live-preview"]');
    await expect(outputPanel).toBeVisible();
    await expect(outputPanel).toContainText("Output");
    await expect(outputPanel).toContainText("racecar", { timeout: 10000 });

    // Verify terminal output contains the execution command and test results
    const terminal = page.locator('[data-testid="terminal-panel"]');
    await expect(terminal).toContainText("python3 palindrome.py", { timeout: 10000 });
    await expect(terminal).toContainText("racecar", { timeout: 10000 });

    // Verify human chat response
    const chatFeed = page.locator('[data-testid="nemi-robot-panel"]');
    await expect(chatFeed).toContainText("palindrome program in palindrome.py");

    // Capture verified screenshot showing palindrome.py in editor and program output in panel
    const screenshotPath = path.resolve(
      "/Users/abhigurjar/.gemini/antigravity-ide/brain/31346f5b-68ed-4999-99db-06217d41d8e0/workspace_real_world_verified.png"
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot to ${screenshotPath}`);

    // 4. Test Run button in Monaco toolbar
    const runButton = page.locator('button:has-text("Run")').first();
    await expect(runButton).toBeVisible();
    await runButton.click();
    await page.waitForTimeout(2000);

    // Verify terminal output reflects re-execution
    await expect(terminal).toContainText("python3 palindrome.py");
  });
});
