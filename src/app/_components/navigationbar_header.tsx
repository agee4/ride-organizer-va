"use client";

import Link from "next/link";
import { useRef } from "react";
import { useModal } from "./modal";

export default function NavBar() {
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const { Modal, setModal } = useModal(undefined, true);

  const ModalNav = () => (
    <menu
      className="flex flex-col gap-2 bg-white text-center text-2xl dark:bg-black"
      ref={mobileNavRef}
    >
      <Link href="/group-org">Organizer</Link>
      <Link href="/rides">Rides</Link>
      <li>
        <Link href="/contact">Contact</Link>
      </li>
    </menu>
  );

  return (
    <header className="sticky top-0 z-1 flex items-stretch justify-between gap-8 bg-neutral-100 pr-5 font-[family-name:var(--font-geist-mono)] text-neutral-700 shadow-md dark:bg-neutral-900 dark:text-neutral-300">
      {Modal}
      <Link
        className="logo m-3 flex h-8 items-center truncate text-2xl font-semibold"
        href="/"
      >
        Home
      </Link>
      <menu className="hidden items-center gap-4 sm:flex">
        {/* <Link href="/login">Login</Link> */}
        <Link href="/group-org">Organizer</Link>
        <Link href="/rides">Rides</Link>
        <Link href="/contact">Contact</Link>
      </menu>
      <button
        className="block text-2xl sm:hidden"
        onClick={() => setModal(<ModalNav />)}
      >
        ≡
      </button>
    </header>
  );
}
