"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { VT323, Special_Elite } from "next/font/google";

// Load Google Fonts for the secret surveillance/punk aesthetic
const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function AnomalyPage() {
  const [step, setStep] = useState<number>(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeString, setTimeString] = useState("00:00:00");
  const [dateString, setDateString] = useState("JUL 11, 2026");

  // =========================================================================
  // CUSTOMIZATION CONSTANTS
  // Edit these variables to connect to your live accounts and endpoints.
  // =========================================================================
  const INSTAGRAM_HANDLE = "@slorec0re"; // Instagram handle to tag
  const INSTAGRAM_URL = "https://instagram.com/slorec0re"; // Link to Instagram
  const HOME_URL = "/"; // Homepage URL to redirect back to
  // =========================================================================

  // Hydrate step state from sessionStorage to prevent restart on refresh
  useEffect(() => {
    const savedStep = sessionStorage.getItem("anomaly_step");
    if (savedStep) {
      const parsed = parseInt(savedStep, 10);
      if (parsed >= 1 && parsed <= 4) {
        setStep(parsed);
      }
    }
    setIsHydrated(true);
  }, []);

  // Update real-time running VHS-style clock
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const month = months[now.getMonth()];
      const day = String(now.getDate()).padStart(2, "0");
      const year = now.getFullYear();
      setDateString(`${month} ${day}, ${year}`);

      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTimeString(`${hours}:${minutes}:${seconds}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSetStep = (newStep: number) => {
    setStep(newStep);
    sessionStorage.setItem("anomaly_step", newStep.toString());
  };

  const handleReset = () => {
    setEmail("");
    setError("");
    handleSetStep(1);
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("INVALID TRANSMISSION PROTOCOL: VERIFY EMAIL STRUCTURE.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://slorecore.app.n8n.cloud/webhook/e0e4c850-4f85-4792-9f91-53abc7721e32",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (!response.ok) throw new Error("Mailing list API error");

      setLoading(false);
      handleSetStep(4);
    } catch (err) {
      setLoading(false);
      setError("TRANSMISSION FAULT. OUT-OF-RANGE OR CONNECTION INTERRUPTED.");
    }
  };

  // Prevent flash of step 1 if the user was on step 2/3/4 before hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className={`${vt323.className} text-red-600 text-2xl tracking-widest animate-pulse`}>
          TUNING SIGNAL...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative bg-[#030303] flex flex-col justify-between p-6 ${vt323.className} tracking-wide text-gray-300 antialiased crt-screen overflow-hidden`}>
      {/* Dynamic CSS injecting CRT curvature, Scanlines, VHS noise, and animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Scanlines Overlay */
        .scanlines {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.3) 50%
          ), linear-gradient(
            90deg,
            rgba(255, 0, 0, 0.04),
            rgba(0, 255, 0, 0.01),
            rgba(0, 0, 255, 0.04)
          );
          background-size: 100% 3px, 4px 100%;
          z-index: 999;
          pointer-events: none;
        }

        /* Ambient Screen Vignette */
        .crt-screen::after {
          content: " ";
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: radial-gradient(circle, rgba(18, 16, 16, 0) 55%, rgba(0, 0, 0, 0.85) 150%);
          z-index: 1000;
          pointer-events: none;
        }

        /* VHS Tracking Line */
        .tracking-bar {
          position: fixed;
          left: 0;
          width: 100%;
          height: 140px;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.02) 40%,
            rgba(255, 255, 255, 0.03) 50%,
            rgba(255, 255, 255, 0.02) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          z-index: 997;
          pointer-events: none;
        }

        /* Film Grain Shader */
        .noise {
          position: fixed;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          width: 200%;
          height: 200%;
          background: transparent url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" opacity="0.07"/%3E%3C/svg%3E') repeat;
          z-index: 998;
          pointer-events: none;
        }

        /* Animations (Respected by accessibility check below) */
        @keyframes tracking {
          0% { top: -150px; }
          100% { top: 100%; }
        }
        @keyframes grain {
          0%, 100% { transform:translate(0, 0); }
          10% { transform:translate(-1%, -1%); }
          20% { transform:translate(-2%, 1%); }
          30% { transform:translate(1%, -2%); }
          40% { transform:translate(-1%, 3%); }
          50% { transform:translate(-2%, 1%); }
          60% { transform:translate(1%, 3%); }
          70% { transform:translate(3%, -2%); }
          80% { transform:translate(-1%, 1%); }
          90% { transform:translate(2%, -1%); }
        }

        /* Smooth page fade transition */
        .fade-in {
          animation: page-fade 0.5s ease-out forwards;
        }
        @keyframes page-fade {
          from {
            opacity: 0;
            transform: scale(0.99) translateY(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Run motion effects only if users haven't requested reduced motion */
        @media (prefers-reduced-motion: no-preference) {
          .tracking-bar {
            animation: tracking 10s linear infinite;
          }
          .noise {
            animation: grain 0.8s steps(10) infinite;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tracking-bar {
            display: none;
          }
          .noise {
            opacity: 0.04;
          }
        }
      `}} />

      {/* Screen Effects */}
      <div className="scanlines" />
      <div className="tracking-bar" />
      <div className="noise" />

      {/* VHS Diagnostics Header */}
      <header className="w-full flex justify-between items-start text-xs sm:text-sm text-red-500/80 uppercase tracking-widest border-b border-red-950/40 pb-2 z-10 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse inline-block shadow-[0_0_6px_#ef4444]" />
          <span>REC</span>
        </div>
        <div>PLAY</div>
        <div>SLR-004</div>
      </header>

      {/* Main wizard sections */}
      <main className="flex-1 flex flex-col justify-center items-center py-8 z-10">
        
        {/* SCREEN 1: SIGNAL DETECTED */}
        {step === 1 && (
          <section className="fade-in text-center max-w-md w-full px-4 flex flex-col items-center">
            <h1 className={`${specialElite.className} text-3xl sm:text-4xl text-gray-100 uppercase mb-3 tracking-wider`}>
              Signal Detected
            </h1>
            <p className="text-red-500 font-mono text-lg sm:text-xl mb-1 tracking-widest">
              ANOMALY CONFIRMED
            </p>
            <p className="text-gray-400 font-mono text-sm sm:text-base mb-8 uppercase tracking-widest">
              You found it.
            </p>

            <button
              onClick={() => handleSetStep(2)}
              className="px-10 py-4 bg-red-700 hover:bg-red-600 text-white font-bold text-lg uppercase border border-red-500 shadow-[0_0_15px_rgba(185,28,28,0.4)] transition-all duration-100 hover:scale-105 active:scale-95 cursor-pointer max-w-xs w-full"
            >
              Enter
            </button>
          </section>
        )}

        {/* SCREEN 2: THE MISSION */}
        {step === 2 && (
          <section className="fade-in text-center max-w-md w-full px-4 flex flex-col items-center">
            <h2 className={`${specialElite.className} text-xl sm:text-2xl text-gray-100 uppercase mb-4 tracking-wide`}>
              This camera belongs to everyone tonight.
            </h2>
            <p className="text-red-500/90 text-sm sm:text-base uppercase tracking-widest mb-6">
              You have one mission:
            </p>

            {/* DIY CSS Disposable Camera Graphic */}
            <div className="relative w-64 h-36 bg-[#181818] border-4 border-gray-800 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between p-2 mx-auto my-6 select-none border-t-red-800">
              {/* Cardboard film wrapping decals */}
              <div className="absolute inset-x-0 top-0 h-4 bg-red-950/80 border-b-2 border-black flex items-center justify-between px-2 text-[8px] text-red-400 font-mono uppercase">
                <span>The Slores // Anomaly</span>
                <span>EXP: 01/01</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-4 bg-red-900 border-t-2 border-black flex items-center justify-center text-[7px] text-gray-100 font-bold uppercase tracking-widest">
                Classified Raw Archive
              </div>
              
              {/* Viewfinder block */}
              <div className="absolute top-6 left-3 w-6 h-4 bg-black border border-gray-700 flex items-center justify-center">
                <div className="w-2.5 h-1.5 bg-[#0f240f] opacity-80" />
              </div>

              {/* Flash window */}
              <div className="absolute top-6 right-3 w-10 h-8 bg-zinc-900 border border-gray-700 rounded-sm flex items-center justify-center">
                <div className="w-6 h-5 bg-yellow-950/40 border border-yellow-800/40 rounded-sm shadow-inner" />
              </div>
              
              {/* Flash ready indicator bulb */}
              <div className="absolute top-9 right-16 w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              <div className="absolute top-9 right-16 w-1.5 h-1.5 rounded-full bg-red-500" />

              {/* Viewfinder circle/dial */}
              <div className="absolute top-1 left-28 w-4 h-1.5 bg-zinc-800 border-x border-black" />

              {/* Camera Lens */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-zinc-900 to-zinc-950 border-4 border-zinc-800 shadow-inner flex items-center justify-center mx-auto mt-4 z-10">
                <div className="w-12 h-12 rounded-full bg-black border-2 border-zinc-900 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-[#040810] border border-[#0d2a4a] relative">
                    <div className="absolute top-0.5 left-1 w-1.5 h-1.5 rounded-full bg-blue-500 opacity-60" />
                  </div>
                </div>
              </div>
              
              {/* Label */}
              <div className="absolute bottom-5 left-3 bg-[#e2e2e2] text-black font-sans font-bold text-[8px] px-1 transform -rotate-3 border border-black uppercase">
                THE ANOMALY
              </div>
            </div>

            {/* Mission constraints - Punk zine style list */}
            <div className="bg-zinc-950/70 border border-red-950/80 p-4 rounded-sm mb-8 text-left w-full space-y-3 font-mono text-sm sm:text-base text-gray-300">
              <div className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">&#62;</span>
                <p>Take exactly <strong className="text-white">one photo</strong> using the disposable camera.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">&#62;</span>
                <p>You only get <strong className="text-white">one frame</strong>. Make it count.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">&#62;</span>
                <p>Leave something worth remembering for the next person.</p>
              </div>
            </div>

            <button
              onClick={() => handleSetStep(3)}
              className="px-6 py-4 bg-zinc-900 hover:bg-red-950 text-red-500 hover:text-white border border-red-900 font-bold text-base uppercase transition-all duration-100 hover:scale-105 active:scale-95 cursor-pointer max-w-xs w-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            >
              I Took My Shot
            </button>
          </section>
        )}

        {/* SCREEN 3: CONFIRMATION */}
        {step === 3 && (
          <section className="fade-in text-center max-w-md w-full px-4 flex flex-col items-center">
            <h2 className={`${specialElite.className} text-xl sm:text-2xl text-gray-100 uppercase mb-3 tracking-wide`}>
              Transmission Received
            </h2>
            <p className="text-red-500 text-sm sm:text-base uppercase tracking-widest mb-6">
              Your frame is now part of tonight.
            </p>

            {/* Terminal logs block */}
            <div className="w-full bg-zinc-950/80 border border-zinc-900 p-3 rounded-sm text-left mb-6 font-mono text-xs uppercase space-y-1 text-gray-400 select-none">
              <div className="flex justify-between border-b border-zinc-900 pb-1.5 mb-1.5 text-[10px] text-zinc-500">
                <span>SYSTEM DIAGNOSTIC</span>
                <span>STATUS: STABLE</span>
              </div>
              <div className="flex justify-between">
                <span>FRAME LOGGED:</span>
                <span className="text-green-500">CONFIRMED</span>
              </div>
              <div className="flex justify-between">
                <span>ARCHIVE ACTIVE:</span>
                <span className="text-green-500">TRUE</span>
              </div>
              <div className="flex justify-between">
                <span>ROLL IN PROGRESS:</span>
                <span className="text-red-500 animate-pulse">RECORDING...</span>
              </div>
            </div>

            <div className="mb-6 w-full">
              <h3 className={`${specialElite.className} text-lg text-gray-200 mb-2 uppercase`}>
                Want to see the roll?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Leave your email and we’ll send you the developed photos once the roll is complete.
              </p>
            </div>

            {/* Email submission form */}
            <form onSubmit={handleSubmitEmail} className="w-full flex flex-col items-center gap-4">
              <div className="w-full relative">
                <label htmlFor="anomaly-email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="anomaly-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                  placeholder="ENTER EMAIL ADDRESS"
                  className="w-full bg-black border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 text-white placeholder-zinc-700 px-4 py-3.5 text-center text-sm font-mono tracking-widest rounded-none outline-none transition-all duration-100 disabled:opacity-50"
                  required
                />
              </div>

              {error && (
                <div className="w-full bg-red-950/40 border border-red-900 text-red-500 text-xs py-2.5 px-3 uppercase tracking-wider text-center animate-pulse">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-4 bg-red-700 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-base uppercase border border-red-500 shadow-[0_0_15px_rgba(185,28,28,0.3)] transition-all duration-100 hover:scale-105 active:scale-95 cursor-pointer w-full flex items-center justify-center gap-2"
              >
                {loading ? "TRANSMITTING..." : "Join The Archive"}
              </button>
            </form>

            <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-relaxed mt-4 w-full text-center">
              By joining, you consent to receive the developed photo gallery and occasional classified transmissions from The Slores. We do not spam.
            </p>
          </section>
        )}

        {/* SCREEN 4: FINAL SUCCESS STATE */}
        {step === 4 && (
          <section className="fade-in text-center max-w-md w-full px-4 flex flex-col items-center">
            <h2 className={`${specialElite.className} text-2xl sm:text-3xl text-green-500 uppercase mb-3 tracking-wide`}>
              You’re in the archive.
            </h2>
            <p className="text-gray-300 text-sm sm:text-base uppercase tracking-widest mb-8 leading-relaxed">
              We’ll contact you when the film is developed.
            </p>

            <div className="bg-zinc-950/70 border border-zinc-900 p-5 rounded-sm mb-8 w-full font-mono text-sm leading-relaxed text-gray-400">
              <p className="mb-3">
                UNTIL THEN, DOCUMENT YOUR FAVORITE MOMENT FROM TONIGHT.
              </p>
              <p>
                TAG{" "}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-400 underline font-bold tracking-widest"
                >
                  {INSTAGRAM_HANDLE}
                </a>{" "}
                SO WE CAN SEE IT.
              </p>
            </div>

            <Link
              href={HOME_URL}
              onClick={() => {
                // Optional: clear state on return so they can trigger again next time
                sessionStorage.removeItem("anomaly_step");
              }}
              className="px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white border border-zinc-800 font-bold text-base uppercase tracking-wider transition-all duration-100 hover:scale-105 active:scale-95 cursor-pointer max-w-xs w-full shadow-[0_0_10px_rgba(0,0,0,0.5)] block text-center"
            >
              Return to The Slores
            </Link>
          </section>
        )}

      </main>

      {/* Diagnostics Footer / Real-time clock overlay */}
      <footer className="w-full flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-600 font-mono border-t border-zinc-950/50 pt-3 mt-4 z-10 select-none gap-2">
        <div className="flex gap-4">
          <span>{dateString}</span>
          <span className="font-mono text-zinc-500">{timeString}</span>
        </div>
        
        {/* Unobtrusive reset trigger for testing */}
        <button
          onClick={handleReset}
          className="text-[9px] text-zinc-700 hover:text-red-500 uppercase tracking-widest cursor-pointer transition-colors duration-150 p-1"
          title="Reset signal sequence state"
        >
          [ RE-SYNC ANOMALY ]
        </button>

        <div className="text-[10px] tracking-widest text-zinc-700 uppercase">
          SECURE CONNECTION // SLR-CORE
        </div>
      </footer>
    </div>
  );
}
