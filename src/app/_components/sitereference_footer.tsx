import Link from "next/link";

export default function SiteRef() {
  return (
    <footer className="justify-between bg-neutral-100 py-2 text-sm text-neutral-700 shadow-md dark:bg-neutral-900 dark:text-neutral-300">
      <menu className="flex flex-col items-center justify-end gap-4 font-[family-name:var(--font-geist-mono)] sm:flex-row">
        <Link href="/login">Home</Link>
        {/* <Link href="/login">Login</Link> */}
        <Link href="/rides">Rides</Link>
        <Link href="/reference">References</Link>
        <Link href="/contact">Contact</Link>
      </menu>
      <p className="text-center text-neutral-500 sm:text-end">
        <b>This site was designed by Aaron Gee</b>
        <br />
        Copypaste 2025. idk what rights are reserved
      </p>
    </footer>
  );
}
