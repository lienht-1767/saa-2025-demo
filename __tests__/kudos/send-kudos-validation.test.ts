import { describe, expect, it } from "vitest";

import { validateSendKudosInput } from "@/lib/kudos/actions/send-kudos-validation";

const SENDER = "30000000-0000-0000-0000-000000000001";
const RECIPIENT = "30000000-0000-0000-0000-000000000002";
const valid = { recipientId: RECIPIENT, message: "Cảm ơn bạn", hashtagIds: [], imageUrls: [] };

describe("validateSendKudosInput", () => {
  it("accepts a valid payload", () => expect(validateSendKudosInput(valid, SENDER)).toEqual({}));
  it("rejects an empty or overlong message", () => {
    expect(validateSendKudosInput({ ...valid, message: " " }, SENDER).message).toBe("required");
    expect(validateSendKudosInput({ ...valid, message: "x".repeat(2001) }, SENDER).message).toBe("tooLong");
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
});
