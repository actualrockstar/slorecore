"use client";
import Link from "next/link";
import BandsInTownWidget from "../components/BandsInTownWidget";
import { useState } from "react"; 
import MailingList from "../components/MailingList";

export default function Shows() {
  const [mailingList, setMailingList] = useState(false);

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
      <button className='fixed bottom-10 bg-white text-black' onClick={() => {setMailingList(true)}}>become a slore</button> 
      {mailingList && (<MailingList onClose={() => setMailingList(false)}/>)} 
      </main>
    </div>
  );
}