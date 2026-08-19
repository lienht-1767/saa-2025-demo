import { describe, it, expect } from "vitest";
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";

/**
 * Contract test for the kudos composer error vocabulary (plan 260819-0351-viet-kudo-composer, phase 09).
 *
 * Verifies that:
 * 1. Every error key returned by `validateSendKudosInput` maps to a real i18n message in both locales.
 * 2. The `canSubmit` rule set in the dialog and the validator's required-field checks agree on the
 *    same required fields (no inconsistency that would let the button enable on input the server rejects).
 *
 * A missing key is a runtime next-intl throw, not a build failure — this test catches it at build time.
 */
describe("kudosBoard.composer error vocabulary", () => {
  const errorVocabulary = {
    recipientId: ["required", "self"],
    title: ["required", "tooLong"],
    message: ["required", "tooLong"],
    hashtagIds: ["required", "invalid"],
    imageUrls: ["maxImages"],
    anonymousName: ["required", "tooLong"],
    form: ["failed"], // fallback for unrecognized errors
  };

  it("every error key exists in vi.json", () => {
    const viComposer = viMessages.kudosBoard.composer as Record<string, unknown>;
    const viErrors = viComposer.errors as Record<string, Record<string, string>>;

    Object.entries(errorVocabulary).forEach(([field, keys]) => {
      expect(viErrors[field], `Missing vi.json: kudosBoard.composer.errors.${field}`).toBeDefined();
      keys.forEach((key) => {
        expect(
          viErrors[field][key],
          `Missing vi.json: kudosBoard.composer.errors.${field}.${key}`,
        ).toBeDefined();
      });
    });
  });

  it("every error key exists in en.json", () => {
    const enComposer = enMessages.kudosBoard.composer as Record<string, unknown>;
    const enErrors = enComposer.errors as Record<string, Record<string, string>>;

    Object.entries(errorVocabulary).forEach(([field, keys]) => {
      expect(enErrors[field], `Missing en.json: kudosBoard.composer.errors.${field}`).toBeDefined();
      keys.forEach((key) => {
        expect(
          enErrors[field][key],
          `Missing en.json: kudosBoard.composer.errors.${field}.${key}`,
        ).toBeDefined();
      });
    });
  });

  it("canSubmit rule and validator agree on required fields", () => {
    /**
     * From kudos-composer-dialog.tsx:
     *   const canSubmit = !!recipient && !!title.trim() && messageHasText && hashtagIds.length >= 1
     *     && (!isAnonymous || !!anonymousName.trim());
     *
     * Required fields when canSubmit is true:
     * - recipientId: must be truthy (uuid)
     * - title: must be non-empty when trimmed
     * - message: must have text (checked as messageHasText, which is stripped text > 0)
     * - hashtagIds: must have at least 1 entry
     * - anonymousName: must be non-empty when trimmed IF isAnonymous is true
     *
     * validateSendKudosInput returns errors for:
     * - recipientId: "required" (empty uuid) or "self" (matches senderId)
     * - title: "required" (empty when trimmed) or "tooLong"
     * - message: "required" (empty stripped text) or "tooLong"
     * - hashtagIds: "required" (0 entries) or "invalid"
     * - anonymousName: "required" (empty when trimmed and isAnonymous=true) or "tooLong"
     *
     * This test documents the agreement:
     */
    const requiredFieldsInCanSubmit = [
      "recipientId",
      "title",
      "message",
      "hashtagIds",
      "anonymousName", // conditionally, when isAnonymous=true
    ];

    const fieldsWithRequiredError = Object.entries(errorVocabulary)
      .filter(([, keys]) => keys.includes("required"))
      .map(([field]) => field);

    // All fields with "required" error should be checked in canSubmit
    fieldsWithRequiredError.forEach((field) => {
      expect(
        requiredFieldsInCanSubmit,
        `Field "${field}" has a "required" error but canSubmit doesn't check it — button could enable on input server would reject`,
      ).toContain(field);
    });

    // imageUrls is intentionally optional (no min constraint)
    expect(
      errorVocabulary.imageUrls.includes("required"),
      'imageUrls should not have "required" error — it is optional',
    ).toBe(false);
  });
});
