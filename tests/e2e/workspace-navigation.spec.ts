import { test, expect } from "@playwright/test";

test.describe("NEMI-CODE Workspace Navigation & Layout Acceptance", () => {
  test("Workspace opens the NEMI-CODE coding UI with reference-inspired layout", async ({ page }) => {
    // 1. Set reference viewport: 1648 × 928
    await page.setViewportSize({
      width: 1648,
      height: 928,
    });

    // 2. Load Landing Page (Junca Studio reference)
    await page.goto("/");

    // 3. Confirm Junca Studio style navigation and branding
    await expect(page.getByText("NEMI-CODE").first()).toBeVisible();
    await expect(
      page.getByText(/We build (with AI agents|premium web|autonomous software)/i)
    ).toBeVisible();

    // 4. Click 'Workspace' link in top navigation
    const workspaceLink = page.getByRole("link", { name: "Workspace", exact: true });
    await expect(workspaceLink).toBeVisible();
    await workspaceLink.click();

    // 5. Verify navigation to /workspace route
    await expect(page).toHaveURL(/\/workspace(?:\/|$)/);

    // 6. Verify top navigation bar
    await expect(page.getByRole("navigation")).toBeVisible();

    // 7. Verify all required testing contract elements
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
    await expect(page.getByTestId("nemi-robot")).toBeVisible();
    await expect(page.getByTestId("project-explorer")).toBeVisible();
    await expect(page.getByTestId("monaco-editor")).toBeVisible();
    await expect(page.getByTestId("execution-output")).toBeVisible();
    await expect(page.getByTestId("ai-next-code")).toBeVisible();
    await expect(page.getByTestId("terminal-panel")).toBeVisible();
    await expect(page.getByTestId("nemi-chat")).toBeVisible();
  });

  test("Direct route entry to /workspace works cleanly", async ({ page }) => {
    await page.setViewportSize({
      width: 1648,
      height: 928,
    });

    await page.goto("/workspace");

    await expect(page.getByTestId("workspace-shell")).toBeVisible();
    await expect(page.getByTestId("project-explorer")).toBeVisible();
    await expect(page.getByTestId("monaco-editor")).toBeVisible();
    await expect(page.getByTestId("terminal-panel")).toBeVisible();
    await expect(page.getByTestId("nemi-chat")).toBeVisible();
  });
});
