# NEMI-CODE — Cinematic Bot-Background Coding UI Guidelines

**"An intelligent, autonomous software engineering environment powered by NVIDIA."**

---

## 1. Cinematic Product Vision: Code Inside the Machine

NEMI-CODE reimagines the software development experience:
> *"A futuristic autonomous coding environment where the machine intelligence lives in the background and the developer works directly on top of it."*

The experience unites:
- An immersive, volumetric deep-black and crimson-red atmosphere.
- A living 3D centerpiece (**NEMI BOT / CORE-01**) sitting in the background.
- A functional, professional developer overlay (Monaco editor, task composer, terminal, timeline, file explorer).
- Segmented rectangular navigation with vivid signal-red call-to-actions.

---

## 2. Naming Conventions

### Exact Spelling:
**`NEMI-CODE`**

### Strictly Forbidden Forms:
- ❌ `NEMICO`
- ❌ `NEMI CO`
- ❌ `NemiCo`
- ❌ `OmniCode` (historical migration only)

---

## 3. Mandatory Color Palette

Inspired by the cinematic tension and elegance of modern high-end editorial and 3D digital products:

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Absolute Black** | `#000000` | Background canvas, deep space, high contrast base |
| **Near Black** | `#080808` | Primary glass panels, editor surfaces, dark cards |
| **Deep Crimson** | `#5F0000` | Volumetric lighting, background radial glows |
| **Dark Burgundy** | `#490000` | Secondary background lighting, subtle fills |
| **Signal Red** | `#ED3327` | Primary action CTA (`Start Building →`), active tabs, emissive visor |
| **Pure White** | `#FFFFFF` | Editorial headlines, bold typography, active tab text |
| **Soft White** | `#EAEAEA` | Body copy, code text, logs |
| **Muted Gray** | `#A7A7A7` | Secondary labels, descriptions, timestamps |
| **Dark Border Red**| `#3A1515` | Segmented dividers, panel borders, subtle structural grid |

---

## 4. The 3D Centerpiece: NEMI BOT / CORE-01

The living machine intelligence occupies the right-center hero area:
- **Materials:** Dark metallic graphite alloy (`metalness: 0.92`, `roughness: 0.22`), matte obsidian armor plates, and metallic chrome hydraulic pistons.
- **Visual Visor:** Glowing Signal Red (`#ED3327`) emissive neural strip.
- **Core-01 Aperture:** Pulsating crimson chest reactor.
- **Dynamic Behaviors:**
  - *Idle:* Subtle sine-wave breathing floating motion and mechanical shifts.
  - *Pointer Tracking:* Damped parallax response orienting head and torso toward cursor.
  - *Input Attentive:* Glowing visor expands and brightens upon Task Composer focus.
  - *Task Execution:* Rapid computational cadence pulse across the emissive visor.
  - *Graceful Fallback:* High-fidelity SVG volumetric bot when WebGL is unavailable.

---

## 5. Overlay Architecture: "Code on Top of the Bot"

The user never switches away from the machine world; the interface seamlessly shifts between:
- **Mode A (Cinematic Landing):** Editorial typography (`WE BUILD THE FUTURE OF SOFTWARE.`), immediate floating task composer, quick tasks, and live memory logs.
- **Mode B (Coding Focus Mode):** The Monaco Editor, collapsible file explorer, collapsible bottom terminal, and assistant drawer float with backdrop blur directly on top of the 3D machine environment.

---

## 6. Segmented Top Navigation

- Full-width horizontal bar.
- Crisp rectangular blocks divided by `#3A1515` razor-sharp borders.
- Navigation segments: `Overview`, `Workspace`, `Memory & Runs`, `Settings`, `⌘K Commands`.
- Right CTA: Vivid Signal Red `#ED3327` button: `Start Building →`.
