import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-1 flex items-stretch justify-between gap-8 bg-neutral-100 pr-5 text-neutral-700 shadow-md dark:bg-neutral-900 dark:text-neutral-300">
      <Link href="/">Home</Link>
      <menu className="gap-4 flex">
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/rides">Rides</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </menu>
    </header>
  )
}