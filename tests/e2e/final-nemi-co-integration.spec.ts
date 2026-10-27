import { test, expect } from "@playwright/test";

test.describe("Final NEMI-CO AI Coding Agent Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1648, height: 928 });
  });

  test("1. Landing page renders correctly with NEMI-CO branding and Workspace link", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // Check brand in header
    await expect(page.locator("body")).toContainText("NEMI-CO");

    // Check navigation contains Workspace link
    const workspaceLink = page.getByRole("link", { name: "Workspace" }).first();
    await expect(workspaceLink).toBeVisible();

    // Take screenshot of landing page
    await page.screenshot({ path: "/Users/abhigurjar/.gemini/antigravity-ide/brain/31346f5b-68ed-4999-99db-06217d41d8e0/final_landing_page.png" });
  });

  test("2. Navigating to Workspace opens the complete AI coding environment", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    
    // Click Workspace link
    await page.getByRole("link", { name: "Workspace" }).first().click();
    await page.waitForURL("**/workspace");

    // Verify workspace shell
    await expect(page.getByTestId("workspace-shell")).toBeVisible();

    // Verify all 4 columns + terminal matching reference image:
    // 1. Project Explorer (Left)
    await expect(page.getByTestId("project-explorer")).toBeVisible();
    await expect(page.getByText("my-app")).toBeVisible();
    await expect(page.getByTestId("project-explorer").getByText("App.tsx")).toBeVisible();

    // 2. Monaco Editor (Center)
    await expect(page.getByTestId("monaco-editor")).toBeVisible();
    await expect(page.getByTestId("monaco-editor").getByText("App.tsx")).toBeVisible();

    // 3. Live Frontend Preview (Center-Right)
    await expect(page.getByText("Preview", { exact: true })).toBeVisible();
    await expect(page.getByText("http://localhost:5173").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Clicked \d+ times/i })).toBeVisible();

    // 4. NEMI Robot Panel (Right)
    const robotPanel = page.getByTestId("nemi-robot-panel");
    await expect(robotPanel).toBeVisible();
    await expect(robotPanel.getByText("AI Coding Agent", { exact: true })).toBeVisible();
    await expect(robotPanel.getByText("Build successful!")).toBeVisible();
    await expect(page.getByPlaceholder("Ask NEMI anything...")).toBeVisible();

    // 5. Terminal (Bottom)
    await expect(page.getByTestId("terminal-panel")).toBeVisible();
    await expect(page.getByTestId("terminal-panel").getByText("Terminal")).toBeVisible();

    // Settle layout and ensure zero scroll offset
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Capture initial workspace screenshot
    await page.screenshot({ path: "/Users/abhigurjar/.gemini/antigravity-ide/brain/31346f5b-68ed-4999-99db-06217d41d8e0/final_workspace_reference_match.png" });
  });

  test("3. Interactive elements: counter preview, editor typing, and terminal execution", async ({ page }) => {
    await page.goto("http://localhost:3000/workspace");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();

    // 1. Click counter button inside Live Frontend Preview
    const counterBtn = page.getByRole("button", { name: /Clicked \d+ times/i });
    await expect(counterBtn).toBeVisible();
    await counterBtn.click();
    await expect(page.getByRole("button", { name: /Clicked 4 times/i })).toBeVisible();

    // 2. Run terminal command
    const termInput = page.locator("input[placeholder*='npm run']");
    if (await termInput.isVisible()) {
      await termInput.fill("echo 'NEMI-CO System Operational'");
      await termInput.press("Enter");
      await page.waitForTimeout(1000);
      await expect(page.getByTestId("terminal-panel")).toContainText("NEMI-CO System Operational");
    }

    // 3. Send AI instruction to NEMI robot
    const chatInput = page.getByPlaceholder("Ask NEMI anything...");
    await chatInput.fill("Add a reset button to App.tsx");
    await chatInput.press("Enter");

    // Verify robot reactions and response
    await page.waitForTimeout(2000);
    await expect(page.getByTestId("nemi-robot-panel")).toContainText("reset");

    // Capture updated workspace screenshot
    await page.screenshot({ path: "/Users/abhigurjar/.gemini/antigravity-ide/brain/31346f5b-68ed-4999-99db-06217d41d8e0/final_workspace_after_agent_edit.png" });
  });
});
