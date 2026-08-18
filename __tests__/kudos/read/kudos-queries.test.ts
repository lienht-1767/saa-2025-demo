import { describe, expect, it, vi } from "vitest";

import {
  fetchDepartmentCatalog,
  fetchFeedRows,
  fetchHashtagCatalog,
  fetchHighlightRows,
  fetchTickerRows,
  fetchTotalKudosCount,
  fetchViewerLikedIds,
  fetchViewerProfile,
  fetchViewerSentKudos,
  type KudosSupabaseClient,
} from "@/lib/kudos/read/kudos-queries";

/**
 * A minimal fluent stub of the Supabase/PostgREST query builder: every chain method records its
 * call and returns the same object, and the object is itself "thenable" so `await query` and
 * `Promise.all([query, ...])` both resolve it — mirroring how the real builder behaves.
 */
function createQueryBuilder(finalResult: unknown) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    range: vi.fn(() => builder),
    gt: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(finalResult)),
    then: (resolve: (value: unknown) => void) => Promise.resolve(finalResult).then(resolve),
  };
  return builder;
}

/** Single-table mock: every `.from(...)` call (whatever the table) returns the same builder. */
function createMockClient(finalResult: unknown = { data: [], error: null }) {
  const builder = createQueryBuilder(finalResult);
  const from = vi.fn(() => builder);
  return { client: { from } as unknown as KudosSupabaseClient, builder, from };
}

/**
 * Multi-table mock for the hashtag-filter path: `fetchHighlightRows`/`fetchFeedRows` first query
 * `kudos_hashtags` to resolve matching ids, then query `kudos` with `.in("id", ids)` — two
 * different tables need two different builders/results.
 */
function createMultiTableMockClient(resultsByTable: Record<string, unknown>) {
  const builders: Record<string, ReturnType<typeof createQueryBuilder>> = {};
  const from = vi.fn((table: string) => {
    const builder = createQueryBuilder(resultsByTable[table] ?? { data: [], error: null });
    builders[table] = builder;
    return builder;
  });
  return { client: { from } as unknown as KudosSupabaseClient, builders, from };
}

describe("fetchHighlightRows", () => {
  it("resolves matching ids from kudos_hashtags, then AND-combines the id and department filters", async () => {
    const { client, builders, from } = createMultiTableMockClient({
      kudos_hashtags: { data: [{ kudos_id: "k1" }, { kudos_id: "k2" }], error: null },
      kudos: { data: [], error: null },
    });

    await fetchHighlightRows(client, { hashtagId: "h1", departmentId: "d1" });

    expect(from).toHaveBeenCalledWith("kudos_hashtags");
    expect(from).toHaveBeenCalledWith("kudos");

    const idResolveEq = builders.kudos_hashtags.eq as ReturnType<typeof vi.fn>;
    expect(idResolveEq).toHaveBeenCalledWith("hashtag_id", "h1");

    const select = builders.kudos.select as ReturnType<typeof vi.fn>;
    expect(select.mock.calls[0]?.[0]).toContain("kudos_hashtags(hashtag_id, hashtag:hashtags(name))");
    expect(select.mock.calls[0]?.[0]).not.toContain("!inner");

    const mainEq = builders.kudos.eq as ReturnType<typeof vi.fn>;
    expect(mainEq).toHaveBeenCalledWith("department_id", "d1");
    const mainIn = builders.kudos.in as ReturnType<typeof vi.fn>;
    expect(mainIn).toHaveBeenCalledWith("id", ["k1", "k2"]);
    // The embed itself is never filtered by hashtag_id — narrowing happens via `.in("id", ids)`.
    expect(mainEq).not.toHaveBeenCalledWith("kudos_hashtags.hashtag_id", "h1");
  });

  it("short-circuits to an empty result without querying kudos when no kudos carries the filtered hashtag", async () => {
    const { client, builders, from } = createMultiTableMockClient({
      kudos_hashtags: { data: [], error: null },
    });

    const result = await fetchHighlightRows(client, { hashtagId: "h1", departmentId: null });

    expect(result).toEqual({ data: [], error: null });
    expect(from).toHaveBeenCalledWith("kudos_hashtags");
    expect(from).not.toHaveBeenCalledWith("kudos");
    expect(builders.kudos).toBeUndefined();
  });

  it("propagates an id-resolution error without querying kudos", async () => {
    const idResolutionError = { message: "boom", code: "500" };
    const { client, from } = createMultiTableMockClient({
      kudos_hashtags: { data: null, error: idResolutionError },
    });

    const result = await fetchHighlightRows(client, { hashtagId: "h1", departmentId: null });

    expect(result).toEqual({ data: null, error: idResolutionError });
    expect(from).not.toHaveBeenCalledWith("kudos");
  });

  it("skips the id resolution step and uses the left-join embed when no hashtag filter is set", async () => {
    const { client, builder, from } = createMockClient();

    await fetchHighlightRows(client, { hashtagId: null, departmentId: null });

    expect(from).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith("kudos");
    const select = builder.select as ReturnType<typeof vi.fn>;
    expect(select.mock.calls[0]?.[0]).toContain("kudos_hashtags(hashtag_id, hashtag:hashtags(name))");
    expect(select.mock.calls[0]?.[0]).not.toContain("!inner");
    expect(builder.eq).not.toHaveBeenCalled();
    expect(builder.in).not.toHaveBeenCalled();
  });

  it("orders by like_count desc then created_at desc and caps at 5", async () => {
    const { client, builder } = createMockClient();

    await fetchHighlightRows(client, { hashtagId: null, departmentId: null });

    const order = builder.order as ReturnType<typeof vi.fn>;
    expect(order).toHaveBeenNthCalledWith(1, "like_count", { ascending: false });
    expect(order).toHaveBeenNthCalledWith(2, "created_at", { ascending: false });
    expect(builder.limit).toHaveBeenCalledWith(5);
  });
});

