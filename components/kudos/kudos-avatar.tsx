import Image from "next/image";

/**
 * `B.3.1_Avatar người gửi` / `B.3.5_Avatar người nhận` (node `256:4734`): a 64x64 circle with a
 * 1.869px white border. Falls back to initials on a muted fill when `avatarUrl` is `null` — the
 * design always shows a Gmail avatar, but this board's mock data has none.
 */
export type KudosAvatarProps = {
  name: string;
  avatarUrl: string | null;
  size?: number;
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const last = parts.at(-1) ?? "";
  return last.slice(0, 1).toUpperCase() || "?";
}

export function KudosAvatar({ name, avatarUrl, size = 64 }: KudosAvatarProps) {
  const style = { width: size, height: size };

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full border-[1.87px] border-white object-cover"
        style={style}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full border-[1.87px] border-white bg-kudos-muted/40 text-lg font-bold text-ink"
    >
      {initialsOf(name)}
    </span>
  );
}
