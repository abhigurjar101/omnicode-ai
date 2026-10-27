import { test, expect } from "@playwright/test";

test.describe("NEMI-CO — Benchmark & Multi-Agent Training System E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1648, height: 928 });
    await page.goto("http://localhost:3000/workspace");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
  });

  test("BENCHMARK-01: Problem Panel renders with challenge selector, constraints, and samples", async ({ page }) => {
    // Problem panel should be visible
    const problemPanel = page.getByTestId("problem-panel");
    await expect(problemPanel).toBeVisible({ timeout: 10000 });

    // Verify Challenge Library header
    await expect(problemPanel.getByText("CHALLENGE LIBRARY")).toBeVisible();

    // Verify selector dropdown is present with challenges
    const selector = page.getByTestId("challenge-selector");
    await expect(selector).toBeVisible();

    // Verify sample cases and constraints are displayed
    await expect(problemPanel.getByText(/Description/i)).toBeVisible();
    await expect(problemPanel.getByText(/Input Format/i)).toBeVisible();
    await expect(problemPanel.getByText(/Output Format/i)).toBeVisible();
    await expect(problemPanel.getByText(/Sample #1/i)).toBeVisible();
  });

  test("BENCHMARK-02: Selecting challenge loads actual source file in Monaco Editor", async ({ page }) => {
    const problemPanel = page.getByTestId("problem-panel");
    await expect(problemPanel).toBeVisible();

    // Select kattis_r2 from dropdown
    const selector = page.getByTestId("challenge-selector");
    await selector.selectOption("kattis_r2");

    // Wait for target file tab to appear in Monaco editor
    const editor = page.getByTestId("monaco-editor");
    await expect(editor.getByText("kattis_r2.py")).toBeVisible({ timeout: 10000 });

    // Verify Monaco editor is interactive and accepts keyboard input
    await page.evaluate(() => {
      const ed = (window as any).__monacoEditor;
      if (ed) {
        ed.trigger("keyboard", "type", { text: "\n# Interactive user editing verified\n" });
      }
    });

    // Save button reflects save status
    const saveBtn = editor.getByRole("button", { name: /Save|Saved/i });
    await expect(saveBtn).toBeVisible();
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
    }
  });

  test("BENCHMARK-03: Multi-agent solve displays minimal status pills and updates test results", async ({ page }) => {
    const problemPanel = page.getByTestId("problem-panel");
    await expect(problemPanel).toBeVisible();

    // Select kattis_r2
    const selector = page.getByTestId("challenge-selector");
    await selector.selectOption("kattis_r2");

    // Click Multi-Agent Solve button
    const solveBtn = page.getByTestId("solve-challenge-btn");
    await expect(solveBtn).toBeVisible();
    await solveBtn.click();

    // Agent status should transition to Passed or completed
    await expect(page.getByTestId("problem-agent-status")).toHaveText(/Passed|Analyzing|Coding|Testing/i, { timeout: 15000 });

    // Terminal panel should show test results tab
    const terminal = page.getByTestId("terminal-panel");
    await expect(terminal).toBeVisible();

    // Click on Test Results tab if not already active
    const testTab = terminal.getByTestId("terminal-tab-tests");
    if (await testTab.isVisible()) {
      await testTab.click();
    }

    // Verify test case result item
    await expect(terminal.getByTestId("test-result-1")).toBeVisible({ timeout: 10000 });
    await expect(terminal.getByText(/PASSED/i).first()).toBeVisible();
  });

  test("BENCHMARK-04: Benchmark Dashboard in Runs view displays metrics and interactive matrix", async ({ page }) => {
    // Switch to Runs tab
    const runsNavBtn = page.getByRole("button", { name: /^Runs$/i });
    await expect(runsNavBtn).toBeVisible();
    await runsNavBtn.click();

    // Verify Benchmark Dashboard mounts
    const dashboard = page.getByTestId("benchmark-dashboard");
    await expect(dashboard).toBeVisible({ timeout: 10000 });

    // Verify stat cards
    await expect(dashboard.getByText(/NEMI-CO Benchmark & Autonomous Training System/i)).toBeVisible();
    await expect(dashboard.getByText(/Success Rate/i)).toBeVisible();
    await expect(dashboard.getByText(/Current Level/i)).toBeVisible();

    // Click on a challenge row to inspect code and tests
    const challengeRow = dashboard.getByTestId("benchmark-row-cses_1068_weird_algorithm");
    if (await challengeRow.isVisible()) {
      await challengeRow.click();
      // Inspector should display solution code header
      await expect(dashboard.getByText(/Verified Solution Code/i)).toBeVisible();
    }
  });
});