describe("fetchFeedRows", () => {
  it("embeds kudos_images and ranges over pageSize + 1 rows", async () => {
    const { client, builder } = createMockClient();

    await fetchFeedRows(client, { hashtagId: null, departmentId: null }, 0, 10);

    const select = builder.select as ReturnType<typeof vi.fn>;
    expect(select.mock.calls[0]?.[0]).toContain("kudos_images(id, url, position)");
    expect(builder.range).toHaveBeenCalledWith(0, 10);
  });

  it("only applies the department filter when the hashtag filter is unset", async () => {
    const { client, builder } = createMockClient();

    await fetchFeedRows(client, { hashtagId: null, departmentId: "d1" }, 20, 10);

    expect(builder.eq).toHaveBeenCalledWith("department_id", "d1");
    expect(builder.eq).toHaveBeenCalledTimes(1);
    expect(builder.in).not.toHaveBeenCalled();
  });

  it("narrows by id via the resolved hashtag ids while keeping the range/pagination intact", async () => {
    const { client, builders } = createMultiTableMockClient({
      kudos_hashtags: { data: [{ kudos_id: "k1" }], error: null },
      kudos: { data: [], error: null },
    });

    await fetchFeedRows(client, { hashtagId: "h1", departmentId: "d1" }, 20, 10);

    const mainIn = builders.kudos.in as ReturnType<typeof vi.fn>;
    expect(mainIn).toHaveBeenCalledWith("id", ["k1"]);
    const mainEq = builders.kudos.eq as ReturnType<typeof vi.fn>;
    expect(mainEq).toHaveBeenCalledWith("department_id", "d1");
    expect(builders.kudos.range).toHaveBeenCalledWith(20, 30);
  });
});

describe("fetchViewerLikedIds", () => {
  it("scopes the kudos_likes read to the viewer and the visible kudos ids", () => {
    const { client, builder, from } = createMockClient();

    fetchViewerLikedIds(client, "viewer-1", ["k1", "k2"]);

    expect(from).toHaveBeenCalledWith("kudos_likes");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "viewer-1");
    expect(builder.in).toHaveBeenCalledWith("kudos_id", ["k1", "k2"]);
  });
});

describe("fetchViewerSentKudos and fetchViewerProfile", () => {
  it("reads only like_count for the viewer's own sent kudos", () => {
    const { client, builder, from } = createMockClient();

    fetchViewerSentKudos(client, "viewer-1");

    expect(from).toHaveBeenCalledWith("kudos");
    expect(builder.select).toHaveBeenCalledWith("like_count");
    expect(builder.eq).toHaveBeenCalledWith("sender_id", "viewer-1");
  });

  it("reads only kudos_received_count for the viewer's own profile, via maybeSingle", () => {
    const { client, builder, from } = createMockClient({ data: { kudos_received_count: 9 }, error: null });

    fetchViewerProfile(client, "viewer-1");

    expect(from).toHaveBeenCalledWith("profiles");
    expect(builder.select).toHaveBeenCalledWith("kudos_received_count");
    expect(builder.eq).toHaveBeenCalledWith("id", "viewer-1");
    expect(builder.maybeSingle).toHaveBeenCalled();
  });
});

describe("catalog and count queries", () => {
  it("fetchHashtagCatalog/fetchDepartmentCatalog select only id and name", () => {
    const hashtags = createMockClient();
    fetchHashtagCatalog(hashtags.client);
    expect(hashtags.from).toHaveBeenCalledWith("hashtags");
    expect(hashtags.builder.select).toHaveBeenCalledWith("id, name");

    const departments = createMockClient();
    fetchDepartmentCatalog(departments.client);
    expect(departments.from).toHaveBeenCalledWith("departments");
    expect(departments.builder.select).toHaveBeenCalledWith("id, name");
  });

  it("fetchTotalKudosCount issues a head-only exact count with no row transfer", () => {
    const { client, builder, from } = createMockClient({ count: 388, error: null });

    fetchTotalKudosCount(client);

    expect(from).toHaveBeenCalledWith("kudos");
    expect(builder.select).toHaveBeenCalledWith("*", { count: "exact", head: true });
  });

  it("fetchTickerRows is unfiltered and capped at 10", () => {
    const { client, builder } = createMockClient();

    fetchTickerRows(client);

    expect(builder.limit).toHaveBeenCalledWith(10);
    expect(builder.eq).not.toHaveBeenCalled();
  });
});

