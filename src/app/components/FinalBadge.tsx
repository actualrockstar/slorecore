'use client'

import Link from 'next/link'
import { clearBadgeSession, type BadgeSession } from '../lib/badgeSession'

type Props = {
  session: BadgeSession
}

export default function FinalBadge({ session }: Props) {
  const issued = new Date(session.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function handleReset() {
    clearBadgeSession()
    window.location.href = '/trigger-warning'
  }

  return (
    <div className="max-w-lg w-full font-mono text-white flex flex-col gap-4">

      {/* System header */}
      <div className="bg-gray-950 border border-gray-700 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 tracking-widest uppercase">
          SLORE-MOD v2.3 // Certification Registry
        </span>
        <span className="text-xs text-green-400 uppercase tracking-widest">
          ● Verified
        </span>
      </div>

      {/* Badge document */}
      <div className="relative border-2 border-white bg-black p-6 flex flex-col gap-5">

        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-gray-500" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gray-500" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gray-500" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-gray-500" />

        {/* Doc header */}
        <div className="text-center flex flex-col gap-1">
          <p className="text-xs text-gray-600 uppercase tracking-widest">
            Department of Digital Compliance
          </p>
          <p className="text-xs text-gray-700 uppercase tracking-widest">
            Office of Content Enforcement // Permanent Record
          </p>
          <div className="border-t border-gray-800 mt-2" />
        </div>

        {/* Session ID + issued */}
        <div className="flex justify-between text-xs text-gray-600 uppercase tracking-widest">
          <span>Session {session.sessionId}</span>
          <span>Issued: {issued}</span>
        </div>

        {/* Classification block */}
        <div className="border border-gray-700 bg-gray-950 p-4 flex flex-col gap-2 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest">
            This certifies that the reviewer has been permanently classified as:
          </p>
          <div className="border-t border-b border-gray-700 py-4">
            <p className="text-3xl font-black uppercase tracking-tight leading-tight">
              {session.badgeType}
            </p>
          </div>
          <p className="text-xs text-gray-500 italic">{session.subtitle}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 border border-gray-800 text-xs">
          <div className="border-r border-gray-800 px-4 py-3 text-center">
            <p className="text-gray-600 uppercase tracking-widest mb-1">✓ Approved</p>
            <p className="text-2xl font-black text-green-400">{session.approvedCount}</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-gray-600 uppercase tracking-widest mb-1">⚠ Flagged</p>
            <p className="text-2xl font-black text-yellow-400">{session.triggerWarnedCount}</p>
          </div>
        </div>

        {/* History squares */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-600 uppercase tracking-widest">Decision Record:</p>
          <div className="flex gap-1.5">
            {session.history.map((c, i) => (
              <div
                key={i}
                className={`w-7 h-7 border flex items-center justify-center text-xs font-bold ${
                  c === 'approve'
                    ? 'border-green-600 text-green-400 bg-green-950'
                    : 'border-yellow-600 text-yellow-400 bg-yellow-950'
                }`}
                title={c === 'approve' ? 'Approved' : 'Trigger Warning'}
              >
                {c === 'approve' ? '✓' : '⚠'}
              </div>
            ))}
          </div>
        </div>

        {/* Signature line */}
        <div className="border-t border-gray-800 pt-4 flex flex-col gap-1">
          <p className="text-xs text-gray-700">
            ______________________________________
          </p>
          <p className="text-xs text-gray-600 uppercase tracking-widest">
            Chief Algorithm // SLORE-MOD Enforcement System
          </p>
          <p className="text-xs text-gray-700 italic">
            Expires: Never. Your file is permanent.
          </p>
        </div>

      </div>

      {/* Screenshot instruction */}
      <div className="border border-gray-800 bg-gray-950 px-4 py-3 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-widest">
          ↑ Screenshot to save your badge ↑
        </p>
      </div>

      {/* CTAs */}
      <a
        href="https://symphony.to/slorec0re/trigger-warning"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center border-2 border-yellow-400 text-yellow-400 px-4 py-3 uppercase tracking-widest text-sm font-black hover:bg-yellow-400 hover:text-black transition-colors"
      >
        ⬇ Stream / Save Trigger Warning
      </a>

      <div className="flex gap-3">
        <Link
          href="/trigger-warning"
          className="flex-1 text-center border border-gray-700 text-gray-500 px-4 py-2 uppercase tracking-widest text-xs hover:border-white hover:text-white transition-colors"
        >
          Play Again
        </Link>
        <button
          onClick={handleReset}
          className="flex-1 text-center border border-gray-800 text-gray-700 px-4 py-2 uppercase tracking-widest text-xs hover:border-gray-600 hover:text-gray-500 transition-colors"
        >
          Clear Record
        </button>
      </div>

    </div>
  )
}
