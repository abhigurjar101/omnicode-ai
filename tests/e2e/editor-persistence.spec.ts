import { test, expect } from "@playwright/test";

test.describe("NEMI-CODE Monaco Editor, Explorer & AI Next Code", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1648, height: 928 });
    await page.goto("/workspace");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
  });

  test("Project Explorer selects and switches Monaco editor tabs", async ({ page }) => {
    const explorer = page.getByTestId("project-explorer");
    await expect(explorer.getByText("page.tsx").first()).toBeVisible();

    // Editor tab bar should have page.tsx active
    const editor = page.getByTestId("monaco-editor");
    await expect(editor.getByText("page.tsx")).toBeVisible();
    await expect(editor.getByText("auth.service.ts")).toBeVisible();

    // Click auth.service.ts tab
    await editor.getByText("auth.service.ts").click();
    await expect(editor.getByText("auth.service.ts")).toBeVisible();

    // Click api.ts tab
    await editor.getByText("api.ts").click();
    await expect(editor.getByText("api.ts")).toBeVisible();
  });

  test("AI Next Code displays predicted snippet and allows copying", async ({ page }) => {
    const nextCode = page.getByTestId("ai-next-code");
    await expect(nextCode.getByText("AI Next Code")).toBeVisible();
    await expect(nextCode.getByText("(Predicted)")).toBeVisible();
    await expect(nextCode.getByText("refreshToken")).toBeVisible();

    // Copy button
    const copyBtn = nextCode.getByRole("button", { name: /Copy/i });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(nextCode.getByText("Copied")).toBeVisible();
  });

  test("NEMI Agent quick action cards submit prompts to backend", async ({ page }) => {
    const chat = page.getByTestId("nemi-chat");
    await expect(chat.getByText("NEMI Agent").first()).toBeVisible();
    await expect(chat.getByText("What would you like to build today?")).toBeVisible();

    // Verify 4 quick action cards
    await expect(chat.getByText("Build a modern landing page")).toBeVisible();
    await expect(chat.getByText("Create a REST API with authentication")).toBeVisible();
    await expect(chat.getByText("Set up a database schema")).toBeVisible();
    await expect(chat.getByText("Debug this error message")).toBeVisible();

    // Click quick action
    await chat.getByText("Build a modern landing page").click();

    // Verify user message appears in conversation stream
    await expect(chat.getByText(/high-converting, modern landing page/i)).toBeVisible();
  });
});
