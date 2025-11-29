"use client";
import Link from "next/link";
import { useState } from "react";
import MailingList from "../components/MailingList";

export default function Socials() {
  const [mailingList, setMailingList] = useState(false);

  return (
    <div className="items-left justify-items-left min-h-screen p-8 sm:p-20 ">
      <main className="flex flex-col row-start-2 items-left sm:items-start">
        <Link href="/" className="bg-white text-black w-fit">Go Back</Link>
        <br></br>
        <h1 className="text-white bg-black w-fit text-2xl">Socials:</h1>  
        <br></br> 
        <Link href="https://www.instagram.com/slorec0re/" className="text-black bg-white text-xl w-fit">Instagram</Link>
        <Link href="https://www.tiktok.com/@slorec0re" className="text-black bg-white text-xl w-fit">TikTok</Link>
        <Link href="https://www.facebook.com/profile.php?id=61577852783958" className="text-black bg-white text-xl w-fit">Facebook</Link>
        <Link href="https://www.youtube.com/@slorec0re" className="text-black bg-white text-xl w-fit">YouTube</Link>
        <Link href="https://mareko-theslores.bandcamp.com/community" className="text-black bg-white text-xl w-fit">Bandcamp</Link>
      <button className='fixed bottom-10 bg-white text-black' onClick={() => {setMailingList(true)}}>become a slore</button> 
            {mailingList && (<MailingList onClose={() => setMailingList(false)}/>)} 
      </main>
    </div>
  );
}
