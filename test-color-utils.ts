/**
 * 色彩工具库测试脚本
 * 运行方式: npx ts-node test-color-utils.ts
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
} from './src/lib/colorUtils';

// 测试工具函数
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ Test failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`❌ Test failed: ${message}\nExpected: ${expectedStr}\nActual: ${actualStr}`);
  }
  console.log(`✅ ${message}`);
}

function assertApprox(actual: number, expected: number, tolerance: number, message: string): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`❌ Test failed: ${message}\nExpected: ${expected} (±${tolerance})\nActual: ${actual}`);
  }
  console.log(`✅ ${message}`);
}

// 运行测试
console.log('\n🎨 Color Utils Test Suite\n');
console.log('========================\n');

try {
  // 基本转换测试
  console.log('📦 Basic Conversions');
  console.log('---------------------');
  
  assertEqual(hexToRgb('#FF0000'), { r: 255, g: 0, b: 0 }, 'hexToRgb converts red correctly');
  assertEqual(hexToRgb('#00FF00'), { r: 0, g: 255, b: 0 }, 'hexToRgb converts green correctly');
  assertEqual(hexToRgb('#0000FF'), { r: 0, g: 0, b: 255 }, 'hexToRgb converts blue correctly');
  
  assertEqual(rgbToHex({ r: 255, g: 0, b: 0 }), '#ff0000', 'rgbToHex converts red correctly');
  assertEqual(rgbToHex({ r: 0, g: 255, b: 0 }), '#00ff00', 'rgbToHex converts green correctly');
  
  const redHsl = rgbToHsl({ r: 255, g: 0, b: 0 });
  assertApprox(redHsl.h, 0, 1, 'rgbToHsl red hue is correct');
  assertApprox(redHsl.s, 100, 1, 'rgbToHsl red saturation is correct');
  assertApprox(redHsl.l, 50, 1, 'rgbToHsl red lightness is correct');
  
  const redRgb = hslToRgb({ h: 0, s: 100, l: 50 });
  assertApprox(redRgb.r, 255, 1, 'hslToRgb red R is correct');
  assertApprox(redRgb.g, 0, 1, 'hslToRgb red G is correct');
  assertApprox(redRgb.b, 0, 1, 'hslToRgb red B is correct');
  
  console.log('\n');
  
  // 色差测试
  console.log('📏 Color Distance');
  console.log('------------------');
  
  const sameColor = { h: 180, s: 50, l: 50 };
  assertEqual(colorDistance(sameColor, sameColor), 0, 'same color has zero distance');
  
  const red = { h: 0, s: 100, l: 50 };
  const cyan = { h: 180, s: 100, l: 50 };
  assert(colorDistance(red, cyan) > 100, 'complementary colors have large distance');
  
  const color1 = { h: 180, s: 50, l: 50 };
  const color2 = { h: 185, s: 52, l: 48 };
  assert(colorDistance(color1, color2) < 20, 'similar colors have small distance');
  
  console.log('\n');
  
  // 色彩和谐测试
  console.log('🌈 Harmony Colors Generation');
  console.log('-----------------------------');
  
  const compColors = generateHarmonyColors('#FF0000', 'complementary');
  assertEqual(compColors.length, 2, 'complementary harmony generates 2 colors');
  assertEqual(compColors[0], '#FF0000', 'complementary harmony preserves base color');
  
  const analogousColors = generateHarmonyColors('#FF0000', 'analogous');
  assertEqual(analogousColors.length, 3, 'analogous harmony generates 3 colors');
  
  const triadicColors = generateHarmonyColors('#FF0000', 'triadic');
  assertEqual(triadicColors.length, 3, 'triadic harmony generates 3 colors');
  
  const splitCompColors = generateHarmonyColors('#FF0000', 'split-complementary');
  assertEqual(splitCompColors.length, 3, 'split-complementary harmony generates 3 colors');
  
  const tetradicColors = generateHarmonyColors('#FF0000', 'tetradic');
  assertEqual(tetradicColors.length, 4, 'tetradic harmony generates 4 colors');
  
  const monoColors = generateHarmonyColors('#FF0000', 'monochromatic');
  assertEqual(monoColors.length, 3, 'monochromatic harmony generates 3 colors');
  
  // 测试所有和谐类型都保留基础颜色
  const baseColor = '#5135FF';
  const harmonyTypes: HarmonyType[] = [
    'complementary', 'analogous', 'triadic', 
    'split-complementary', 'tetradic', 'monochromatic'
  ];
  
  harmonyTypes.forEach(type => {
    const colors = generateHarmonyColors(baseColor, type);
    assertEqual(colors[0], baseColor, `${type} harmony preserves base color`);
  });
  
  console.log('\n');
  
  // 推荐配色方案测试
  console.log('💡 Harmony Suggestions');
  console.log('-----------------------');
  
  const suggestions = getAllHarmonySuggestions('#FF0000');
  assertEqual(suggestions.length, 6, 'returns all 6 harmony types');
  
  const names = suggestions.map(s => s.name);
  assert(names.includes('互补色'), 'includes complementary harmony');
  assert(names.includes('类似色'), 'includes analogous harmony');
  assert(names.includes('三角色'), 'includes triadic harmony');
  
  console.log('\n');
  
  // 色轮位置测试
  console.log('🎯 Color Wheel Position');
  console.log('------------------------');
  
  const wheelColor = getColorFromWheelPosition(0.5, 0.5);
  assert(/^#[0-9A-Fa-f]{6}$/.test(wheelColor), 'getColorFromWheelPosition returns valid hex');
  
  const position = getWheelPositionFromColor('#FF0000');
  assert(typeof position.x === 'number', 'getWheelPositionFromColor returns x coordinate');
  assert(typeof position.y === 'number', 'getWheelPositionFromColor returns y coordinate');
  
  console.log('\n');
  
  // 随机颜色测试
  console.log('🎲 Random Color Generation');
  console.log('---------------------------');
  
  const randomColor1 = generateRandomColor();
  assert(/^#[0-9A-Fa-f]{6}$/.test(randomColor1), 'generateRandomColor returns valid hex');
  
  const randomColor2 = generateRandomColor();
  const randomColor3 = generateRandomColor();
  assert(!(randomColor1 === randomColor2 && randomColor2 === randomColor3), 
    'generateRandomColor generates different colors');
  
  console.log('\n');
  
  // 打印示例配色方案
  console.log('🎨 Sample Harmony Palettes');
  console.log('---------------------------');
  
  const sampleBaseColor = '#5135FF';
  const sampleSuggestions = getAllHarmonySuggestions(sampleBaseColor);
  
  sampleSuggestions.forEach(suggestion => {
    console.log(`\n${suggestion.name} (${suggestion.type}):`);
    console.log(`  Base: ${suggestion.colors[0]}`);
    suggestion.colors.slice(1).forEach((color, i) => {
      console.log(`  ${i + 2}. ${color}`);
    });
  });
  
  console.log('\n');
  console.log('========================');
  console.log('✨ All tests passed!');
  console.log('========================\n');
  
} catch (error) {
  console.error('\n❌ Test suite failed!');
  console.error(error);
  process.exit(1);
}
