import { useState, useCallback } from 'react';
import { colorToParam } from '@/lib/utils';

export function useGradientGenerator() {
  const [colors, setColors] = useState<string[]>(['#5135FF', '#FF5828', '#F69CFF', '#FFA50F']);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateGradient = useCallback(async () => {
    setIsGenerating(true);
    try {
      const params = new URLSearchParams();
      colors.forEach(color => params.append('colors', colorToParam(color)));
      params.append('width', width.toString());
      params.append('height', height.toString());
      const response = await fetch(`/api?${params.toString()}`);
      const svg = await response.text();
      setSvgContent(svg);
    } catch (error) {
      console.error('Error generating gradient:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [colors, width, height]);

  const downloadGradient = useCallback(() => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gradient-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [svgContent]);

  return {
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
  };
}