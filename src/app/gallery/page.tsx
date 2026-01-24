'use client'
import Link from "next/link";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import MailingList from "../components/MailingList";

import { put, list } from "@vercel/blob";

//const { url } = await put('articles/blob.txt', 'Hello World!', { access: 'public' });
const response = await list();

export default function Gallery() {
  
  const imageCount = 10;
  const images = Array.from({ length: imageCount }, (_, i) => `/pics/IMG_${i}.JPG`);
  const [mailingList, setMailingList] = useState(false);

  return (
    <div className="items-left justify-items-left min-h-screen p-8 sm:p-20 ">
      <main className="flex flex-col row-start-2 items-left sm:items-start">
        <Link href="/" className="bg-black text-white w-fit">Go Back</Link>
        <br></br>
        <h1 className="text-white bg-black w-fit text-2xl">Gallery:</h1>
        <h1 className='bg-white text-black w-fit text-xl'>Here is some choice photos for your viewing. For video you should just go to <a href="https://www.youtube.com/@slorec0re">youtube</a> bro.</h1>
        <br></br>
        {images.map((src, index) => (
          <div key={index} className="mb-4">
            {response.blobs.map((blob) => (
            <Image key={blob.pathname} src={blob.downloadUrl} alt={blob.pathname} width={600} height={400} className="object-cover"/>
          ))}
          </div>
        ) )}
        <br></br>
        <button className='fixed bottom-10 bg-white text-black' onClick={() => {setMailingList(true)}}>become a slore</button> 
            {mailingList && (<MailingList onClose={() => setMailingList(false)}/>)} 
        </main>
    </div>
  );
}
