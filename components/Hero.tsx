'use client';

import { useState } from 'react';
import copy from '@/content/copy.json';
import { emit } from '@/lib/analytics';

interface HeroProps {
  onBegin: () => void;
}

export default function Hero({ onBegin }: HeroProps) {
  const handleBegin = () => {
    emit('ui.begin_clicked');
    onBegin();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-light mb-4 text-foreground">
        {copy.idle.headline}
      </h1>
      <p className="text-lg md:text-xl mb-8 text-foreground/80 max-w-2xl">
        {copy.idle.subtext}
      </p>
      <button
        onClick={handleBegin}
        className="px-8 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
      >
        {copy.idle.primaryButton}
      </button>
    </div>
  );
}

