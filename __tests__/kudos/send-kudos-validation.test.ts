import { describe, expect, it } from "vitest";

import { validateSendKudosInput } from "@/lib/kudos/actions/send-kudos-validation";

const SENDER = "30000000-0000-0000-0000-000000000001";
const RECIPIENT = "30000000-0000-0000-0000-000000000002";
const HASHTAG = "30000000-0000-0000-0000-000000000003";
const valid = {
  recipientId: RECIPIENT,
  title: "Người truyền động lực",
  message: "Cảm ơn bạn",
  hashtagIds: [HASHTAG],
  imageUrls: [],
  isAnonymous: false,
  anonymousName: null,
};

describe("validateSendKudosInput", () => {
  it("accepts a valid payload", () => expect(validateSendKudosInput(valid, SENDER)).toEqual({}));
  it("rejects an empty or overlong message (measured on the stripped text)", () => {
    expect(validateSendKudosInput({ ...valid, message: " " }, SENDER).message).toBe("required");
    expect(validateSendKudosInput({ ...valid, message: "x".repeat(2001) }, SENDER).message).toBe("tooLong");
  });
  it("rejects a message that is only empty-bodied markup, as required", () => {
    expect(validateSendKudosInput({ ...valid, message: "<p><br></p>" }, SENDER).message).toBe("required");
  });
  it("rejects raw HTML longer than 20000 chars even if the stripped text is short", () => {
    const bloated = `<p>${"a".repeat(20001)}</p>`;
    expect(validateSendKudosInput({ ...valid, message: bloated }, SENDER).message).toBe("tooLong");
  });
  it("rejects self-send and malformed ids", () => {
    expect(validateSendKudosInput({ ...valid, recipientId: SENDER }, SENDER).recipientId).toBe("self");
    expect(validateSendKudosInput({ ...valid, recipientId: "nope" }, SENDER).recipientId).toBe("required");
  });
  it("rejects more than five hashtags or images and non-allow-listed images", () => {
    expect(validateSendKudosInput({ ...valid, hashtagIds: Array(6).fill(RECIPIENT) }, SENDER).hashtagIds).toBe("invalid");
    expect(validateSendKudosInput({ ...valid, imageUrls: Array(6).fill("/images/home/award-mvp.png") }, SENDER).imageUrls).toBe("maxImages");
    expect(validateSendKudosInput({ ...valid, imageUrls: ["https://example.com/x.png"] }, SENDER).imageUrls).toBe("maxImages");
  });
  it("requires at least one hashtag", () => {
    expect(validateSendKudosInput({ ...valid, hashtagIds: [] }, SENDER).hashtagIds).toBe("required");
  });
  it("rejects an empty or overlong title", () => {
    expect(validateSendKudosInput({ ...valid, title: "  " }, SENDER).title).toBe("required");
    expect(validateSendKudosInput({ ...valid, title: "x".repeat(120) }, SENDER).title).toBeUndefined();
    expect(validateSendKudosInput({ ...valid, title: "x".repeat(121) }, SENDER).title).toBe("tooLong");
  });
  it("requires a non-blank anonymousName when isAnonymous is true", () => {
    expect(
      validateSendKudosInput({ ...valid, isAnonymous: true, anonymousName: "  " }, SENDER).anonymousName,
    ).toBe("required");
    expect(
      validateSendKudosInput({ ...valid, isAnonymous: true, anonymousName: null }, SENDER).anonymousName,
    ).toBe("required");
    expect(
      validateSendKudosInput({ ...valid, isAnonymous: true, anonymousName: "x".repeat(61) }, SENDER).anonymousName,
    ).toBe("tooLong");
    expect(
      validateSendKudosInput({ ...valid, isAnonymous: true, anonymousName: "Ẩn danh" }, SENDER).anonymousName,
    ).toBeUndefined();
  });
  it("ignores anonymousName when isAnonymous is false", () => {
    expect(validateSendKudosInput({ ...valid, isAnonymous: false, anonymousName: "x" }, SENDER).anonymousName).toBeUndefined();
  });
});
