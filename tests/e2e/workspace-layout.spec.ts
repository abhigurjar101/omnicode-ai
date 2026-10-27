import { test, expect } from "@playwright/test";

test.describe("NEMI-CODE Workspace Desktop Geometry & Panel Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1648, height: 928 });
    await page.goto("/workspace");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
  });

  test("All reference panels are properly positioned and sized at 1648x928", async ({ page }) => {
    // 1. Navigation header
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();

    // 2. Project Explorer on the left
    const explorer = page.getByTestId("project-explorer");
    await expect(explorer).toBeVisible();
    const explorerBox = await explorer.boundingBox();
    expect(explorerBox).toBeTruthy();
    expect(explorerBox!.x).toBeLessThan(100);

    // 3. Execution & Output panel in center-left
    const execution = page.getByTestId("execution-output");
    await expect(execution).toBeVisible();

    // 4. AI Next Code panel
    const nextCode = page.getByTestId("ai-next-code");
    await expect(nextCode).toBeVisible();

    // 5. Monaco Editor in center
    const editor = page.getByTestId("monaco-editor");
    await expect(editor).toBeVisible();
    const editorBox = await editor.boundingBox();
    expect(editorBox).toBeTruthy();
    expect(editorBox!.width).toBeGreaterThan(400);

    // 6. Terminal spanning bottom of central section
    const terminal = page.getByTestId("terminal-panel");
    await expect(terminal).toBeVisible();
    const termBox = await terminal.boundingBox();
    expect(termBox).toBeTruthy();
    expect(termBox!.y).toBeGreaterThan(600);

    // 7. NEMI Agent chat in lower-right
    const chat = page.getByTestId("nemi-chat");
    await expect(chat).toBeVisible();
    const chatBox = await chat.boundingBox();
    expect(chatBox).toBeTruthy();
    expect(chatBox!.x).toBeGreaterThan(1200);

    // 8. Robot canvas in the right background
    const robot = page.getByTestId("nemi-robot");
    await expect(robot).toBeVisible();
  });

  test("Execution & Output tabs and JSON render correctly", async ({ page }) => {
    const execPanel = page.getByTestId("execution-output");
    await expect(execPanel.getByText("Execution & Output")).toBeVisible();
    await expect(execPanel.getByText("Live")).toBeVisible();
    await expect(execPanel.getByRole("button", { name: "Output" })).toBeVisible();
    await expect(execPanel.getByRole("button", { name: "API Response" })).toBeVisible();
    await expect(execPanel.getByRole("button", { name: "Test Results" })).toBeVisible();
    await expect(execPanel.getByRole("button", { name: "Logs" })).toBeVisible();

    // Switch to API Response tab
    await execPanel.getByRole("button", { name: "API Response" }).click();
    await expect(execPanel.getByText("HTTP 200 OK — POST /api/agent/run")).toBeVisible();

    // Switch to Test Results tab
    await execPanel.getByRole("button", { name: "Test Results" }).click();
    await expect(execPanel.getByText("test_agent_workflow.py")).toBeVisible();
  });

  test("Terminal CLI output and tabs work correctly", async ({ page }) => {
    const termPanel = page.getByTestId("terminal-panel");
    await expect(termPanel.getByText("Terminal")).toBeVisible();
    await expect(termPanel.getByText("npm run dev")).toBeVisible();
    await expect(termPanel.getByText("Ready in 1.2s")).toBeVisible();

    // Problems tab
    await termPanel.getByRole("button", { name: /Problems/i }).click();
    await expect(termPanel.getByText(/Problems/i)).toBeVisible();

    // Agent Output tab
    await termPanel.getByRole("button", { name: /Agent Output/i }).click();
    await expect(termPanel.getByText(/Agent Output/i)).toBeVisible();
  });
});
