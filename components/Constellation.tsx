'use client';

import { useEffect, useState } from 'react';
import { getConstellationNodes, type ConstellationNode } from '@/lib/storage';
import copy from '@/content/copy.json';

export default function Constellation() {
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getConstellationNodes().then((data) => {
      setNodes(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-light mb-4">{copy.constellation.title}</h2>
        <p className="text-foreground/60">{copy.constellation.loading}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-light mb-4">{copy.constellation.title}</h2>
      
      {nodes.length === 0 ? (
        <p className="text-foreground/60">{copy.constellation.empty}</p>
      ) : (
        <div className="space-y-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="p-4 border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              <h3 className="font-medium mb-2">{node.title}</h3>
              <p className="text-foreground/70 text-sm mb-2">{node.note}</p>
              {node.tags && node.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {node.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-foreground/10 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Save toggle - visible but disabled/stubbed for Sprint 1 */}
      <div className="mt-6 pt-6 border-t border-foreground/10">
        <label className="flex items-center gap-3 cursor-not-allowed opacity-50">
          <input
            type="checkbox"
            disabled
            className="w-4 h-4"
            aria-label={copy.constellation.saveToggle}
          />
          <span className="text-sm text-foreground/70">
            {copy.constellation.saveToggle}
          </span>
        </label>
        <p className="text-xs text-foreground/50 mt-2 ml-7">
          {copy.constellation.saveToggleDisabled}
        </p>
      </div>
    </div>
  );
}

