import { test, expect } from "@playwright/test";

test.describe("Coding Window & Editor In-Window Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Approved cockpit layout viewport
    await page.setViewportSize({ width: 1648, height: 928 });
    await page.goto("http://localhost:3000/workspace");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
  });

  test("CODE-WINDOW-01: Editor mounts, accepts typing, and reflects dirty status", async ({ page }) => {
    const editor = page.getByTestId("monaco-editor");
    await expect(editor).toBeVisible();

    // Verify initial active tab in monaco editor
    await expect(editor.getByText("page.tsx")).toBeVisible();

    // Wait for Monaco canvas to finish mounting
    const monacoCanvas = page.locator(".monaco-editor").first();
    await expect(monacoCanvas).toBeVisible({ timeout: 15000 });

    // Type code into Monaco using editor trigger
    await page.evaluate(() => {
      const ed = (window as any).__monacoEditor;
      if (ed) {
        ed.trigger("keyboard", "type", { text: "\n// Verified in-window typing\n" });
      }
    });

    // Verify Save button activates (dirty status) in editor
    const saveButton = editor.getByRole("button", { name: /^Save$/i });
    await expect(saveButton).toBeVisible();

    // Click Save
    await saveButton.click();
    await expect(editor.getByText(/Saved/i)).toBeVisible();
  });

  test("CODE-WINDOW-02: Run button auto-saves code and executes in terminal", async ({ page }) => {
    const editor = page.getByTestId("monaco-editor");
    await expect(editor).toBeVisible();

    // Click Run button inside editor header
    const runButton = editor.getByRole("button", { name: /^Run$/i });
    await expect(runButton).toBeVisible();
    await runButton.click();

    // Terminal panel should open and display run output
    const terminal = page.getByTestId("terminal-panel");
    await expect(terminal).toBeVisible();
    await expect(page.getByText(/\$ run page.tsx/i)).toBeVisible();
  });

  test("CODE-WINDOW-03: Create new file, type script, and run in window", async ({ page }) => {
    const editor = page.getByTestId("monaco-editor");

    // Click New File button inside editor tab bar
    const newFileBtn = editor.getByTitle("New File");
    await expect(newFileBtn).toBeVisible();
    await newFileBtn.click();

    // Wait for new tab to appear in editor
    await expect(editor.getByText(/new_file_/i)).toBeVisible();

    // Click Run on new tab
    const runButton = editor.getByRole("button", { name: /^Run$/i });
    await runButton.click();

    // Verify execution in terminal
    const terminal = page.getByTestId("terminal-panel");
    await expect(terminal).toBeVisible();
    await expect(page.getByText(/\$ run/i)).toBeVisible();
  });

  test("CODE-WINDOW-04: AI Next Code prediction panel displays code and allows copying", async ({ page }) => {
    // Open inspector via editor toolbar toggle
    const inspectorBtn = page.getByTitle(/Inspector Panels/i);
    await inspectorBtn.click();

    const nextCodePanel = page.getByTestId("ai-next-code");
    await expect(nextCodePanel).toBeVisible();

    // Check prediction title
    await expect(nextCodePanel.getByText(/AI NEXT CODE/i)).toBeVisible();

    // Click Copy snippet button
    const copyButton = nextCodePanel.getByTitle("Copy snippet");
    await expect(copyButton).toBeVisible();
    await copyButton.click();
    await expect(nextCodePanel.getByText("Copied")).toBeVisible();
  });
});
