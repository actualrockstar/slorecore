import Image from "next/image";

export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 ">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/slorecorecutelogo.png"
          alt="Slores Logo"
          width={500}
          height={38}
          priority
        />
      </main>
      <footer className="flex-col gap-6 flex-wrap items-center justify-center text-center">
        <h1 className="text-xl"> Mareko and the Slores EP drops this spring! </h1>
        <p><a href="mailto:booking@slorecore.com">Booking: booking@slorecore.com</a></p>
      </footer>
    </div>
  );
}
