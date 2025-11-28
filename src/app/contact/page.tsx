import Link from "next/link";

export default function Contact() {


  return (
    <div className="items-left justify-items-left min-h-screen p-8 sm:p-20 ">
      <main className="flex flex-col row-start-2 items-left sm:items-start">
        <Link href="/" className="bg-white w-fit">Go Back</Link>
        <br></br>
        <div></div>
        <h1 className="text-white bg-black text-2xl w-fit">Contact Us</h1>
        <br></br>
        <br></br>
        <p className="text-black bg-white text-xl w-fit">For Booking</p>
        <a className="text-black bg-white text-xl w-fit" href="mailto:booking@slorecore.com">booking@slorecore.com</a>
        <br></br>
        <p className="text-black bg-white text-xl w-fit">For General/Media/Press Inquiries</p>
        <a className="text-black bg-white text-xl w-fit" href="mailto:info@slorecore.com">info@slorecore.com</a>
      </main>
    </div>
  );
}