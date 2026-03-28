import Image from "next/image";
import Link from "next/link";

export function Brand({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <Image src="/convolens-mark.svg" alt="ConvoLens" width={compact ? 34 : 42} height={compact ? 34 : 42} />
      <div className="flex flex-col">
        <span className="font-display text-lg font-semibold leading-none tracking-tight">ConvoLens</span>
        {!compact ? <span className="text-xs uppercase tracking-[0.22em] text-accent">Conversation Intelligence</span> : null}
      </div>
    </Link>
  );
}
