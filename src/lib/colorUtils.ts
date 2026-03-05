/**
 * 色彩工具库 - 提供颜色转换、色彩理论计算等功能
 */

export interface HSL {
  h: number; // 色相 0-360
  s: number; // 饱和度 0-100
  l: number; // 亮度 0-100
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * 将 HEX 颜色转换为 RGB
 */
export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

/**
 * 将 RGB 颜色转换为 HEX
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * 将 RGB 颜色转换为 HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * 将 HSL 颜色转换为 RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * 将 HEX 颜色转换为 HSL
 */
export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * 将 HSL 颜色转换为 HEX
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

/**
 * 计算两个颜色之间的色差（基于 HSL 空间）
 */
export function colorDistance(hsl1: HSL, hsl2: HSL): number {
  // 处理色相的环形特性
  let hDiff = Math.abs(hsl1.h - hsl2.h);
  if (hDiff > 180) hDiff = 360 - hDiff;
  
  const sDiff = Math.abs(hsl1.s - hsl2.s);
  const lDiff = Math.abs(hsl1.l - hsl2.l);
  
  // 加权计算，色相权重更高
  return Math.sqrt(hDiff * hDiff * 0.5 + sDiff * sDiff * 0.3 + lDiff * lDiff * 0.2);
}

/**
 * 色彩和谐规则类型
 */
export type HarmonyType = 
  | 'complementary'   // 互补色
  | 'analogous'       // 类似色
  | 'triadic'         // 三角色
  | 'split-complementary' // 分裂互补色
  | 'tetradic'        // 四角色
  | 'monochromatic';  // 单色

/**
 * 根据色彩和谐理论生成推荐颜色
 */
export function generateHarmonyColors(baseColor: string, type: HarmonyType): string[] {
  const baseHsl = hexToHsl(baseColor);
  const colors: string[] = [baseColor];

  switch (type) {
    case 'complementary':
      // 互补色：色相 + 180°
      colors.push(hslToHex({
        h: (baseHsl.h + 180) % 360,
        s: baseHsl.s,
        l: baseHsl.l
      }));
      break;

    case 'analogous':
      // 类似色：色相 ± 30°
      colors.push(hslToHex({
        h: (baseHsl.h + 30) % 360,
        s: baseHsl.s,
        l: baseHsl.l
      }));
      colors.push(hslToHex({
        h: (baseHsl.h - 30 + 360) % 360,
        s: baseHsl.s,
        l: baseHsl.l
      }));
      break;

    case 'triadic':
      // 三角色：色相 + 120°, + 240°
      colors.push(hslToHex({
        h: (baseHsl.h + 120) % 360,
        s: baseHsl.s,
        l: baseHsl.l
      }));
      colors.push(hslToHex({
        h: (baseHsl.h + 240) % 360,
        s: baseHsl.s,
        l: baseHsl.l
      }));
      break;

    case 'split-complementary':
      // 分裂互补色：色相 + 150°, + 210°
      colors.push(hslToHex({
        h: (baseHsl.h + 150) % 360,
        s: baseHsl.s,
        l: baseHsl.l
      }));
      colors.push(hslToHex({
        h: (baseHsl.h + 210) % 360,
        s: baseHsl.s,
        l: baseHsl.l
      }));
      break;

    case 'tetradic':
      // 四角色：色相 + 90°, + 180°, + 270°
      colors.push(hslToHex({
        h: (baseHsl.h + 90) % 360,
        s: baseHsl.s,
        l: baseHsl.l
      }));
      colors.push(hslToHex({
        h: (baseHsl.h + 180) % 360,
        s: baseHsl.s,
        l: baseHsl.l
      }));
      colors.push(hslToHex({
        h: (baseHsl.h + 270) % 360,
        s: baseHsl.s,
        l: baseHsl.l
      }));
      break;

    case 'monochromatic':
      // 单色：调整亮度和饱和度
      colors.push(hslToHex({
        h: baseHsl.h,
        s: Math.max(10, baseHsl.s - 30),
        l: Math.min(90, baseHsl.l + 25)
      }));
      colors.push(hslToHex({
        h: baseHsl.h,
        s: Math.min(100, baseHsl.s + 20),
        l: Math.max(20, baseHsl.l - 20)
      }));
      break;
  }

  return colors;
}

/**
 * 获取所有和谐规则生成的颜色组合
 */
export function getAllHarmonySuggestions(baseColor: string): { type: HarmonyType; colors: string[]; name: string }[] {
  const harmonies: { type: HarmonyType; name: string }[] = [
    { type: 'complementary', name: '互补色' },
    { type: 'analogous', name: '类似色' },
    { type: 'triadic', name: '三角色' },
    { type: 'split-complementary', name: '分裂互补' },
    { type: 'tetradic', name: '四角色' },
    { type: 'monochromatic', name: '单色' }
  ];

  return harmonies.map(h => ({
    type: h.type,
    name: h.name,
    colors: generateHarmonyColors(baseColor, h.type)
  }));
}

/**
 * 根据色轮上的位置计算颜色
 * x, y 是相对于色轮中心的坐标，范围 -1 到 1
 * 
 * 注意：色轮的0度位置在3点钟方向（右侧），但CSS conic-gradient从12点钟方向开始
 * 所以需要调整角度偏移
 */
export function getColorFromWheelPosition(x: number, y: number): string {
  // 计算角度（色相）
  // atan2 返回 -PI 到 PI，0在3点钟方向
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  
  // 转换为 0-360 范围，0度在3点钟方向
  if (angle < 0) angle += 360;
  
  // 将角度旋转90度，使0度对应红色（在CSS conic-gradient中红色在0度/顶部）
  // 实际上 CSS conic-gradient 从 0deg 开始是顶部（12点钟），顺时针
  // 而 atan2 从 3点钟方向开始，逆时针为正
  // 所以需要映射：CSS角度 = (atan2角度 + 90) % 360
  const cssAngle = (angle + 90) % 360;
  
  // 计算距离（饱和度）- 距离中心越远饱和度越高
  const distance = Math.min(1, Math.sqrt(x * x + y * y));
  
  return hslToHex({
    h: Math.round(cssAngle),
    s: Math.round(distance * 100),
    l: 50
  });
}

/**
 * 获取颜色在色轮上的位置
 * 
 * 注意：这是 getColorFromWheelPosition 的逆运算
 */
export function getWheelPositionFromColor(color: string): { x: number; y: number } {
  const hsl = hexToHsl(color);
  
  // CSS conic-gradient 角度转换为 atan2 角度
  // atan2角度 = (CSS角度 - 90 + 360) % 360
  const atan2Angle = ((hsl.h - 90 + 360) % 360);
  const angle = (atan2Angle * Math.PI) / 180;
  const distance = hsl.s / 100;
  
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance
  };
}

/**
 * 生成随机颜色
 */
export function generateRandomColor(): string {
  return hslToHex({
    h: Math.floor(Math.random() * 360),
    s: 60 + Math.floor(Math.random() * 40),
    l: 40 + Math.floor(Math.random() * 40)
  });
}
