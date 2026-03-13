"use client";
import Link from "next/link";
import { useState } from "react";
import MailingList from "../components/MailingList";
import TriggerWarningGame from "../components/TriggerWarningGame";

export default function TriggerWarning() {
  const [mailingList, setMailingList] = useState(false);

  return (
    <div className="items-left justify-items-left min-h-screen p-8 sm:p-20 ">
      <main className="flex flex-col row-start-2 items-left sm:items-start">
        <Link href="/" className="bg-white text-black w-fit">Click Here for Home Page</Link>
        <br></br>
        <br></br>
        <div className="">
          <TriggerWarningGame />
        </div>



        <button className='fixed bottom-10 bg-white text-black' onClick={() => { setMailingList(true) }}>become a slore</button>
        {mailingList && (<MailingList onClose={() => setMailingList(false)} />)}
      </main>
    </div>
  );
}
