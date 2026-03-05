'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getAllHarmonySuggestions } from '@/lib/colorUtils';
import { Check, Sparkles } from 'lucide-react';

interface HarmonySuggestionsProps {
  baseColor: string;
  onSelect: (colors: string[]) => void;
  selectedColors?: string[];
}

export function HarmonySuggestions({
  baseColor,
  onSelect,
  selectedColors
}: HarmonySuggestionsProps) {
  const suggestions = getAllHarmonySuggestions(baseColor);
  // 使用 state 来跟踪当前正在预览的颜色，但不立即应用到父组件
  const [previewColors, setPreviewColors] = useState<string[] | null>(null);

  const isSelected = (colors: string[]) => {
    const compareColors = previewColors || selectedColors;
    if (!compareColors || compareColors.length !== colors.length) return false;
    return colors.every((color, index) => 
      color.toLowerCase() === compareColors[index].toLowerCase()
    );
  };

  // 处理点击 - 立即应用
  const handleClick = useCallback((colors: string[]) => {
    setPreviewColors(colors);
    onSelect(colors);
  }, [onSelect]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="w-4 h-4 text-primary" />
        <span>推荐配色方案</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.type}
            onClick={() => handleClick(suggestion.colors)}
            className={cn(
              "group relative overflow-hidden rounded-xl border-2 transition-all duration-200",
              "hover:shadow-md hover:-translate-y-0.5",
              isSelected(suggestion.colors) 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
          >
            {/* 颜色预览条 */}
            <div 
              className="h-10 flex"
              style={{
                background: suggestion.colors.slice(0, 4).map((c: string, i: number) => {
                  const percentage = 100 / suggestion.colors.slice(0, 4).length;
                  return `${c} ${i * percentage}% ${(i + 1) * percentage}%`;
                }).join(', ')
              }}
            >
              {suggestion.colors.slice(0, 4).map((color: string, index: number) => (
                <div
                  key={index}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* 标签 */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-card">
              <span className="text-xs font-medium">{suggestion.name}</span>
              {isSelected(suggestion.colors) && (
                <Check className="w-3 h-3 text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
