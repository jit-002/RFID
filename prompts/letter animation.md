You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
dancing-letters.tsx
"use client";

import { LazyMotion, domAnimation, m } from "motion/react";
import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DancingLettersProps {
  text?: string;
  className?: string;
  letterClassName?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

// Sleek, physics-based animations
const letterAnimations = [
  // 1. Rubber Band (Snap)
  {
    active: {
      scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
      scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1],
    },
    transition: { duration: 0.8, ease: "easeInOut" },
    transformOrigin: "center center",
  },
  // 2. The Hinge (Falling effect)
  {
    active: {
      rotate: [0, 80, 60, 80, 60, 0],
      y: [0, 10, -5, 5, -2, 0],
      originX: 0,
      originY: 1,
    },
    transition: { duration: 1.2, ease: [0.175, 0.885, 0.32, 1.275] },
    transformOrigin: "bottom left",
  },
  // 3. Squash and Jump
  {
    active: {
      scaleY: [1, 0.6, 1.2, 1],
      y: [0, 20, -40, 0],
    },
    transition: { duration: 0.6, ease: "easeOut" },
    transformOrigin: "bottom center",
  },
  // 4. Falling (Requests)
  {
    active: {
      rotateX: [0, 240, 150, 200, 175, 180, 180, 0],
      scale: [1, 1.1, 1],
    },
    transition: {
      duration: 2,
      ease: "easeOut",
      times: [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.85, 1],
    },
    transformOrigin: "50% 80%",
  },
  // 5. Elastic Slide
  {
    active: {
      x: [0, -20, 15, -10, 5, 0],
    },
    transition: { duration: 0.8, ease: "easeInOut" },
    transformOrigin: "center center",
  },
  // 6. Impact Shake
  {
    active: {
      x: [0, -5, 5, -5, 5, -2, 2, 0],
      y: [0, -2, 2, -1, 1, 0],
      rotate: [0, -1, 1, -0.5, 0.5, 0],
    },
    transition: { duration: 0.5, ease: "linear" },
    transformOrigin: "center center",
  },
  // 7. Pop (Scale)
  {
    active: {
      scale: [1, 1.4, 1],
    },
    transition: { duration: 0.5, ease: "easeInOut" },
    transformOrigin: "center center",
  },
  // 8. Levitate
  {
    active: {
      y: [0, -30, 0],
      scale: [1, 1.1, 1],
      textShadow: [
        "0px 0px 0px rgba(0,0,0,0)",
        "0px 20px 20px rgba(0,0,0,0.2)",
        "0px 0px 0px rgba(0,0,0,0)",
      ],
    },
    transition: { duration: 1.2, ease: "easeInOut" },
    transformOrigin: "center center",
  },
];

const DancingLetters = ({
  text = "ANIMATE",
  className = "",
  letterClassName = "",
}: DancingLettersProps) => {
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set());
  const letters = text.split("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = useCallback((index: number) => {
    setActiveIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      }
      // Small timeout to allow state clear if double clicking rapidly
      setTimeout(() => {
        setActiveIndices((prev) => {
          const next = new Set(prev);
          next.add(index);
          return next;
        });
      }, 10);
      return next;
    });
  }, []);

  const handleAnimationComplete = useCallback((index: number) => {
    setActiveIndices((prev) => {
      if (!prev.has(index)) return prev;
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={cn(
          "flex items-center justify-center select-none",
          className,
        )}
        style={{ perspective: "1000px" }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
      >
        {letters.map((letter, id) => {
          const animIndex = id % letterAnimations.length;
          const anim = letterAnimations[animIndex];
          const isActive = activeIndices.has(id);

          return (
            <m.span
              key={`${letter}-${id}`}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.8 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                  rotate: 0,
                  rotateX: 0,
                  rotateY: 0,
                  scaleX: 1,
                  scaleY: 1,
                  textShadow: "0px 0px 0px rgba(0,0,0,0)",
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                },
                active: {
                  ...anim.active,
                  opacity: 1,
                  // @ts-expect-error transition type mismatch
                  transition: anim.transition,
                },
              }}
              animate={isActive ? "active" : isLoaded ? "visible" : undefined}
              onHoverStart={() => {
                if (!isActive) handleClick(id);
              }}
              onClick={() => handleClick(id)}
              onAnimationComplete={(definition) => {
                if (definition === "active") handleAnimationComplete(id);
              }}
              className={cn(
                "relative inline-block text-5xl md:text-7xl lg:text-8xl font-bold text-neutral-900 dark:text-neutral-100 cursor-pointer",
                letterClassName,
                isActive ? "z-10" : "z-0",
              )}
              style={{
                transformOrigin: anim.transformOrigin,
                transformStyle: "preserve-3d",
              }}
            >
              {letter}
            </m.span>
          );
        })}
      </m.div>
    </LazyMotion>
  );
};

export default DancingLetters;


demo.tsx
import DancingLetters from "@/components/ui/dancing-letters";

export default function DancingLettersDemo() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-6">
      <DancingLetters text="ANIMATE" />
    </div>
  );
}

```

Install NPM dependencies:
```bash
motion
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
