"use client";
import Link from "next/link";
import { useState } from "react";
import MailingList from "./components/MailingList";

export default function Home() {
  const [mailingList, setMailingList] = useState(false);

  return (
    <div className="items-left justify-items-left min-h-screen p-8 sm:p-20 ">
      <main className="flex flex-col row-start-2 items-left sm:items-start">
        <h1 className="text-5xl text-white bg-black w-fit ">The Slores</h1>
        <Link className='bg-white text-black w-fit text-xl' href='/music'>Music</Link>
        <Link className='bg-white text-black w-fit text-xl' href='/gallery'>Gallery</Link>
        <Link className='bg-white text-black w-fit text-xl' href='/shows'>Shows</Link>
        <Link className='bg-white text-black w-fit text-xl' href='https://mareko-theslores.bandcamp.com/'>Store</Link>
        <Link className='bg-white text-black w-fit text-xl' href='/socials'>Socials</Link>
        <Link className='bg-white text-black w-fit text-xl' href='/contact'>Contact</Link>
        
      <button className='fixed bottom-10 bg-white' onClick={() => {setMailingList(true)}}>become a slore</button> 
      {mailingList && (<MailingList onClose={() => setMailingList(false)}/>)} 
      </main>
    </div>
  );
}
