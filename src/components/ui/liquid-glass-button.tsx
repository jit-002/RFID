import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const liquidbuttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 text-white hover:scale-105 border border-cyan-400/40 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-white/20 bg-black/40 text-slate-200 hover:bg-white/10 hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-white/10 hover:text-white",
        link: "text-cyan-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 text-xs px-3.5",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-8 text-base font-bold",
        xxl: "h-16 px-10 text-lg font-bold tracking-wide",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function GlassFilter() {
  return (
    <svg className="hidden" aria-hidden="true">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          {/* Generate turbulent noise for distortion */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />

          {/* Blur the turbulence pattern slightly */}
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />

          {/* Displace the source graphic with the noise */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />

          {/* Apply overall blur on the final result */}
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />

          {/* Output the result */}
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean;
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <>
        <Comp
          ref={ref}
          data-slot="button"
          className={cn(
            "relative group backdrop-blur-xl",
            liquidbuttonVariants({ variant, size, className })
          )}
          {...props}
        >
          <div
            className="absolute top-0 left-0 z-0 h-full w-full rounded-xl 
            shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.4),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.2),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_15px_rgba(6,182,212,0.25)] 
            transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.4),inset_0_0_12px_rgba(255,255,255,0.3)]"
          />
          <div
            className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-xl"
            style={{ backdropFilter: 'url("#container-glass")' }}
          />

          <div className="relative z-10 flex items-center gap-2">
            {children}
          </div>
          <GlassFilter />
        </Comp>
      </>
    );
  }
);
LiquidButton.displayName = "LiquidButton";

type ColorVariant =
  | "default"
  | "primary"
  | "success"
  | "error"
  | "gold"
  | "bronze";

export interface MetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ColorVariant;
}

const colorVariants: Record<
  ColorVariant,
  {
    outer: string;
    inner: string;
    button: string;
    textColor: string;
    textShadow: string;
  }
> = {
  default: {
    outer: "bg-gradient-to-b from-[#000] to-[#A0A0A0]",
    inner: "bg-gradient-to-b from-[#FAFAFA] via-[#3E3E3E] to-[#E5E5E5]",
    button: "bg-gradient-to-b from-[#B9B9B9] to-[#969696]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(80_80_80_/_100%)]",
  },
  primary: {
    outer: "bg-gradient-to-b from-[#000] to-[#A0A0A0]",
    inner: "bg-gradient-to-b from-cyan-600 via-blue-600 to-indigo-600",
    button: "bg-gradient-to-b from-cyan-500 to-blue-700",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(30_58_138_/_100%)]",
  },
  success: {
    outer: "bg-gradient-to-b from-[#005A43] to-[#7CCB9B]",
    inner: "bg-gradient-to-b from-[#E5F8F0] via-[#00352F] to-[#D1F0E6]",
    button: "bg-gradient-to-b from-[#9ADBC8] to-[#3E8F7C]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(6_78_59_/_100%)]",
  },
  error: {
    outer: "bg-gradient-to-b from-[#5A0000] to-[#FFAEB0]",
    inner: "bg-gradient-to-b from-[#FFDEDE] via-[#680002] to-[#FFE9E9]",
    button: "bg-gradient-to-b from-[#F08D8F] to-[#A45253]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(146_64_14_/_100%)]",
  },
  gold: {
    outer: "bg-gradient-to-b from-[#917100] to-[#EAD98F]",
    inner: "bg-gradient-to-b from-[#FFFDDD] via-[#856807] to-[#FFF1B3]",
    button: "bg-gradient-to-b from-[#FFEBA1] to-[#9B873F]",
    textColor: "text-[#FFFDE5]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(178_140_2_/_100%)]",
  },
  bronze: {
    outer: "bg-gradient-to-b from-[#864813] to-[#E9B486]",
    inner: "bg-gradient-to-b from-[#EDC5A1] via-[#5F2D01] to-[#FFDEC1]",
    button: "bg-gradient-to-b from-[#FFE3C9] to-[#A36F3D]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(124_45_18_/_100%)]",
  },
};

export const MetalButton = React.forwardRef<HTMLButtonElement, MetalButtonProps>(
  ({ children, className, variant = "primary", ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);

    const colors = colorVariants[variant];
    const buttonText = children || "Button";

    return (
      <div
        className={cn(
          "relative inline-flex transform-gpu rounded-xl p-[1.25px] transition-all",
          colors.outer,
          className
        )}
      >
        <div className={cn("absolute inset-[1px] rounded-lg transition-all", colors.inner)} />
        <button
          ref={ref}
          className={cn(
            "relative z-10 m-[1px] rounded-lg inline-flex h-11 items-center justify-center px-6 py-2 text-sm font-bold transition-transform cursor-pointer outline-none",
            colors.button,
            colors.textColor,
            colors.textShadow,
            isPressed ? "scale-95" : isHovered ? "brightness-110" : ""
          )}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
          {...props}
        >
          {buttonText}
        </button>
      </div>
    );
  }
);
MetalButton.displayName = "MetalButton";
