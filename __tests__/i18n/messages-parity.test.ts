import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

type Tree = { [key: string]: string | Tree };

/** Flattens a message tree to dotted key paths so the two files can be compared directly. */
function keyPaths(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [path] : keyPaths(value, path);
  });
}

describe("message files", () => {
  it("has one file per supported locale", () => {
    expect(SUPPORTED_LOCALES).toEqual(["vi", "en"]);
  });

  it("keeps identical key trees across locales", () => {
    expect(keyPaths(en as Tree).sort()).toEqual(keyPaths(vi as Tree).sort());
  });

  it("has no empty strings", () => {
    for (const messages of [vi, en]) {
      const flat = JSON.stringify(messages);
      expect(flat).not.toContain('""');
    }
  });

  it("carries the exact Vietnamese copy from the Figma design", () => {
    expect(vi.login.intro).toBe("Bắt đầu hành trình của bạn cùng SAA 2025.");
    expect(vi.login.tagline).toBe("Đăng nhập để khám phá!");
    expect(vi.login.googleButton).toBe("LOGIN With Google");
    expect(vi.common.copyright).toBe("Bản quyền thuộc về Sun* © 2025");
    expect(vi.login.error).toBe("Đăng nhập không thành công. Vui lòng thử lại.");
  });

  it("does not fall back to English for translatable Kudos board copy", () => {
    expect(vi.kudosBoard.highlight.title).toBe("KUDOS NỔI BẬT");
    expect(vi.kudosBoard.spotlight.title).toBe("BẢNG VINH DANH");
    expect(vi.kudosBoard.feed.title).toBe("TẤT CẢ KUDOS");
    expect(vi.kudosBoard.actions.copyLink).toBe("Sao chép liên kết");
    expect(vi.kudosBoard.actions.copyLinkToast).toBe("Đã sao chép liên kết!");
    expect(vi.kudosBoard.composer.imageLabel).toBe("Hình ảnh");

    expect(vi.kudosBoard.highlight.title).not.toBe(en.kudosBoard.highlight.title);
    expect(vi.kudosBoard.spotlight.title).not.toBe(en.kudosBoard.spotlight.title);
    expect(vi.kudosBoard.feed.title).not.toBe(en.kudosBoard.feed.title);
  });
});
