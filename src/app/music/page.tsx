"use client";
import Link from "next/link";
import Image from "next/image"; 
import { useState } from "react";
import MailingList from "../components/MailingList";

export default function Music() {
  const [mailingList, setMailingList] = useState(false);

  return (
    <div className="items-left justify-items-left min-h-screen p-8 sm:p-20 ">
      <main className="flex flex-col row-start-2 items-left sm:items-start">
        <Link href="/" className="bg-white w-fit">Go Back</Link>
        <br></br>
        <h1 className="text-white bg-black w-fit text-2xl">Music:</h1>
        <br></br>
        <br></br>
        <Image src={'/slorecorecover.png'} width={600} height={300} alt='slorecore cover'></Image>
        <p className="text-black bg-white w-fit text-xl">2025 - Slorecore - EP: 
          <a href="https://unitedmasters.com/m/slorecore-1" className="text-red-500"> Listen</a> 
        </p>
        <br></br>
        <Image src={'/slore_buss_cover_tweak.png'} width={600} height={300} alt='buss cover'></Image>
        <p className="text-black bg-white w-fit text-xl">2025 - Buss - Single: 
          <a href="https://unitedmasters.com/m/buss-4" className="text-red-500"> Listen</a> </p>
      
      <button className='fixed bottom-10 bg-white text-black' onClick={() => {setMailingList(true)}}>become a slore</button> 
      {mailingList && (<MailingList onClose={() => setMailingList(false)}/>)} 
      </main>
    
    </div>
  );
}
