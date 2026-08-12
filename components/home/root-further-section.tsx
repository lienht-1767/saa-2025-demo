import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * `Frame 486` (3204:10152) with `mms_B4_content` (5001:14827).
 *
 * A 1152px column centred inside the 1224px page gutter, its children 32px apart:
 *   Group 434  the decorative ROOT / FURTHER wordmarks, 189x67 above 290x67, both centred
 *   content    two justified 24px/32px Montserrat 700 body blocks
 *   quote      20px/32px, centred, between them
 *
 * The body copy is long and paragraph-separated by newlines in Figma; it is stored in the
 * message catalogue as an array so each paragraph gets its own `<p>`.
 */
export function RootFurtherSection() {
  const t = useTranslations("home.rootFurther");
  // Figma keeps each block in one TEXT node with newline-separated paragraphs; the message
  // catalogue mirrors that shape, so the split happens here rather than in the JSON.
  const intro = t("intro").split("\n");
  const outro = t("outro").split("\n");
  const quote = t("quote").split("\n");

  return (
    /* mm:3204:10152 */
    <section
      id="root-further"
      aria-labelledby="root-further-heading"
      className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-8"
    >
      <h2 id="root-further-heading" className="sr-only">
        {t("heading")}
      </h2>

      {/* mm:3204:10153 */}
      <div aria-hidden className="flex w-full max-w-[290px] flex-col items-center">
        {/* mm:3204:10155 */}
        <Image
          src="/images/home/root-text.png"
          alt=""
          width={189}
          height={67}
          className="h-auto w-[65%]"
        />
        {/* mm:3204:10154 */}
        <Image
          src="/images/home/further-text.png"
          alt=""
          width={290}
          height={67}
          className="h-auto w-full"
        />
      </div>

      {/* mm:3204:10156 */}
      <div className="flex flex-col text-justify text-base leading-6 font-bold text-white sm:text-xl sm:leading-8 lg:text-2xl">
        {intro.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      {/* mm:3204:10161 */}
      <blockquote className="flex flex-col text-center text-lg leading-8 font-bold text-white lg:text-xl">
        {quote.map((line) => (
          <p key={line.slice(0, 32)}>{line}</p>
        ))}
      </blockquote>

      {/* mm:3204:10162 */}
      <div className="flex flex-col text-justify text-base leading-6 font-bold text-white sm:text-xl sm:leading-8 lg:text-2xl">
        {outro.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
