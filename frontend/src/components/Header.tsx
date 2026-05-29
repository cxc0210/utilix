import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="w-full border-b border-slate-200/80 bg-white/85 px-6 py-4 backdrop-blur sm:px-8 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/images/utilix-icon.png"
            alt="Utilix logo"
            width={36}
            height={36}
            priority
          />
          <span className="text-xl font-semibold tracking-normal text-slate-950 dark:text-slate-50">
            Utilix
          </span>
        </div>
        <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
          登录 / 注册
        </Link>
      </div>
    </header>
  );
}
