import Link from "next/link";

export default function SiteRef() {
  return (
    <footer className="justify-between bg-neutral-100 py-2 text-sm text-neutral-700 shadow-md dark:bg-neutral-900 dark:text-neutral-300">
      <menu className="gap-4 items-center flex font-[family-name:var(--font-geist-mono)]">
        <Link href="/login">Home</Link>
        <Link href="/login">Login</Link>
        <Link href="/rides">Rides</Link>
        <Link href="/contact">Contact</Link>
      </menu>
      <p className="text-neutral-500">
        <b>This site was designed by Aaron Gee</b>
        <br />
        Copypaste 2025. idk what rights are reserved
      </p>
    </footer>
  );
}
