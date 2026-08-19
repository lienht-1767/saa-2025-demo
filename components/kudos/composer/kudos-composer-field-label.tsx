/**
 * Shared label for a composer field: bold 22px ink text, an optional red required asterisk
 * (`I520:11647;520:9872;416:5547` measured `#CF1322` — `--kudos-required-mark`), and optional
 * grey hint lines rendered underneath (used by the title field's two example/usage lines).
 * Reused by every required-field label (`mms_B.1_Title`, `mms_E.1_Title`, `mms_F.1_Title`) so the
 * asterisk styling cannot drift between fields.
 */
export function KudosComposerFieldLabel({
  htmlFor,
  label,
  required,
  hints,
}: {
  htmlFor?: string;
  label: string;
  required?: boolean;
  hints?: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="flex items-center gap-0.5 text-[22px] leading-7 font-bold text-ink">
        {label}
        {required && (
          <span aria-hidden className="text-base text-kudos-required-mark">
            *
          </span>
        )}
      </label>
      {hints?.map((hint) => (
        <span key={hint} className="text-base leading-6 font-bold tracking-[0.15px] text-kudos-muted">
          {hint}
        </span>
      ))}
    </div>
  );
}
