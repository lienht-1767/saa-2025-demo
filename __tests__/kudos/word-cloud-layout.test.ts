import { describe, expect, it } from "vitest";

import { computeWordCloudLayout } from "@/lib/kudos/word-cloud-layout";
import type { KudosSpotlightNode } from "@/lib/kudos/types";

const NODES: KudosSpotlightNode[] = [
  { id: "a", name: "Alice", kudosCount: 5, lastKudosAt: "2025-10-01T00:00:00.000Z", latestKudosId: "ka" },
  { id: "b", name: "Bob", kudosCount: 50, lastKudosAt: "2025-10-02T00:00:00.000Z", latestKudosId: "kb", highlighted: true },
  { id: "c", name: "Cara", kudosCount: 20, lastKudosAt: "2025-10-03T00:00:00.000Z", latestKudosId: "kc" },
];

describe("computeWordCloudLayout", () => {
  it("places every node within the given board bounds", () => {
    const layout = computeWordCloudLayout(NODES, { width: 800, height: 400 });

    expect(layout).toHaveLength(3);
    for (const placement of layout) {
      expect(placement.x).toBeGreaterThanOrEqual(0);
      expect(placement.x).toBeLessThanOrEqual(800);
      expect(placement.y).toBeGreaterThanOrEqual(0);
      expect(placement.y).toBeLessThanOrEqual(400);
    }
  });

  it("is deterministic for the same input", () => {
    const first = computeWordCloudLayout(NODES, { width: 800, height: 400 });
    const second = computeWordCloudLayout(NODES, { width: 800, height: 400 });

    expect(second).toEqual(first);
  });

  it("scales font size up with kudos count", () => {
    const layout = computeWordCloudLayout(NODES, { width: 800, height: 400 });
    const byId = Object.fromEntries(layout.map((p) => [p.id, p]));

    expect(byId.b.fontSize).toBeGreaterThan(byId.c.fontSize);
    expect(byId.c.fontSize).toBeGreaterThan(byId.a.fontSize);
  });

  it("carries the highlighted flag through so the caller can render it red", () => {
    const layout = computeWordCloudLayout(NODES, { width: 800, height: 400 });
    const byId = Object.fromEntries(layout.map((p) => [p.id, p]));

    expect(byId.b.highlighted).toBe(true);
    expect(byId.a.highlighted).toBe(false);
  });


  // Regression 1: the original derived x from `hash % N` and y from `floor(hash / N) % N` of one
  // djb2 hash. Those axes are not independent — sequential seeded UUIDs hashed to nearby values,
  // so `floor(hash / N)` was identical for every node and all 15 real names stacked in a 4px box.
  // Regression 2: spreading them out was not enough — distinct anchors still collide once the
  // glyphs are drawn. The real invariant is that no two rendered boxes may intersect, and none
  // may sit on the ticker in the bottom-left corner.
  const CHAR_WIDTH_RATIO = 0.56;
  const GAP = 8;

  function boxOf(p: { x: number; y: number; name: string; fontSize: number }) {
    const halfWidth = (p.name.length * p.fontSize * CHAR_WIDTH_RATIO) / 2;
    return {
      left: p.x - halfWidth - GAP / 2,
      right: p.x + halfWidth + GAP / 2,
      top: p.y - p.fontSize * 0.82 - GAP / 2,
      bottom: p.y + p.fontSize * 0.24 + GAP / 2,
    };
  }

  function intersects(a: ReturnType<typeof boxOf>, b: ReturnType<typeof boxOf>) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  const REAL_NAMES = [
    "Nguyễn Hoàng Linh", "Đỗ Hoàng Hiệp", "Mai Phương Thúy", "Lê Kiều Trang",
    "Nguyễn Văn Quý", "Huỳnh Dương Xuân", "Nguyễn Bá Chức", "Dương Thúy An",
    "Trần Minh Khôi", "Phạm Thị Hồng", "Vũ Đức Anh", "Ngô Thanh Tâm",
    "Bùi Gia Huy", "Đặng Yến Nhi", "Lý Hoàng Nam",
  ];
  const REAL_COUNTS = [50, 20, 10, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1];
  const SEEDED: KudosSpotlightNode[] = REAL_NAMES.map((name, index) => ({
    id: `30000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
    name,
    kudosCount: REAL_COUNTS[index],
    lastKudosAt: "2025-10-01T00:00:00.000Z",
    latestKudosId: `k${index}`,
  }));

  it("spreads sequential ids across the board instead of stacking them", () => {
    const layout = computeWordCloudLayout(SEEDED, { width: 1100, height: 480 });
    const spreadX = Math.max(...layout.map((p) => p.x)) - Math.min(...layout.map((p) => p.x));
    const spreadY = Math.max(...layout.map((p) => p.y)) - Math.min(...layout.map((p) => p.y));

    expect(spreadX).toBeGreaterThan(1100 * 0.4);
    expect(spreadY).toBeGreaterThan(480 * 0.4);
  });

  it("never lets two rendered names overlap", () => {
    const layout = computeWordCloudLayout(SEEDED, { width: 1100, height: 480 });
    const boxes = layout.map(boxOf);

    const collisions: string[] = [];
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        if (intersects(boxes[i], boxes[j])) collisions.push(`${layout[i].name} × ${layout[j].name}`);
      }
    }

    expect(collisions).toEqual([]);
  });

  it("keeps names out of the bottom-left corner where the ticker sits", () => {
    const layout = computeWordCloudLayout(SEEDED, { width: 1100, height: 480 });
    const ticker = { left: 0, right: 1100 * 0.52, top: 480 * (1 - 0.34), bottom: 480 };

    const intruders = layout.filter((p) => intersects(boxOf(p), ticker)).map((p) => p.name);
    expect(intruders).toEqual([]);
  });

  it("keeps every rendered name fully inside the board", () => {
    const layout = computeWordCloudLayout(SEEDED, { width: 1100, height: 480 });

    for (const placement of layout) {
      const box = boxOf(placement);
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(1100);
      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(box.bottom).toBeLessThanOrEqual(480);
    }
  });

  it("returns an empty layout for an empty node list", () => {
    expect(computeWordCloudLayout([], { width: 800, height: 400 })).toEqual([]);
  });
});
