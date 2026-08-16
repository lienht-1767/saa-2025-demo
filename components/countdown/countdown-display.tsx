import { useTranslations } from "next-intl";

export type PrelaunchCountdownDisplayProps = {
  days: number;
  hours: number;
  minutes: number;
};

function pad(value: number): string {
  // Frame 2268:35127 has exactly two boxes per unit. Values outside its 00–99 display domain are
  // clamped instead of silently growing a third tile and breaking the desktop/mobile geometry.
  const safe = Number.isFinite(value) && value > 0 ? Math.min(Math.floor(value), 99) : 0;
  return String(safe).padStart(2, "0");
}

function DigitBox({ digit }: { digit: string }) {
  return (
    <span className="relative inline-flex h-16 w-10 items-center justify-center min-[390px]:h-[77px] min-[390px]:w-12 md:h-24 md:w-[60px] lg:h-[123px] lg:w-[77px]">
      <span
        aria-hidden
        className="absolute inset-0 rounded-[8px] border-[0.75px] border-brand-yellow bg-linear-to-b from-white to-white/10 opacity-50 backdrop-blur-[25px] min-[390px]:rounded-[10px] lg:rounded-xl"
      />
      <span className="countdown-digit relative text-[38px] leading-none text-white min-[390px]:text-[46px] md:text-[58px] lg:text-[73.73px]">
        {digit}
      </span>
    </span>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-start gap-2 md:gap-3.5 lg:gap-[21px]">
      <div className="flex items-center gap-1.5 min-[390px]:gap-2 md:gap-3 lg:gap-[21px]" aria-hidden>
        {pad(value)
          .split("")
          .map((digit, index) => (
            <DigitBox key={`${index}-${digit}`} digit={digit} />
          ))}
      </div>
      <p className="text-sm leading-5 font-bold text-white min-[390px]:text-base min-[390px]:leading-6 md:text-2xl md:leading-8 lg:text-4xl lg:leading-12">
        {label}
      </p>
    </div>
  );
}

/**
 * Exact desktop geometry from MoMorph frame 2268:35127. The smaller breakpoints are a
 * responsive adaptation because the source file only defines the 1512px desktop frame.
 */
export function PrelaunchCountdownDisplay({
  days,
  hours,
  minutes,
}: PrelaunchCountdownDisplayProps) {
  const t = useTranslations("countdownPage");
  const summary = t("summary", { days: pad(days), hours: pad(hours), minutes: pad(minutes) });

  return (
    /* mm:2268:35136 */
    <section className="flex flex-col items-center gap-6" aria-labelledby="countdown-title">
      {/* mm:2268:35137 */}
      <h1
        id="countdown-title"
        className="text-center text-xl leading-7 font-bold text-white md:text-[28px] md:leading-9 lg:text-4xl lg:leading-12"
      >
        {t("title")}
      </h1>

      {/* mm:2268:35138 */}
      <div
        className="flex items-start gap-3 min-[390px]:gap-4 md:gap-8 lg:gap-[60px]"
        role="timer"
        aria-live="polite"
        aria-label={summary}
      >
        <CountdownUnit value={days} label={t("days")} />
        <CountdownUnit value={hours} label={t("hours")} />
        <CountdownUnit value={minutes} label={t("minutes")} />
      </div>
    </section>
  );
}
