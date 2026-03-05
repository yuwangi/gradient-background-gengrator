'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGradientGenerator } from '@/hooks/useGradientGenerator';
import { colorPresets } from '@/lib/constants';
import { colorToParam, cn } from '@/lib/utils';
import { ColorWheel, type SelectionMode } from '@/components/ColorWheel';
import { HarmonySuggestions } from '@/components/HarmonySuggestions';
import { generateHarmonyColors, hslToHex } from '@/lib/colorUtils';
import { 
  Download, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Palette, 
  Sparkles, 
  Layers, 
  Code, 
  Zap,
  MousePointer2,
  Wand2,
  Shuffle
} from 'lucide-react';

export default function GradientGenerator() {
  const {
    colors,
    setColors,
    width,
    setWidth,
    height,
    setHeight,
    svgContent,
    isGenerating,
    generateGradient,
    downloadGradient
  } = useGradientGenerator();

  const [apiLinkCopied, setApiLinkCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // 新模式的状态
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('free');
  const [primaryColor, setPrimaryColor] = useState(colors[0] || '#5135FF');
  const [secondaryColor, setSecondaryColor] = useState(colors[1] || '#FF5828');
  const [newColor, setNewColor] = useState('');

  useEffect(() => {
    setMounted(true);
    generateGradient();
  }, [generateGradient]);

  // 初始化时只保留两个颜色
  useEffect(() => {
    if (colors.length > 2) {
      setColors(colors.slice(0, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当主颜色变化时，如果是推荐模式，自动更新次颜色
  useEffect(() => {
    if (selectionMode === 'recommend') {
      const harmonyColors = generateHarmonyColors(primaryColor, 'complementary');
      if (harmonyColors.length > 1) {
        setSecondaryColor(harmonyColors[1]);
      }
    }
    // 更新颜色列表
    updateColorsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryColor, selectionMode]);

  // 当次颜色变化时更新颜色列表
  useEffect(() => {
    updateColorsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondaryColor]);

  const updateColorsList = useCallback(() => {
    // 只保留两个颜色
    const newColors = [primaryColor, secondaryColor];
    setColors(newColors);
  }, [primaryColor, secondaryColor, setColors]);

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
    
    // 同步更新主/次颜色
    if (index === 0) setPrimaryColor(color);
    if (index === 1) setSecondaryColor(color);
  };

  const addColor = () => {
    if (newColor && colors.length < 8) {
      setColors([...colors, newColor]);
      setNewColor('');
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
    }
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    // 只应用前两个颜色
    const limitedColors = preset.colors.slice(0, 2);
    setColors(limitedColors);
    if (limitedColors.length >= 1) setPrimaryColor(limitedColors[0]);
    if (limitedColors.length >= 2) setSecondaryColor(limitedColors[1]);
  };

  const applyHarmonyColors = (harmonyColors: string[]) => {
    // 只应用前两个颜色
    const limitedColors = harmonyColors.slice(0, 2);
    setColors(limitedColors);
    if (limitedColors.length >= 1) setPrimaryColor(limitedColors[0]);
    if (limitedColors.length >= 2) setSecondaryColor(limitedColors[1]);
  };

  const generateApiLink = () => {
    if (!mounted) return '';
    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/api`
      : '/api';
    const params = new URLSearchParams();
    colors.forEach(color => params.append('colors', colorToParam(color)));
    params.append('width', width.toString());
    params.append('height', height.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const copyApiLink = async () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        const apiLink = generateApiLink();
        await navigator.clipboard.writeText(apiLink);
        setApiLinkCopied(true);
        setTimeout(() => setApiLinkCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy API link:', err);
      }
    }
  };

  const randomizeColors = () => {
    const randomColor1 = hslToHex({
      h: Math.floor(Math.random() * 360),
      s: 60 + Math.floor(Math.random() * 40),
      l: 40 + Math.floor(Math.random() * 40)
    });
    const randomColor2 = hslToHex({
      h: Math.floor(Math.random() * 360),
      s: 60 + Math.floor(Math.random() * 40),
      l: 40 + Math.floor(Math.random() * 40)
    });
    setPrimaryColor(randomColor1);
    setSecondaryColor(randomColor2);
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 animate-fade-in">
            <Palette className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight">
            Gradient Generator
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
            Create stunning, randomized SVG gradients for your next project. 
            <span className="text-primary font-medium ml-1">Simple, fast, and open source.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-1.5 sm:p-2">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center border border-border/50">
                {svgContent ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    className="w-full h-full transform transition-transform duration-500 hover:scale-[1.01] [&>svg]:w-full [&>svg]:h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-muted border-t-primary"></div>
                    <span className="text-sm font-medium font-display">Generating...</span>
                  </div>
                )}
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    onClick={generateGradient} 
                    disabled={isGenerating}
                    size="sm"
                    className="bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-foreground shadow-sm backdrop-blur-sm border border-black/5 dark:border-white/10"
                  >
                    <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                onClick={downloadGradient} 
                disabled={!svgContent}
                className="flex-1 h-12 text-base font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Download SVG
              </Button>
              <Button 
                variant="outline"
                className="flex-1 h-12 text-base font-medium border-2 hover:bg-muted/50"
                onClick={copyApiLink}
              >
                 <Code className="w-5 h-5 mr-2" />
                 {apiLinkCopied ? 'Link Copied!' : 'Copy API Link'}
              </Button>
            </div>

            {/* API Section */}
            <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 font-display text-lg font-semibold">
                <Zap className="w-5 h-5 text-chart-2" />
                <span>Developer API</span>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 font-mono text-xs sm:text-sm text-muted-foreground break-all shadow-sm">
                {generateApiLink() || 'Loading...'}
              </div>
               <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Hex colors required</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                    <span>Auto-optimized</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 色轮色彩选择器 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-semibold text-lg">Color Wheel</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={randomizeColors}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Shuffle className="w-4 h-4 mr-1" />
                  Random
                </Button>
              </div>

              {/* 模式切换 */}
              <div className="flex gap-2 p-1 bg-muted rounded-xl">
                <button
                  onClick={() => setSelectionMode('free')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                    selectionMode === 'free' 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MousePointer2 className="w-4 h-4" />
                  Free Select
                </button>
                <button
                  onClick={() => setSelectionMode('recommend')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                    selectionMode === 'recommend' 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Wand2 className="w-4 h-4" />
                  Recommend
                </button>
              </div>

              {/* 色轮 */}
              <ColorWheel
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                onPrimaryChange={setPrimaryColor}
                onSecondaryChange={setSecondaryColor}
                mode={selectionMode}
              />

              {/* 当前颜色显示 */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Primary</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <Input
                      type="text"
                      value={primaryColor.toUpperCase()}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono text-sm uppercase flex-1"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Secondary</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <Input
                      type="text"
                      value={secondaryColor.toUpperCase()}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="font-mono text-sm uppercase flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* 推荐配色方案（仅在推荐模式下显示） */}
              {selectionMode === 'recommend' && (
                <HarmonySuggestions
                  baseColor={primaryColor}
                  onSelect={applyHarmonyColors}
                  selectedColors={colors}
                />
              )}
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                 <Layers className="w-5 h-5 text-primary" />
                 <h2 className="font-display font-semibold text-lg">Dimensions</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Width</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Height</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* All Colors - 只显示两个颜色 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-semibold text-lg">All Colors</h2>
                </div>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground">
                  {colors.length}/2
                </span>
              </div>
              
              <div className="space-y-3">
                {colors.slice(0, 2).map((color, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="relative flex-shrink-0">
                       <Input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="w-10 h-10 p-1 rounded-lg cursor-pointer border-2 hover:border-primary transition-colors"
                      />
                    </div>
                    <Input
                      type="text"
                      value={color.toUpperCase()}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="font-mono text-sm tracking-wider uppercase"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Presets */}
             <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                 <Sparkles className="w-5 h-5 text-primary" />
                 <h2 className="font-display font-semibold text-lg">Presets</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="group relative overflow-hidden rounded-lg aspect-[3/2] border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div 
                      className="absolute inset-0" 
                      style={{ background: `linear-gradient(135deg, ${preset.colors.slice(0, 2).join(', ')})` }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
