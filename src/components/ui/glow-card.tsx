import React from 'react';
import { motion } from 'motion/react';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  gradient,
  delay = 0.1,
  badge,
  onClick,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay }}
      onClick={onClick}
      className={`relative flex flex-col justify-start items-start w-full max-w-[320px] md:max-w-[350px] group mx-auto cursor-pointer ${className}`}
    >
      {/* Ambient Glow Background */}
      <div
        className="absolute inset-0 w-full h-[260px] md:h-[290px] opacity-60 rounded-[40px] pointer-events-none transition-opacity duration-500 group-hover:opacity-90"
        style={{
          background: gradient,
          filter: 'blur(45px)'
        }}
      />

      {/* Foreground Card with Gradient Border */}
      <div
        className="relative self-stretch h-[260px] md:h-[290px] rounded-[40px] z-10 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
        style={{
          border: '8px solid transparent',
          background: `linear-gradient(#14171F, #0E1118) padding-box, ${gradient} border-box`
        }}
      >
        <div className="w-full h-full p-7 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="text-white/90 p-2.5 rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/10 group-hover:bg-white/[0.12] transition-colors">
              {icon}
            </div>
            {badge && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/15">
                {badge}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-white font-semibold text-xl mb-2.5 tracking-tight group-hover:text-cyan-200 transition-colors">
              {title}
            </h3>
            <p className="text-gray-400 text-[13.5px] leading-[1.6] font-normal selection:bg-white/20">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
