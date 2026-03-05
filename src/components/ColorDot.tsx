'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ColorDotProps {
  color: string;
  x: number;
  y: number;
  isActive: boolean;
  isPrimary: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}

export function ColorDot({
  color,
  x,
  y,
  isActive,
  isPrimary,
  onMouseDown,
  onTouchStart
}: ColorDotProps) {
  return (
    <div
      className={cn(
        "absolute w-6 h-6 rounded-full cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150",
        "border-2 shadow-lg hover:scale-110",
        isActive && "scale-125 z-10",
        isPrimary ? "border-white" : "border-gray-200 dark:border-gray-700"
      )}
      style={{
        left: x,
        top: y,
        backgroundColor: color,
        boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px ${isPrimary ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.1)'}`,
        zIndex: isActive ? 20 : isPrimary ? 10 : 5
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* 标签指示器 */}
      <span 
        className={cn(
          "absolute -top-5 left-1/2 transform -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap",
          isPrimary 
            ? "bg-primary text-primary-foreground" 
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isPrimary ? '主' : '次'}
      </span>
    </div>
  );
}
