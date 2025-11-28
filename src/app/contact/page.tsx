"use client";
import Link from "next/link";
import { useState } from "react";
import MailingList from "../components/MailingList";

export default function Contact() {
    const [mailingList, setMailingList] = useState(false);

  return (
    <div className="items-left justify-items-left min-h-screen p-8 sm:p-20 ">
      <main className="flex flex-col row-start-2 items-left sm:items-start">
        <Link href="/" className="bg-white text-black w-fit">Go Back</Link>
        <br></br>
        <div></div>
        <h1 className="text-white text-black bg-black text-2xl w-fit">Contact Us</h1>
        <br></br>
        <br></br>
        <p className="text-black bg-white text-xl w-fit">For Booking</p>
        <a className="text-black bg-white text-xl w-fit" href="mailto:booking@slorecore.com">booking@slorecore.com</a>
        <br></br>
        <p className="text-black bg-white text-xl w-fit">For General/Media/Press Inquiries</p>
        <a className="text-black bg-white text-xl w-fit" href="mailto:info@slorecore.com">info@slorecore.com</a>
      <button className='fixed bottom-10 bg-white' onClick={() => {setMailingList(true)}}>become a slore</button> 
            {mailingList && (<MailingList onClose={() => setMailingList(false)}/>)} 
      </main>
    </div>
  );
}