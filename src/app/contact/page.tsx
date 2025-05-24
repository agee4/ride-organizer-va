import Link from "next/link";

export default function Page() {
  return (
    <div className="grid min-h-[calc(100vh-132px)] grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1>contact</h1>
        <Link href="mailto:aarongee0925@gmail.com">aarongee0925@gmail.com</Link>
      </main>
    </div>
  );
}
