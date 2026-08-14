import { useTranslations } from "next-intl";

/**
 * `mms_B2_Thông tin sự kiện` (2167:9053).
 *
 * Two label/value pairs sit on one row 60px apart (`Frame 522`, 2167:9054), with the broadcast
 * line 8px below. Labels are 16px/24px 700 white, letter-spacing 0.15px; values are 24px/32px
 * 700 #FFEA9E; the pair sits 4px apart and is centred against the taller value.
 *
 * Every string is a translation key — the Figma copy is the Vietnamese default in `messages/vi.json`.
 */
function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-base leading-6 font-bold tracking-[0.15px] text-white">{label}</span>
      <span className="text-2xl leading-8 font-bold text-brand-yellow">{value}</span>
    </div>
  );
}

export function EventInfo() {
  const t = useTranslations("home.event");

  return (
    /* mm:2167:9053 */
    <div className="flex flex-col items-start gap-2">
      {/* mm:2167:9054 */}
      <div className="flex flex-wrap items-center gap-x-15 gap-y-2">
        {/* mm:2167:9055 */}
        <InfoPair label={t("timeLabel")} value={t("timeValue")} />
        {/* mm:2167:9058 */}
        <InfoPair label={t("venueLabel")} value={t("venueValue")} />
      </div>

      {/* mm:2167:9061 */}
      <p className="text-base leading-6 font-bold tracking-[0.5px] text-white">{t("broadcast")}</p>
    </div>
  );
}
