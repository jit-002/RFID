import gsap from 'gsap';

// Configure GSAP defaults conforming to gsap-core and apple-design skills
gsap.defaults({
  ease: 'power3.out',
  duration: 0.45
});

export const springEase = 'elastic.out(1, 0.75)';
export const smoothEase = 'power4.out';
export const snappyEase = 'expo.out';

/**
 * Apple-style interruptible spring animation helper
 */
export function animateSpring(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars
): gsap.core.Tween {
  return gsap.to(target, {
    overwrite: 'auto', // Ensures interruptibility without jump
    ease: vars.ease || 'power3.out',
    duration: vars.duration || 0.4,
    ...vars
  });
}

export default gsap;
