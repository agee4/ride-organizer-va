import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[calc(100vh-132px)] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1
          className="font-bold text-5xl font-[family-name:var(--font-geist-mono)]"
        >
          Ride Organizer v2.A
        </h1>
      </main>
    </div>
  );
}
