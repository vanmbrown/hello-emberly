/**
 * Storage utilities for Hello Emberly constellation.
 * Demo-only for Sprint 1 - no real IndexedDB saving yet.
 */

export interface ConstellationNode {
  id: string;
  title: string;
  note: string;
  tags?: string[];
  created_at: string;
}

/**
 * Demo constellation data for Sprint 1.
 */
const DEMO_CONSTELLATION: ConstellationNode[] = [
  {
    id: 'demo-1',
    title: 'Morning reflection',
    note: 'A quiet moment to start the day with intention.',
    tags: ['morning', 'reflection'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Gratitude note',
    note: 'Remembering the small moments that bring joy.',
    tags: ['gratitude'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Connection',
    note: 'A reminder that we are never truly alone.',
    tags: ['connection', 'community'],
    created_at: new Date().toISOString(),
  },
];

/**
 * Get demo constellation nodes.
 * In Sprint 2, this will read from IndexedDB.
 */
export async function getConstellationNodes(): Promise<ConstellationNode[]> {
  // Demo-only: return hardcoded data
  return Promise.resolve([...DEMO_CONSTELLATION]);
}

/**
 * Save a node to constellation.
 * Stubbed for Sprint 1 - does nothing.
 */
export async function saveConstellationNode(node: Omit<ConstellationNode, 'id' | 'created_at'>): Promise<void> {
  // Stub: no real saving in Sprint 1
  console.log('[Storage] Save node (stubbed):', node);
  return Promise.resolve();
}

/**
 * Delete a node from constellation.
 * Stubbed for Sprint 1 - does nothing.
 */
export async function deleteConstellationNode(nodeId: string): Promise<void> {
  // Stub: no real deletion in Sprint 1
  console.log('[Storage] Delete node (stubbed):', nodeId);
  return Promise.resolve();
}

/**
 * Clear all constellation nodes.
 * Stubbed for Sprint 1 - does nothing.
 */
export async function clearConstellation(): Promise<void> {
  // Stub: no real clearing in Sprint 1
  console.log('[Storage] Clear constellation (stubbed)');
  return Promise.resolve();
}