/**
 * Regression test for the Warning finding: a hashtag-filtered board must not truncate a matched
 * kudos's OTHER hashtags. The chain-spy mocks above only assert which methods were called — they
 * can't catch this bug because it lives in PostgREST's actual embed-filter semantics (a filter on
 * an embedded resource narrows the returned CHILD rows of that embed, not just parent-row
 * eligibility), which a spy that always returns a fixed `finalResult` never models.
 *
 * This fake client instead computes its result FROM the query's actual select-string/eq/in calls,
 * reproducing that one documented PostgREST behavior. It is intentionally narrow (only what this
 * test needs) rather than a general PostgREST simulator.
 */
type FakeKudosRow = {
  id: string;
  like_count: number;
  created_at: string;
  hashtagIds: readonly string[];
};

const FAKE_HASHTAG_NAMES: Record<string, string> = { h1: "teamspirit", h2: "dedicated" };

const FAKE_KUDOS: readonly FakeKudosRow[] = [
  { id: "k1", like_count: 3, created_at: "2026-01-01T00:00:00Z", hashtagIds: ["h1", "h2"] },
];

type FakeHashtagLink = { hashtag_id: string; hashtag: { name: string | null } };
type FakeKudosResultRow = {
  id: string;
  like_count: number;
  created_at: string;
  kudos_hashtags: FakeHashtagLink[];
};

function createEmbedAwareFakeClient() {
  function buildKudosResult(
    selectStr: string,
    eqCalls: ReadonlyArray<readonly [string, unknown]>,
    inCalls: ReadonlyArray<readonly [string, readonly unknown[]]>,
  ): FakeKudosResultRow[] {
    const isInnerHashtagEmbed = selectStr.includes("kudos_hashtags!inner");
    const embedFilterHashtagId = eqCalls.find(([col]) => col === "kudos_hashtags.hashtag_id")?.[1] as
      | string
      | undefined;
    const idFilter = inCalls.find(([col]) => col === "id")?.[1] as string[] | undefined;

    let rows = FAKE_KUDOS;
    if (idFilter) rows = rows.filter((row) => idFilter.includes(row.id));
    if (isInnerHashtagEmbed && embedFilterHashtagId) {
      const filterHashtagId = embedFilterHashtagId;
      rows = rows.filter((row) => row.hashtagIds.includes(filterHashtagId));
    }

    return rows.map((row) => {
      // The real-world bug: an `!inner`-filtered embed also narrows the CHILD rows returned, so a
      // kudos matched via the embed filter comes back with only the matching hashtag — not its
      // full set. The fix avoids this path entirely (id-narrowing + unfiltered embed).
      const visibleHashtagIds =
        isInnerHashtagEmbed && embedFilterHashtagId ? [embedFilterHashtagId] : row.hashtagIds;
      return {
        id: row.id,
        like_count: row.like_count,
        created_at: row.created_at,
        kudos_hashtags: visibleHashtagIds.map((hashtagId) => ({
          hashtag_id: hashtagId,
          hashtag: { name: FAKE_HASHTAG_NAMES[hashtagId] ?? null },
        })),
      };
    });
  }

  function createBuilder(table: string) {
    let selectStr = "";
    const eqCalls: Array<[string, unknown]> = [];
    const inCalls: Array<[string, readonly unknown[]]> = [];

    const builder: Record<string, unknown> = {
      select: vi.fn((s: string) => {
        selectStr = s;
        return builder;
      }),
      eq: vi.fn((col: string, val: unknown) => {
        eqCalls.push([col, val]);
        return builder;
      }),
      in: vi.fn((col: string, vals: readonly unknown[]) => {
        inCalls.push([col, vals]);
        return builder;
      }),
      order: vi.fn(() => builder),
      limit: vi.fn(() => builder),
      range: vi.fn(() => builder),
      then: (resolve: (value: unknown) => void) => {
        const result =
          table === "kudos_hashtags"
            ? {
                data: eqCalls
                  .filter(([col]) => col === "hashtag_id")
                  .flatMap(([, hashtagId]) =>
                    FAKE_KUDOS.filter((row) => row.hashtagIds.includes(hashtagId as string)).map((row) => ({
                      kudos_id: row.id,
                    })),
                  ),
                error: null,
              }
            : { data: buildKudosResult(selectStr, eqCalls, inCalls), error: null };
        return Promise.resolve(result).then(resolve);
      },
    };
    return builder;
  }

  const from = vi.fn((table: string) => createBuilder(table));
  return { client: { from } as unknown as KudosSupabaseClient };
}

describe("hashtag filter regression — matched kudos keeps its full hashtag set", () => {
  it("does not truncate a matched kudos's other hashtags when filtering by one hashtag", async () => {
    const { client } = createEmbedAwareFakeClient();

    const { data, error } = await fetchHighlightRows(client, { hashtagId: "h1", departmentId: null });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    const hashtagNames = (data ?? [])[0]?.kudos_hashtags.map((link) => link.hashtag?.name).sort();
    expect(hashtagNames).toEqual(["dedicated", "teamspirit"]);
  });
});
