# Project Agent Guidelines & Skill Mandates

Whenever you are working on this project, you **MUST first inspect the `skills/` folder** before designing, planning, or writing any components, animations, or UI.

## Installed Skills & Usage Mandates

All skills in `skills/` (and `.agents/skills/`) must be actively and properly used:

### 1. `apple-design` (`skills/apple-design/SKILL.md`)
- **Fluid, Physical Motion**: Animate with spring physics (`damping: 1.0` default, `0.8` for momentum releases).
- **Direct Manipulation**: Touch/drag must track 1:1 with pointer coordinates, respecting pointer capture and initial grab offset.
- **Interruptibility**: Never lock out user input during an animation. All animations must be redirectable mid-motion from their live presentation values.
- **Latency Elimination**: Instantaneous feedback on `pointerdown` (<16ms).

### 2. GSAP Suite (`skills/gsap-*/SKILL.md`)
- **`gsap-core`**: Modern GSAP tweens, easing (`power2.out`, `power4.out`, `expo.out`), staggers, and defaults.
- **`gsap-timeline`**: Structured sequencing with labels and playback control.
- **`gsap-scrolltrigger`**: Scroll-driven storytelling, pinning, scrub triggers, and viewport markers.
- **`gsap-plugins`**: Flip, ScrollTo, Draggable, MotionPath, and SplitText.
- **`gsap-performance`**: Hardware acceleration (`will-change`, `transform`, `opacity`), avoiding layout thrashing, and cleanup on component unmount.

### 3. MotionSites AI (`skills/motion-sites/SKILL.md`)
- Dynamic hero sections, kinetic typography, ambient radiant glows, and interactive hover cards.
- Connected via MCP server: `motionsites` (`https://xgdzyqfalbibzelpdpvr.supabase.co/functions/v1/mcp`).

### 4. 21st.dev (`skills/21st-dev/SKILL.md`)
- State-of-the-art UI components, radiant buttons, bento grids, and micro-interactions.
- Connected via MCP server: `21st` (`https://21st.dev/api/mcp` with configured API key).

---

## Workflow Checklist Before Generating Code
1. Inspect `skills/` or `.agents/skills/` for the relevant domain.
2. Ensure tactile responsiveness and interruptibility (`apple-design`).
3. Sequence and manage animations with modern GSAP practices (`gsap-*`).
4. Apply modern aesthetic layouts and kinetic effects (`motion-sites` & `21st-dev`).
