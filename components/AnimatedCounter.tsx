"use client";
import { useEffect, useState, useRef } from "react";

export default function AnimatedCounter({ 
  end, 
  prefix = "", 
  suffix = "", 
  decimals = 0,
  duration = 2000
}: { 
  end: number; 
  prefix?: string; 
  suffix?: string; 
  decimals?: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number;
          
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // ease out cubic function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            setCount(easeProgress * end);
            
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };
          
          window.requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  const formattedCount = decimals === 0 && end >= 1000 
    ? Math.floor(count).toLocaleString('en-IN')
    : count.toFixed(decimals);

  return (
    <span ref={ref}>
      {prefix}{formattedCount}{suffix}
    </span>
  );
}
