import Link from "next/link";

export default function Page() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1>References</h1>
        <Link
          className="text-indigo-500 hover:text-amber-500"
          href="https://nextjs.org/docs"
        >
          NextJS Documentation
        </Link>
        <Link
          className="text-indigo-500 hover:text-amber-500"
          href="https://tailwindcss.com/docs"
        >
          TailwindCSS Documentation
        </Link>
        <Link
          className="text-indigo-500 hover:text-amber-500"
          href="https://docs.sheetjs.com/docs/demos/frontend/react/"
        >
          SheetJS Documentation
        </Link>
        <ul>
          <li>
            <Link
              className="text-indigo-500 hover:text-amber-500"
              href="https://codesandbox.io/p/sandbox/react-dnd-multi-select-list-8oqrl"
            >
              znwang25&apos;s Multi Select Example
            </Link>
          </li>
          <li>(inspiration and basis for multi select system)</li>
        </ul>
      </main>
    </div>
  );
}
