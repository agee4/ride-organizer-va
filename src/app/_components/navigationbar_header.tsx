import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-1 flex items-stretch justify-between gap-8 bg-neutral-100 pr-5 text-neutral-700 shadow-md dark:bg-neutral-900 dark:text-neutral-300">
      <Link
        className="logo m-3 flex h-8 items-center truncate text-2xl font-semibold"
        href="/"
      >
        Home
      </Link>
      <menu className="gap-4 items-center flex font-[family-name:var(--font-geist-mono)]">
        <Link href="/login">Login</Link>
        <Link href="/rides">Rides</Link>
        <Link href="/contact">Contact</Link>
      </menu>
    </header>
  )
}