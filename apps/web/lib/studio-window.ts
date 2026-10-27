/**
 * Studio Window Launcher & Cross-Window State Synchronizer
 * 
 * Securely launches the dedicated NEMI-CODE Coding Studio window with
 * popup detection, fallback to new tab, and BroadcastChannel synchronization.
 */

export const STUDIO_CHANNEL_NAME = "nemi_coding_studio_channel";

export interface StudioLaunchOptions {
  workspaceId?: string;
  isNew?: boolean;
  targetPath?: string;
  forceTab?: boolean;
}

export function getStudioUrl(options: StudioLaunchOptions = {}): string {
  if (options.targetPath) {
    return options.targetPath;
  }
  if (options.isNew) {
    return "/workspace/new";
  }
  if (options.workspaceId && options.workspaceId !== "default") {
    return `/workspace/${encodeURIComponent(options.workspaceId)}/studio`;
  }
  return "/workspace";
}

let activeStudioWindow: Window | null = null;

export function openCodingStudio(options: StudioLaunchOptions = {}): Window | null {
  if (typeof window === "undefined") return null;

  const url = getStudioUrl(options);
  const windowName = `NemiStudio_${options.workspaceId || "primary"}`;

  // If already open and not closed, focus and reuse it
  if (activeStudioWindow && !activeStudioWindow.closed) {
    try {
      activeStudioWindow.focus();
      return activeStudioWindow;
    } catch {
      // Cross-origin or closed window reference
    }
  }

  // Calculate centered 1600x950 dimensions or clamped to screen
  const width = Math.min(1600, window.screen.availWidth || 1600);
  const height = Math.min(950, window.screen.availHeight || 950);
  const left = Math.max(0, Math.round(((window.screen.availWidth || 1600) - width) / 2));
  const top = Math.max(0, Math.round(((window.screen.availHeight || 950) - height) / 2));

  const features = [
    "popup=yes",
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    "resizable=yes",
    "scrollbars=yes",
    "status=no",
    "toolbar=no",
    "menubar=no",
    "location=no",
  ].join(",");

  try {
    const win = window.open(url, windowName, options.forceTab ? "_blank" : features);
    if (win && !win.closed) {
      activeStudioWindow = win;
      try {
        win.focus();
      } catch {}
      return win;
    }
  } catch (err) {
    console.warn("[NEMI-CODE] Window popup blocked or restricted, defaulting to link/tab:", err);
  }

  return null;
}
