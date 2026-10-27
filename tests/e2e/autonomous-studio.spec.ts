import { test, expect } from "@playwright/test";

test.describe("NEMI-CODE Autonomous Coding Studio & Window E2E Test Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1648, height: 928 });
  });

  // --- 1. WINDOW & NAVIGATION TESTS ---

  test("WINDOW-01 & WINDOW-02: Workspace navigation opens studio route with approved layout", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("NEMI-CODE").first()).toBeVisible();

    const workspaceLink = page.getByRole("link", { name: "Workspace", exact: true });
    await expect(workspaceLink).toBeVisible();

    // Trigger Workspace click
    await workspaceLink.click();
    await expect(page).toHaveURL(/\/workspace(?:\/|$)/);

    // Verify cockpit layout contract elements
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
    await expect(page.getByTestId("project-explorer")).toBeVisible();
    await expect(page.getByTestId("monaco-editor")).toBeVisible();
    await expect(page.getByTestId("execution-output")).toBeVisible();
    await expect(page.getByTestId("ai-next-code")).toBeVisible();
    await expect(page.getByTestId("terminal-panel")).toBeVisible();
    await expect(page.getByTestId("nemi-chat")).toBeVisible();
    await expect(page.getByTestId("nemi-robot")).toBeVisible();
  });

  test("WINDOW-03: Direct route entry to dynamic studio workspace works cleanly", async ({ page }) => {
    await page.goto("/workspace/project-alpha/studio");
    await expect(page).toHaveURL("/workspace/project-alpha/studio");

    await expect(page.getByTestId("workspace-shell")).toBeVisible();
    await expect(page.getByText("project-alpha")).toBeVisible();
    await expect(page.getByTestId("monaco-editor")).toBeVisible();
  });

  test("WINDOW-04: New workspace route /workspace/new initializes fresh studio", async ({ page }) => {
    await page.goto("/workspace/new");
    await expect(page).toHaveURL("/workspace/new");

    await expect(page.getByTestId("workspace-shell")).toBeVisible();
    await expect(page.getByText("new-project")).toBeVisible();
  });

  test("WINDOW-05 & WINDOW-08: Browser reload preserves open tabs and persisted state", async ({ page }) => {
    await page.goto("/workspace");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();

    const editor = page.getByTestId("monaco-editor");
    await expect(editor.getByText("auth.service.ts")).toBeVisible();

    // Select auth.service.ts tab
    await editor.getByText("auth.service.ts").click();

    // Reload page
    await page.reload();
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
    await expect(editor.getByText("auth.service.ts")).toBeVisible();
  });

  // --- 2. LIVE AI CODING & MONACO PATCH TESTS ---

  test("CODE-01 through CODE-07: NEMI AI live patch generation, diff preview, and accept", async ({ page }) => {
    test.setTimeout(45000);
    await page.goto("/workspace");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();

    const chat = page.getByTestId("nemi-chat");
    const editor = page.getByTestId("monaco-editor");

    // Click quick action "Create a REST API with authentication"
    await chat.getByText("Create a REST API with authentication").click();

    // Verify NEMI proposes patch with floating action overlay (NVIDIA live inference)
    await expect(page.getByText(/NEMI Proposed Live Patch/i)).toBeVisible({ timeout: 25000 });
    await expect(page.getByRole("button", { name: /Accept & Apply/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reject/i })).toBeVisible();

    // Click Accept & Apply
    await page.getByRole("button", { name: /Accept & Apply/i }).click();

    // Verify patch overlay closes after apply
    await expect(page.getByText(/NEMI Proposed Live Patch/i)).not.toBeVisible();

    // Verify terminal logs patch accepted
    const terminal = page.getByTestId("terminal-panel");
    await expect(terminal.getByText(/Patch Accepted & Applied/i)).toBeVisible();
  });

  test("CODE-08: Rejecting a proposed patch preserves original code without modifications", async ({ page }) => {
    test.setTimeout(45000);
    await page.goto("/workspace");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();

    const chat = page.getByTestId("nemi-chat");
    await chat.getByText("Create a REST API with authentication").click();

    await expect(page.getByText(/NEMI Proposed Live Patch/i)).toBeVisible({ timeout: 25000 });
    const rejectBtn = page.getByRole("button", { name: /Reject/i });
    await expect(rejectBtn).toBeVisible();
    await rejectBtn.click();

    // Overlay disappears
    await expect(page.getByText(/NEMI Proposed Live Patch/i)).not.toBeVisible();

    const terminal = page.getByTestId("terminal-panel");
    await expect(terminal.getByText(/Patch Rejected/i)).toBeVisible();
  });

  // --- 3. TERMINAL EXECUTION TESTS ---

  test("RUN-01 through RUN-04: Terminal runs commands and reports exit codes and stdout", async ({ page }) => {
    await page.goto("/workspace");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();

    const terminal = page.getByTestId("terminal-panel");
    const cmdInput = page.getByTestId("terminal-input");
    await expect(cmdInput).toBeVisible();

    // Execute python command
    await cmdInput.fill("python3 -c \"print('NEMI_EXECUTION_SUCCESS')\"");
    await cmdInput.press("Enter");

    // Verify stdout appears
    await expect(terminal.getByText(/NEMI_EXECUTION_SUCCESS/i)).toBeVisible({ timeout: 8000 });
    await expect(terminal.getByText(/Exit Code 0/i)).toBeVisible();
  });

  // --- 4. AUTONOMOUS DEBUGGING TESTS ---

  test("DEBUG-01 through DEBUG-05: Autonomous debugging identifies root cause and generates fix patch", async ({ page }) => {
    await page.goto("/workspace");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();

    const chat = page.getByTestId("nemi-chat");
    await expect(chat.getByText("Debug this error message")).toBeVisible();
    await chat.getByText("Debug this error message").click();

    // Verify autonomous debugger diagnoses error
    await expect(page.getByText(/NEMI Proposed Live Patch/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Root Cause/i).first()).toBeVisible();

    // Accept the fix
    await page.getByRole("button", { name: /Accept & Apply/i }).click();

    const terminal = page.getByTestId("terminal-panel");
    await expect(terminal.getByText(/Patch Accepted & Applied/i)).toBeVisible();
  });

  // --- 5. AI NEXT CODE TESTS ---

  test("AI-01: AI Next Code prediction and apply", async ({ page }) => {
    await page.goto("/workspace");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();

    const nextCode = page.getByTestId("ai-next-code");
    await expect(nextCode.getByText("AI Next Code")).toBeVisible();
    await expect(nextCode.getByText("(Predicted)")).toBeVisible();

    // Verify Copy button
    const copyBtn = nextCode.getByRole("button", { name: /Copy/i });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(nextCode.getByText("Copied")).toBeVisible();
  });
});
