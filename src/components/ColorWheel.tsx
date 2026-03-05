'use client';

import { useState, useRef, useEffect } from 'react';

interface ColorWheelProps {
  colors: string[];
  onColorsChange: (colors: string[]) => void;
  mode: 'free' | 'recommended';
  onModeChange: (mode: 'free' | 'recommended') => void;
}

export function ColorWheel({ colors, onColorsChange, mode, onModeChange }: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [wheelSize, setWheelSize] = useState({ width: 300, height: 300 });

  // 确保只使用前两个颜色
  useEffect(() => {
    if (colors.length !== 2) {
      onColorsChange(colors.slice(0, 2).concat(colors.length < 2 ? ['#FF5828'] : []));
    }
  }, [colors, onColorsChange]);

  // 调整画布大小
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const size = Math.min(container.clientWidth, 300);
          setWheelSize({ width: size, height: size });
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 绘制色轮
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = wheelSize.width;
    canvas.height = wheelSize.height;

    const centerX = wheelSize.width / 2;
    const centerY = wheelSize.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // 绘制色轮
    for (let angle = 0; angle < 360; angle += 1) {
      const radian = (angle * Math.PI) / 180;
      const x1 = centerX + radius * Math.cos(radian);
      const y1 = centerY + radius * Math.sin(radian);
      const x2 = centerX + radius * Math.cos(radian + 0.017);
      const y2 = centerY + radius * Math.sin(radian + 0.017);

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `hsl(${angle}, 100%, 50%)`);
      gradient.addColorStop(1, `hsl(${angle + 1}, 100%, 50%)`);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 绘制中心白色圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制颜色选择点（只绘制前两个颜色）
    colors.slice(0, 2).forEach((color, index) => {
      const [h, s, l] = hexToHsl(color);
      const angle = (h / 360) * 2 * Math.PI;
      // 确保半径因子在0-1之间
      const radiusFactor = Math.max(0, Math.min(1, s / 100));
      // 亮度因子调整，确保点不会超出色轮
      const lightnessFactor = Math.max(0.1, Math.min(1, 1 - Math.abs(l - 50) / 50));
      const finalRadius = radius * radiusFactor * lightnessFactor;

      const x = centerX + finalRadius * Math.cos(angle - Math.PI / 2);
      const y = centerY + finalRadius * Math.sin(angle - Math.PI / 2);

      // 绘制选择点
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = selectedIndex === index ? '#ffffff' : '#000000';
      ctx.lineWidth = selectedIndex === index ? 3 : 2;
      ctx.stroke();
    });
  }, [colors, wheelSize, selectedIndex]);

  // 处理鼠标点击
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = wheelSize.width / 2;
    const centerY = wheelSize.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果点击在色轮范围内
    if (distance <= radius) {
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) angle += 2 * Math.PI;
      const h = (angle / (2 * Math.PI)) * 360;
      const s = (distance / radius) * 100;
      const l = 50; // 固定亮度

      const color = hslToHex(h, s, l);
      
      // 切换选中的颜色点
      const newSelectedIndex = selectedIndex === null ? 0 : (selectedIndex === 0 ? 1 : 0);
      setSelectedIndex(newSelectedIndex);
      
      if (mode === 'recommended') {
        // 推荐模式：直接设置第一个颜色并生成推荐颜色
        const recommendedColor = generateRecommendedColor(color);
        onColorsChange([color, recommendedColor]);
      } else {
        // 自由模式：更新当前选中的点或默认更新第一个点
        const newColors = [...colors];
        newColors[newSelectedIndex] = color;
        onColorsChange(newColors);
      }
    }
  };

  // 处理颜色点点击
  const handleColorPointClick = (index: number) => {
    setSelectedIndex(index);
  };

  // 生成推荐颜色
  const generateRecommendedColor = (baseColor: string): string => {
    const [h, s, l] = hexToHsl(baseColor);
    
    // 互补色
    const complementaryH = (h + 180) % 360;
    
    // 保持相同的饱和度，调整亮度以获得最佳效果
    const recommendedS = s;
    let recommendedL = l;
    
    // 调整亮度以确保良好的对比度
    if (l > 60) {
      // 如果基础颜色较亮，推荐颜色稍暗
      recommendedL = Math.max(30, l - 25);
    } else if (l < 40) {
      // 如果基础颜色较暗，推荐颜色稍亮
      recommendedL = Math.min(70, l + 25);
    } else {
      // 中间亮度，使用对比亮度
      recommendedL = l > 50 ? l - 20 : l + 20;
    }
    
    return hslToHex(complementaryH, recommendedS, recommendedL);
  };

  // 工具函数：十六进制转HSL
  const hexToHsl = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 0];

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  // 工具函数：HSL转十六进制
  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  };

  return (
    <div className="space-y-6">
      {/* 模式选择 */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground">Color Selection Mode</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onModeChange('free')}
            className={`px-3 py-1 text-xs rounded-full ${mode === 'free' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            Free
          </button>
          <button
            onClick={() => onModeChange('recommended')}
            className={`px-3 py-1 text-xs rounded-full ${mode === 'recommended' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            Recommended
          </button>
        </div>
      </div>

      {/* 色轮 */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={wheelSize.width}
          height={wheelSize.height}
          onClick={handleCanvasClick}
          className="cursor-crosshair rounded-full border border-border"
        />
      </div>

      {/* 颜色预览 */}
      <div className="grid grid-cols-2 gap-4">
        {colors.slice(0, 2).map((color, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-md border border-border cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={() => handleColorPointClick(index)}
              />
              <span className="text-sm font-medium">Color {index + 1}</span>
            </div>
            <input
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => {
                const newColors = [...colors];
                newColors[index] = e.target.value;
                onColorsChange(newColors);
              }}
              className="w-full px-3 py-2 text-sm font-mono border border-border rounded-md"
            />
          </div>
        ))}
      </div>

      {/* 模式说明 */}
      <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-md">
        {mode === 'free' ? (
          <p>Free Mode: Select any two colors independently on the color wheel.</p>
        ) : (
          <p>Recommended Mode: Select a base color, and the system will automatically generate a complementary color for the best visual effect.</p>
        )}
      </div>
    </div>
  );
}
