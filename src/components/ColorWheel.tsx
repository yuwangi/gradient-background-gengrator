'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  getColorFromWheelPosition, 
  getWheelPositionFromColor,
  hexToHsl,
  hslToHex
} from '@/lib/colorUtils';
import { ColorDot } from './ColorDot';

export type SelectionMode = 'free' | 'recommend';

interface ColorWheelProps {
  primaryColor: string;
  secondaryColor: string;
  onPrimaryChange: (color: string) => void;
  onSecondaryChange: (color: string) => void;
  mode: SelectionMode;
  className?: string;
}

const WHEEL_SIZE = 280;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = WHEEL_SIZE / 2 - 20;

export function ColorWheel({
  primaryColor,
  secondaryColor,
  onPrimaryChange,
  onSecondaryChange,
  mode,
  className
}: ColorWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'primary' | 'secondary' | null>(null);
  const [lightness, setLightness] = useState<number>(50);
  
  // 使用 ref 存储拖拽过程中的临时颜色，避免频繁触发父组件更新
  const tempPrimaryColor = useRef(primaryColor);
  const tempSecondaryColor = useRef(secondaryColor);
  
  // 使用 ref 存储拖拽开始时的颜色
  const dragStartColor = useRef<string>('');
  
  // 使用 ref 存储亮度调整的防抖定时器
  const lightnessDebounceRef = useRef<NodeJS.Timeout | null>(null);
  // 使用 ref 存储亮度调整结束后的最终值
  const pendingLightnessRef = useRef<number>(50);

  // 根据亮度调整颜色
  const adjustLightness = useCallback((color: string, lightness: number): string => {
    const hsl = hexToHsl(color);
    return hslToHex({ ...hsl, l: lightness });
  }, []);

  // 获取显示用的颜色（考虑亮度）- 使用临时颜色进行显示
  const displayPrimaryColor = adjustLightness(tempPrimaryColor.current, lightness);
  const displaySecondaryColor = adjustLightness(tempSecondaryColor.current, lightness);

  // 计算颜色点在色轮上的位置
  const primaryPos = getWheelPositionFromColor(tempPrimaryColor.current);
  const secondaryPos = getWheelPositionFromColor(tempSecondaryColor.current);

  // 将归一化坐标转换为像素坐标
  const toPixelCoords = (x: number, y: number) => ({
    x: CENTER + x * RADIUS,
    y: CENTER + y * RADIUS
  });

  const primaryPixelPos = toPixelCoords(primaryPos.x, primaryPos.y);
  const secondaryPixelPos = toPixelCoords(secondaryPos.x, secondaryPos.y);

  // 生成色轮渐变背景 - 使用多层渐变来模拟亮度变化
  const wheelBackground = useMemo(() => {
    // 基础色轮 - 饱和度100%，亮度50%
    const baseWheel = `conic-gradient(
      from 0deg,
      hsl(0, 100%, 50%),
      hsl(60, 100%, 50%),
      hsl(120, 100%, 50%),
      hsl(180, 100%, 50%),
      hsl(240, 100%, 50%),
      hsl(300, 100%, 50%),
      hsl(360, 100%, 50%)
    )`;
    return baseWheel;
  }, []);

  // 处理鼠标/触摸事件 - 只更新临时颜色，不通知父组件
  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current || !dragging) return;

    const rect = wheelRef.current.getBoundingClientRect();
    const x = clientX - rect.left - CENTER;
    const y = clientY - rect.top - CENTER;

    // 归一化坐标
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = RADIUS;
    
    let normalizedX = x / maxDistance;
    let normalizedY = y / maxDistance;

    // 限制在圆内
    if (distance > maxDistance) {
      normalizedX = (x / distance);
      normalizedY = (y / distance);
    }

    const newColor = getColorFromWheelPosition(normalizedX, normalizedY);
    
    // 只更新临时颜色，不通知父组件
    if (dragging === 'primary') {
      tempPrimaryColor.current = newColor;
    } else {
      tempSecondaryColor.current = newColor;
    }
    
    // 强制重新渲染以更新显示
    forceUpdate({});
  }, [dragging]);

  // 强制更新触发器
  const [, forceUpdate] = useState({});

  // 鼠标事件处理
  const handleMouseDown = (dot: 'primary' | 'secondary') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(dot);
    // 记录拖拽开始时的颜色
    dragStartColor.current = dot === 'primary' ? primaryColor : secondaryColor;
    // 同步临时颜色
    tempPrimaryColor.current = primaryColor;
    tempSecondaryColor.current = secondaryColor;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      // 拖拽结束时，通知父组件最终颜色（应用亮度调整）
      if (dragging === 'primary') {
        onPrimaryChange(adjustLightness(tempPrimaryColor.current, lightness));
      } else {
        onSecondaryChange(adjustLightness(tempSecondaryColor.current, lightness));
      }
    }
    setDragging(null);
  }, [dragging, onPrimaryChange, onSecondaryChange, lightness, adjustLightness]);

  // 触摸事件处理
  const handleTouchStart = (dot: 'primary' | 'secondary') => (_e: React.TouchEvent) => {
    setDragging(dot);
    // 记录拖拽开始时的颜色
    dragStartColor.current = dot === 'primary' ? primaryColor : secondaryColor;
    // 同步临时颜色
    tempPrimaryColor.current = primaryColor;
    tempSecondaryColor.current = secondaryColor;
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleInteraction]);

  const handleTouchEnd = useCallback(() => {
    if (dragging) {
      // 拖拽结束时，通知父组件最终颜色（应用亮度调整）
      if (dragging === 'primary') {
        onPrimaryChange(adjustLightness(tempPrimaryColor.current, lightness));
      } else {
        onSecondaryChange(adjustLightness(tempSecondaryColor.current, lightness));
      }
    }
    setDragging(null);
  }, [dragging, onPrimaryChange, onSecondaryChange, lightness, adjustLightness]);

  // 添加/移除全局事件监听
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // 当父组件传入的颜色变化时，同步到临时颜色
  useEffect(() => {
    if (!dragging) {
      tempPrimaryColor.current = primaryColor;
      tempSecondaryColor.current = secondaryColor;
      forceUpdate({});
    }
  }, [primaryColor, secondaryColor, dragging]);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (lightnessDebounceRef.current) {
        clearTimeout(lightnessDebounceRef.current);
      }
    };
  }, []);

  // 当亮度变化时，使用防抖更新父组件的颜色
  const handleLightnessChange = (newLightness: number) => {
    // 立即更新本地状态以更新UI显示
    setLightness(newLightness);
    pendingLightnessRef.current = newLightness;
    
    // 清除之前的定时器
    if (lightnessDebounceRef.current) {
      clearTimeout(lightnessDebounceRef.current);
    }
    
    // 设置新的防抖定时器，150ms后应用最终亮度值
    lightnessDebounceRef.current = setTimeout(() => {
      const finalLightness = pendingLightnessRef.current;
      onPrimaryChange(adjustLightness(tempPrimaryColor.current, finalLightness));
      onSecondaryChange(adjustLightness(tempSecondaryColor.current, finalLightness));
      lightnessDebounceRef.current = null;
    }, 150);
  };

  // 计算亮度覆盖层的透明度
  const lightnessOverlayOpacity = useMemo(() => {
    // 亮度50%时完全透明，越偏离50%越不透明
    return Math.abs(lightness - 50) / 100;
  }, [lightness]);

  // 计算亮度覆盖层的颜色
  const lightnessOverlayColor = useMemo(() => {
    if (lightness > 50) {
      // 变亮：添加白色覆盖
      return 'white';
    } else {
      // 变暗：添加黑色覆盖
      return 'black';
    }
  }, [lightness]);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* 色轮容器 */}
      <div 
        ref={wheelRef}
        className="relative rounded-full cursor-crosshair select-none"
        style={{ 
          width: WHEEL_SIZE, 
          height: WHEEL_SIZE,
        }}
      >
        {/* 色轮背景 - 基础色相 */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ 
            background: wheelBackground,
          }}
        />
        
        {/* 饱和度遮罩（中心白色到边缘透明） */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, white 0%, transparent 70%)',
            opacity: 0.3
          }}
        />

        {/* 亮度覆盖层 */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            backgroundColor: lightnessOverlayColor,
            opacity: lightnessOverlayOpacity,
            mixBlendMode: lightness > 50 ? 'screen' : 'multiply',
          }}
        />

        {/* 主颜色选择点 */}
        <ColorDot
          color={displayPrimaryColor}
          x={primaryPixelPos.x}
          y={primaryPixelPos.y}
          isActive={dragging === 'primary'}
          isPrimary={true}
          onMouseDown={handleMouseDown('primary')}
          onTouchStart={handleTouchStart('primary')}
        />

        {/* 次颜色选择点 */}
        <ColorDot
          color={displaySecondaryColor}
          x={secondaryPixelPos.x}
          y={secondaryPixelPos.y}
          isActive={dragging === 'secondary'}
          isPrimary={false}
          onMouseDown={handleMouseDown('secondary')}
          onTouchStart={handleTouchStart('secondary')}
        />

        {/* 连接线（仅在推荐模式下显示） */}
        {mode === 'recommend' && (
          <svg 
            className="absolute inset-0 pointer-events-none"
            width={WHEEL_SIZE}
            height={WHEEL_SIZE}
          >
            <line
              x1={primaryPixelPos.x}
              y1={primaryPixelPos.y}
              x2={secondaryPixelPos.x}
              y2={secondaryPixelPos.y}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
        )}
      </div>

      {/* 亮度滑块 */}
      <div className="w-full max-w-[280px] space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>暗</span>
          <span>亮度 {lightness}%</span>
          <span>亮</span>
        </div>
        <input
          type="range"
          min="10"
          max="90"
          value={lightness}
          onChange={(e) => handleLightnessChange(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
    </div>
  );
}
