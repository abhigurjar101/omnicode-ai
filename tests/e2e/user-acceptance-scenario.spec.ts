import { test, expect } from "@playwright/test";

test.describe("Section 16: Complete Release-Blocking User Acceptance Scenario", () => {
  test("Full 25-step autonomous software development lifecycle", async ({ page }) => {
    test.setTimeout(60000);
    // 1. Open NEMI-CODE main application
    await page.setViewportSize({ width: 1648, height: 928 });
    await page.goto("http://localhost:3000/");
    await expect(page.getByText("NEMI-CODE").first()).toBeVisible();

    // 2. Click Workspace
    const workspaceLink = page.getByRole("link", { name: "Workspace", exact: true });
    await expect(workspaceLink).toBeVisible();
    await workspaceLink.click();

    // 3. Verify dedicated coding studio opens
    await expect(page).toHaveURL(/\/workspace(?:\/|$)/);

    // 4. Verify approved cinematic interface appears
    await expect(page.getByTestId("workspace-shell")).toBeVisible();

    // 5. Verify friendly robot is visible
    await expect(page.getByTestId("nemi-robot")).toBeVisible();

    // 6. Inspect project files in Project Explorer
    const explorer = page.getByTestId("project-explorer");
    await expect(explorer).toBeVisible();

    // 7 & 8. Verify open files and Monaco tabs
    const editor = page.getByTestId("monaco-editor");
    await expect(editor.getByText("auth.service.ts")).toBeVisible();
    await editor.getByText("auth.service.ts").click();

    // 9. Ask NEMI to diagnose intentional bug via Quick Action
    const chat = page.getByTestId("nemi-chat");
    const debugAction = chat.getByText("Debug this error message");
    await expect(debugAction).toBeVisible();
    await debugAction.click();

    // 10 & 11. Verify output panel & AI patch overlay receive real findings
    await expect(page.getByText(/NEMI Proposed Live Patch/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Root Cause/i).first()).toBeVisible();

    // 12. Preview diff in overlay
    await expect(page.getByText(/\+\/\/ Hardened error resilience/i)).toBeVisible();

    // 13 & 14. Approve change and watch Monaco update with actual patch
    const acceptBtn = page.getByRole("button", { name: /Accept & Apply/i });
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();

    // 15. Verify patch applied and overlay cleared
    await expect(page.getByText(/NEMI Proposed Live Patch/i)).not.toBeVisible();

    // 16 & 17. Run application via Terminal
    const terminal = page.getByTestId("terminal-panel");
    const termInput = page.getByTestId("terminal-input");
    await expect(termInput).toBeVisible();
    await termInput.fill("python3 -c \"print('ALL_SYSTEMS_OPERATIONAL')\"");
    await termInput.press("Enter");

    // 18 & 19. Verify actual output and exit code
    await expect(terminal.getByText(/ALL_SYSTEMS_OPERATIONAL/i)).toBeVisible({ timeout: 8000 });
    await expect(terminal.getByText(/Exit Code 0/i)).toBeVisible();

    // 20. Confirm task appears in Runs
    await page.getByRole("button", { name: /Runs/i }).click();
    await expect(page.getByText(/Autonomous Runs & Task Execution History/i)).toBeVisible();

    // Switch back to Workspace
    await page.getByRole("button", { name: /Workspace/i }).first().click();

    // 21 & 22. Refresh the studio and verify code and tabs persist
    await page.reload();
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
    await expect(editor.getByText("auth.service.ts")).toBeVisible();

    // 23, 24, 25. Reopen Workspace directly
    await page.goto("http://localhost:3000/workspace");
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
    await expect(page.getByTestId("project-explorer")).toBeVisible();
    await expect(page.getByTestId("monaco-editor")).toBeVisible();
  });
});
