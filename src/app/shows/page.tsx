import Link from "next/link";
import BandsInTownWidget from "../components/BandsInTownWidget";

export default function Shows() {


  return (
    <div className="items-left justify-items-left min-h-screen p-8 sm:p-20 ">
      <main className="flex flex-col row-start-2 items-left sm:items-start">
        <Link href="/" className="bg-white w-fit">Go Back</Link>
        <br></br>
        <div></div>
        <h1 className="text-white bg-black w-fit text-2xl">Shows:</h1>
        <br></br>
        <br></br>
        <BandsInTownWidget />
        <br></br>

      </main>
    </div>
  );
}