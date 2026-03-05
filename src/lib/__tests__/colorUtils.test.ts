/**
 * 色彩工具库测试
 */
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  colorDistance,
  generateHarmonyColors,
  getAllHarmonySuggestions,
  getColorFromWheelPosition,
  getWheelPositionFromColor,
  generateRandomColor,
  type HarmonyType
} from '../colorUtils';

describe('Color Utils', () => {
  describe('Basic Conversions', () => {
    test('hexToRgb converts correctly', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    test('rgbToHex converts correctly', () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00');
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff');
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    });

    test('rgbToHsl converts correctly', () => {
      const redHsl = rgbToHsl({ r: 255, g: 0, b: 0 });
      expect(redHsl.h).toBe(0);
      expect(redHsl.s).toBe(100);
      expect(redHsl.l).toBe(50);

      const greenHsl = rgbToHsl({ r: 0, g: 255, b: 0 });
      expect(greenHsl.h).toBe(120);
      expect(greenHsl.s).toBe(100);
      expect(greenHsl.l).toBe(50);

      const blueHsl = rgbToHsl({ r: 0, g: 0, b: 255 });
      expect(blueHsl.h).toBe(240);
      expect(blueHsl.s).toBe(100);
      expect(blueHsl.l).toBe(50);
    });

    test('hslToRgb converts correctly', () => {
      const redRgb = hslToRgb({ h: 0, s: 100, l: 50 });
      expect(redRgb.r).toBe(255);
      expect(redRgb.g).toBe(0);
      expect(redRgb.b).toBe(0);

      const greenRgb = hslToRgb({ h: 120, s: 100, l: 50 });
      expect(greenRgb.r).toBe(0);
      expect(greenRgb.g).toBe(255);
      expect(greenRgb.b).toBe(0);

      const blueRgb = hslToRgb({ h: 240, s: 100, l: 50 });
      expect(blueRgb.r).toBe(0);
      expect(blueRgb.g).toBe(0);
      expect(blueRgb.b).toBe(255);
    });

    test('hexToHsl and hslToHex are inverse operations', () => {
      const testColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
      testColors.forEach(color => {
        const hsl = hexToHsl(color);
        const backToHex = hslToHex(hsl);
        expect(backToHex.toLowerCase()).toBe(color.toLowerCase());
      });
    });
  });

  describe('Color Distance', () => {
    test('same color has zero distance', () => {
      const hsl = { h: 180, s: 50, l: 50 };
      expect(colorDistance(hsl, hsl)).toBe(0);
    });

    test('complementary colors have large distance', () => {
      const red = { h: 0, s: 100, l: 50 };
      const cyan = { h: 180, s: 100, l: 50 };
      expect(colorDistance(red, cyan)).toBeGreaterThan(100);
    });

    test('similar colors have small distance', () => {
      const color1 = { h: 180, s: 50, l: 50 };
      const color2 = { h: 185, s: 52, l: 48 };
      expect(colorDistance(color1, color2)).toBeLessThan(20);
    });
  });

  describe('Harmony Colors Generation', () => {
    test('complementary harmony generates 2 colors', () => {
      const colors = generateHarmonyColors('#FF0000', 'complementary');
      expect(colors.length).toBe(2);
      expect(colors[0]).toBe('#FF0000');
      // Second color should be approximately cyan
      const secondHsl = hexToHsl(colors[1]);
      expect(secondHsl.h).toBeGreaterThan(170);
      expect(secondHsl.h).toBeLessThan(190);
    });

    test('analogous harmony generates 3 colors', () => {
      const colors = generateHarmonyColors('#FF0000', 'analogous');
      expect(colors.length).toBe(3);
      expect(colors[0]).toBe('#FF0000');
    });

    test('triadic harmony generates 3 colors', () => {
      const colors = generateHarmonyColors('#FF0000', 'triadic');
      expect(colors.length).toBe(3);
      expect(colors[0]).toBe('#FF0000');
    });

    test('split-complementary harmony generates 3 colors', () => {
      const colors = generateHarmonyColors('#FF0000', 'split-complementary');
      expect(colors.length).toBe(3);
      expect(colors[0]).toBe('#FF0000');
    });

    test('tetradic harmony generates 4 colors', () => {
      const colors = generateHarmonyColors('#FF0000', 'tetradic');
      expect(colors.length).toBe(4);
      expect(colors[0]).toBe('#FF0000');
    });

    test('monochromatic harmony generates 3 colors', () => {
      const colors = generateHarmonyColors('#FF0000', 'monochromatic');
      expect(colors.length).toBe(3);
      expect(colors[0]).toBe('#FF0000');
    });

    test('all harmonies preserve base color', () => {
      const baseColor = '#5135FF';
      const harmonyTypes: HarmonyType[] = [
        'complementary', 'analogous', 'triadic', 
        'split-complementary', 'tetradic', 'monochromatic'
      ];
      
      harmonyTypes.forEach(type => {
        const colors = generateHarmonyColors(baseColor, type);
        expect(colors[0]).toBe(baseColor);
      });
    });
  });

  describe('All Harmony Suggestions', () => {
    test('returns all 6 harmony types', () => {
      const suggestions = getAllHarmonySuggestions('#FF0000');
      expect(suggestions.length).toBe(6);
      
      const names = suggestions.map(s => s.name);
      expect(names).toContain('互补色');
      expect(names).toContain('类似色');
      expect(names).toContain('三角色');
      expect(names).toContain('分裂互补');
      expect(names).toContain('四角色');
      expect(names).toContain('单色');
    });

    test('each suggestion has required properties', () => {
      const suggestions = getAllHarmonySuggestions('#FF0000');
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('name');
        expect(suggestion).toHaveProperty('colors');
        expect(Array.isArray(suggestion.colors)).toBe(true);
        expect(suggestion.colors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Color Wheel Position', () => {
    test('getColorFromWheelPosition returns valid hex color', () => {
      const color = getColorFromWheelPosition(0.5, 0.5);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    test('getWheelPositionFromColor returns valid position', () => {
      const position = getWheelPositionFromColor('#FF0000');
      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(typeof position.x).toBe('number');
      expect(typeof position.y).toBe('number');
    });

    test('color wheel position conversion is consistent', () => {
      const testColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
      testColors.forEach(color => {
        const pos = getWheelPositionFromColor(color);
        // Clamp position to valid range
        const clampedX = Math.max(-1, Math.min(1, pos.x));
        const clampedY = Math.max(-1, Math.min(1, pos.y));
        const recoveredColor = getColorFromWheelPosition(clampedX, clampedY);
        
        // Colors should be similar (allowing for rounding errors)
        const originalHsl = hexToHsl(color);
        const recoveredHsl = hexToHsl(recoveredColor);
        
        const hDiff = Math.abs(originalHsl.h - recoveredHsl.h);
        expect(hDiff < 10 || hDiff > 350).toBe(true); // Allow for hue wrapping
      });
    });
  });

  describe('Random Color Generation', () => {
    test('generateRandomColor returns valid hex color', () => {
      const color = generateRandomColor();
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    test('generateRandomColor generates different colors', () => {
      const color1 = generateRandomColor();
      const color2 = generateRandomColor();
      const color3 = generateRandomColor();
      
      // Very unlikely to generate same color 3 times
      expect(color1 === color2 && color2 === color3).toBe(false);
    });
  });
});

// 运行测试的入口
if (require.main === module) {
  console.log('Running colorUtils tests...');
  console.log('Note: This test file should be run with Jest or Vitest');
  console.log('Command: npm test or npx jest src/lib/__tests__/colorUtils.test.ts');
}
