import Image from "next/image";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50 font-sans dark:bg-slate-950">
      <Header />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-10 px-8 py-24 text-center sm:items-start sm:text-left">
        <Image
          src="/images/utilix-icon.png"
          alt="Utilix logo"
          width={88}
          height={88}
          priority
        />
        <div className="flex flex-col items-center gap-5 sm:items-start">
          <h1 className="text-5xl font-semibold tracking-normal text-slate-950 dark:text-slate-50">
            Utilix
          </h1>
          <p className="max-w-md text-lg leading-8 text-slate-600 dark:text-slate-300">
            A lightweight collection of useful online tools for everyday work.
          </p>
        </div>
      </main>
    </div>
  );
}
