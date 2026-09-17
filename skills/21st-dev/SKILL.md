---
name: 21st-dev
description: Discover, query, and implement high-quality UI components, animated buttons, card designs, and motion primitives from 21st.dev. Use when designing premium UI components, searching for prebuilt animated elements, or integrating with the 21st.dev MCP server.
---

# 21st.dev UI Components & Motion Primitives

Guidance on utilizing 21st.dev component designs, animated primitives, and interactive UI patterns.

## Overview

21st.dev is a curated platform for modern, state-of-the-art UI components. It features:
- High-polish micro-interactions (magnetic buttons, glow borders, shimmering text).
- Premium design cards, bento grids, navigation bars, and modals.
- Clean component patterns with modern CSS variables, spring dynamics, and smooth transitions.

---

## MCP Server Integration

The 21st.dev MCP server is configured in your project's `mcp_config.json`:
- **Endpoint**: `https://21st.dev/api/mcp`
- **Identifier**: `21st`
- **Headers**:
  ```json
  {
    "x-api-key": "21st_sk_a02546e9065edfd22806def0c54f532e73df15595104b50cd5648f82bc4c7d57"
  }
  ```

### Usage Workflow
1. Use 21st MCP tools to search for components (e.g. "bento grid", "fluid nav", "magnetic button", "pricing card").
2. Retrieve the component markup, styling, and animation logic.
3. Adapt the component to match the project's color tokens and the `apple-design` and `gsap-*` principles.

---

## Example 21st.dev Component Patterns

### 1. Radiant Glow Button
```css
.btn-radiant {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.75rem;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.btn-radiant:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.15);
}

.btn-radiant:active {
  transform: scale(0.98);
}
```

### 2. Bento Grid Feature Card
```css
.bento-card {
  position: relative;
  padding: 2rem;
  background: #111113;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: border-color 0.3s ease;
}

.bento-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
}
```

---

## Synergy With Other Skills
- **`apple-design`**: Ensure touch/pointer response is instantaneous (<16ms) and transitions feel physically grounded.
- **`gsap-scrolltrigger`**: Animate 21st.dev bento cards or hero elements as they enter viewport viewports.
- **`motion-sites`**: Pair 21st.dev components with MotionSites kinetic typography and layout orchestrations.
