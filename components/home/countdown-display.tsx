import { useTranslations } from "next-intl";

/**
 * `mms_B1.3_Countdown` (2167:9037) — three blocks 40px apart, each a column of two digit tiles
 * (14px apart) above its label.
 *
 * Digit tile — `Group 5` (I2167:9040;186:2616): 51.2x81.92, 8px radius, 0.5px #FFEA9E border,
 * a white-to-10%-white vertical gradient at 50% opacity, backdrop blur 16.64px. The digit
 * (I2167:9040;186:2617) is 49.152px "Digital Numbers", white, and sits at full opacity above it.
 *
 * Display only: the caller owns the clock. `days`/`hours`/`minutes` are already-computed whole
 * numbers, clamped and zero-padded to two characters here so a missing or malformed
 * `NEXT_PUBLIC_EVENT_START_AT` renders 00/00/00 rather than crashing (TC ID-56/57/60).
 */
export type CountdownDisplayProps = {
  days: number;
  hours: number;
  minutes: number;
  /** Renders the "Comming soon" line above the digits — hidden when the target is unusable. */
  showComingSoon?: boolean;
};

/**
 * At least two characters: 7 → "07". A value above 99 keeps every digit and grows a third tile
 * rather than being truncated into a wrong number. Negative, NaN and undefined all fall to "00".
 */
function pad(value: number): string {
  const safe = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  return String(safe).padStart(2, "0");
}

function DigitTile({ digit }: { digit: string }) {
  return (
    /* mm:2167:9040 — 51.2x81.92 in the design; scaled down below `sm` so all three blocks
       still sit on one row at 375px. */
    <span className="relative inline-flex h-[62px] w-[38px] items-center justify-center sm:h-[82px] sm:w-[51px]">
      <span
        aria-hidden
        className="absolute inset-0 rounded-lg border-[0.5px] border-brand-yellow bg-linear-to-b from-white to-white/10 opacity-50 backdrop-blur-[16.64px]"
      />
      <span className="countdown-digit relative text-[37px] leading-none text-white sm:text-[49.152px]">
        {digit}
      </span>
    </span>
  );
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  const digits = pad(value).split("");

  return (
    /* mm:2167:9038 */
    <div className="flex flex-col justify-center gap-2 sm:gap-3.5">
      {/* mm:2167:9039 */}
      <div className="flex items-center gap-2 sm:gap-3.5" aria-hidden>
        {digits.map((digit, index) => (
          <DigitTile key={`${index}-${digit}`} digit={digit} />
        ))}
      </div>
      <p className="text-lg leading-6 font-bold text-white sm:text-2xl sm:leading-8">{label}</p>
    </div>
  );
}

export function CountdownDisplay({
  days,
  hours,
  minutes,
  showComingSoon = true,
}: CountdownDisplayProps) {
  const t = useTranslations("home.countdown");
  const summary = t("summary", { days: pad(days), hours: pad(hours), minutes: pad(minutes) });

  return (
    /* mm:2167:9035 */
    <div className="flex flex-col items-start gap-4">
      {showComingSoon && (
        /* mm:2167:9036 */
        <p className="text-2xl leading-8 font-bold text-white">{t("comingSoon")}</p>
      )}

      {/* mm:2167:9037 */}
      <div className="flex items-center gap-4 sm:gap-10" role="timer" aria-label={summary}>
        <CountdownBlock value={days} label={t("days")} />
        <CountdownBlock value={hours} label={t("hours")} />
        <CountdownBlock value={minutes} label={t("minutes")} />
      </div>
    </div>
  );
}
