'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import EmberVisual from '@/components/EmberVisual';
import VoiceComposerDialog from '@/components/VoiceComposerDialog';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12">
      <EmberVisual />
      <Hero onBegin={() => setIsDialogOpen(true)} />
      <VoiceComposerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}

