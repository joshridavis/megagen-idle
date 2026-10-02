export interface LayoutInput {
  id: string;
  prerequisites: string[];
  requiredLevel: number;
}

export interface NodePosition {
  col: number;
  /** Global row (band start + row inside the band). */
  row: number;
  /** Index of the branch band this node belongs to. */
  band: number;
}

export interface Band {
  /** The starting research this branch grows from. */
  root: string;
  startRow: number;
  rows: number;
}

export interface TreeLayout {
  positions: Record<string, NodePosition>;
  cols: number;
  rows: number;
  bands: Band[];
  /** `crossBranch` edges link two different branches (drawn fainter). */
  edges: { from: string; to: string; crossBranch: boolean }[];
}

/**
 * Branch layout (0.81, playtest 9): every research belongs to the branch of
 * the root it descends from through its first known prerequisite. Branches
 * are stacked as horizontal bands, in data order of their roots. A node's
 * column is one past its deepest prerequisite (globally, so every edge points
 * right). Inside a band, a column is ordered by the average row of in-band
 * prerequisites, then level requirement, then data order; each node then takes
 * the free row nearest that average (playtest 11: chains stay on one line).
 * Unknown prerequisites are ignored; cycles are guarded (rejected in 0.45).
 */
export function computeResearchLayout(nodes: LayoutInput[]): TreeLayout {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const known = (n: LayoutInput) => n.prerequisites.filter((p) => byId.has(p));

  const depth = new Map<string, number>();
  const visiting = new Set<string>();
  const depthOf = (id: string): number => {
    const d0 = depth.get(id);
    if (d0 !== undefined) return d0;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const d = Math.max(-1, ...known(byId.get(id)!).map(depthOf)) + 1;
    visiting.delete(id);
    depth.set(id, d);
    return d;
  };

  const rootOf = new Map<string, string>();
  const findRoot = (id: string, seen = new Set<string>()): string => {
    const r0 = rootOf.get(id);
    if (r0) return r0;
    const first = known(byId.get(id)!)[0];
    const r = !first || seen.has(first) ? id : findRoot(first, new Set(seen).add(id));
    rootOf.set(id, r);
    return r;
  };

  nodes.forEach((n) => {
    depthOf(n.id);
    findRoot(n.id);
  });

  const roots = nodes.filter((n) => rootOf.get(n.id) === n.id).map((n) => n.id);
  const cols = nodes.length ? Math.max(...depth.values()) + 1 : 0;
  const positions: Record<string, NodePosition> = {};
  const bands: Band[] = [];
  let nextRow = 0;

  roots.forEach((root, bandIndex) => {
    const members = nodes.map((n, index) => ({ n, index })).filter(({ n }) => rootOf.get(n.id) === root);
    const local: Record<string, number> = {};
    let rows = 0;
    for (let c = 0; c < cols; c++) {
      const column = members
        .filter(({ n }) => depth.get(n.id) === c)
        .map(({ n, index }) => {
          const inBand = known(n).filter((p) => local[p] !== undefined).map((p) => local[p]);
          const bary = inBand.length ? inBand.reduce((a, b) => a + b, 0) / inBand.length : -1;
          return { n, index, bary };
        })
        .sort((a, b) => a.bary - b.bary || a.n.requiredLevel - b.n.requiredLevel || a.index - b.index);
      // Each node takes the free row nearest its prerequisites' rows, so a
      // lone child stays beside its parent instead of jumping to the top.
      const taken = new Set<number>();
      column.forEach(({ n, bary }) => {
        const want = bary < 0 ? 0 : Math.round(bary);
        let r = want;
        for (let d = 0; taken.has(r); d++) r = want + (d % 2 ? -(d + 1) / 2 : d / 2 + 1);
        if (r < 0) for (r = 0; taken.has(r); r++);
        taken.add(r);
        local[n.id] = r;
        positions[n.id] = { col: c, row: nextRow + r, band: bandIndex };
        rows = Math.max(rows, r + 1);
      });
    }
    bands.push({ root, startRow: nextRow, rows });
    nextRow += rows;
  });

  const edges = nodes.flatMap((n) =>
    known(n).map((p) => ({ from: p, to: n.id, crossBranch: rootOf.get(p) !== rootOf.get(n.id) })),
  );
  return { positions, cols, rows: nextRow, bands, edges };
}
