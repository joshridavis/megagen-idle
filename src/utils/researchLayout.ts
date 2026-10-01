export interface LayoutInput {
  id: string;
  prerequisites: string[];
  requiredLevel: number;
}

export interface NodePosition {
  col: number;
  row: number;
}

export interface TreeLayout {
  positions: Record<string, NodePosition>;
  cols: number;
  rows: number;
  edges: { from: string; to: string }[];
}

/**
 * Computed layered layout: a node's column is one past its deepest
 * prerequisite, so every edge points right. Within a column, nodes are
 * ordered by the average row of their prerequisites (fewer crossings), then
 * by level requirement, then by data order. Unknown prerequisites are ignored.
 */
export function computeResearchLayout(nodes: LayoutInput[]): TreeLayout {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const depth = new Map<string, number>();
  const visiting = new Set<string>();
  const depthOf = (id: string): number => {
    const known = depth.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return 0; // cycle guard; the tree validator (0.45) rejects cycles
    visiting.add(id);
    const n = byId.get(id)!;
    const d = Math.max(-1, ...n.prerequisites.filter((p) => byId.has(p)).map(depthOf)) + 1;
    visiting.delete(id);
    depth.set(id, d);
    return d;
  };
  nodes.forEach((n) => depthOf(n.id));

  const cols = nodes.length ? Math.max(...depth.values()) + 1 : 0;
  const positions: Record<string, NodePosition> = {};
  let rows = 0;
  for (let c = 0; c < cols; c++) {
    const column = nodes
      .map((n, index) => ({ n, index }))
      .filter(({ n }) => depth.get(n.id) === c)
      .map(({ n, index }) => {
        const prereqRows = n.prerequisites.filter((p) => positions[p]).map((p) => positions[p].row);
        const bary = prereqRows.length ? prereqRows.reduce((a, b) => a + b, 0) / prereqRows.length : -1;
        return { n, index, bary };
      })
      .sort((a, b) => a.bary - b.bary || a.n.requiredLevel - b.n.requiredLevel || a.index - b.index);
    column.forEach(({ n }, row) => (positions[n.id] = { col: c, row }));
    rows = Math.max(rows, column.length);
  }
  const edges = nodes.flatMap((n) => n.prerequisites.filter((p) => byId.has(p)).map((p) => ({ from: p, to: n.id })));
  return { positions, cols, rows, edges };
}
