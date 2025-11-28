'use client'
import Link from "next/link";
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Gallery() {
  const imageCount = 10;
  const images = Array.from({ length: imageCount }, (_, i) => `/pics/IMG_${i}.JPG`);


  return (
    <div className="items-left justify-items-left min-h-screen p-8 sm:p-20 ">
      <main className="flex flex-col row-start-2 items-left sm:items-start">
        <Link href="/" className="bg-black w-fit">Go Back</Link>
        <br></br>
        <h1 className="text-white bg-black w-fit text-2xl">Gallery:</h1>
        <h1 className='bg-white text-black w-fit text-xl'>Here is some choice photos for your viewing. For video you should just go to <a href="https://www.youtube.com/@slorec0re">youtube</a> bro.</h1>
        <br></br>
        {images.map((src, index) => (
          <div key={index} className="mb-4">
            <Image src={src} alt={'photo'} width={600} height={400} className="object-cover"/>
          </div>
        ) )}
        <br></br>
        </main>
    </div>
  );
}
