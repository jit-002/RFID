---
name: motion-sites
description: Design principles, hero sections, kinetic typography, interactive cards, and motion templates from MotionSites AI. Use when designing modern, dynamic web pages, hero sections, scroll transitions, animated showcase components, or integrating prompts from the MotionSites MCP server.
---

# MotionSites AI Design & Motion Skill

Guidance on crafting high-impact, modern interactive websites, hero sections, kinetic typography, and animated micro-interactions inspired by MotionSites AI.

## Core Motion Philosophy

MotionSites designs focus on:
1. **Kinetic Hero Sections**: Bold typography with layered entrance reveals, responsive cursor effects, and subtle depth layers.
2. **Interactive Cards & Grids**: Hover states that bend, tilt, or spotlight cursor position using radial gradients or 3D transform matrices.
3. **Continuous Scroll Narratives**: Fluid section transitions using pinned stages, horizontal marquee bands, and scrubbed progress animations.
4. **Dark Mode & Radiant Accents**: Deep obsidian backgrounds (`#0a0a0c`, `#050507`) paired with vibrant ambient glows, backdrop-filtered glass panels, and fine borders (`border: 1px solid rgba(255, 255, 255, 0.08)`).

---

## MCP Server Integration

The MotionSites MCP server is configured in your project's `mcp_config.json`:
- **Endpoint**: `https://xgdzyqfalbibzelpdpvr.supabase.co/functions/v1/mcp`
- **Identifier**: `motionsites`

When using the MotionSites MCP:
- Query available tools for motion design prompts, layout recommendations, and animated UI templates.
- Translate MotionSites prompt templates into lightweight Vanilla CSS/JS or GSAP implementations for the project.

---

## Modern Motion Patterns

### 1. Kinetic Headline Reveal
Combine split text masking with GSAP stagger:
```js
gsap.from(".hero-title .char", {
  y: "110%",
  opacity: 0,
  duration: 1.1,
  ease: "power4.out",
  stagger: 0.02,
});
```

### 2. Cursor-Responsive Spotlight Card
```css
.motion-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  overflow: hidden;
  backdrop-filter: blur(12px);
}

.motion-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.06),
    transparent 40%
  );
  pointer-events: none;
}
```

```js
document.querySelectorAll(".motion-card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  });
});
```

### 3. Smooth Marquee / Loop Strip
```css
.marquee-track {
  display: flex;
  gap: 2rem;
  width: max-content;
  animation: marquee 25s linear infinite;
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}
```

---

## Best Practices
- Keep animations responsive to viewport resizing.
- Respect `prefers-reduced-motion`.
- Combine with `apple-design` physics (springs & interruptibility) and `gsap-*` sequencing for maximum polish.
