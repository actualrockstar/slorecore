'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import FinalBadge from '../components/FinalBadge'
import MailingList from '../components/MailingList'
import { loadBadgeSession, type BadgeSession } from '../lib/badgeSession'

export default function TriggerWarningSaved() {
  const [session, setSession] = useState<BadgeSession | null | 'loading'>('loading')
  const [mailingList, setMailingList] = useState(false)

  useEffect(() => {
    setSession(loadBadgeSession())
  }, [])

  return (
    <div className="items-left justify-items-left min-h-screen p-8 sm:p-20">
      <main className="flex flex-col items-start gap-6">

        <Link href="/" className="bg-white text-black w-fit text-xs px-2 py-1">
          ← Home
        </Link>

        {session === 'loading' && (
          <p className="text-xs text-gray-600 font-mono uppercase tracking-widest">
            Reading certification record...
          </p>
        )}

        {session === null && (
          <div className="max-w-lg w-full font-mono text-white flex flex-col gap-4">
            <div className="bg-gray-950 border border-gray-700 px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-500 tracking-widest uppercase">
                SLORE-MOD v2.3 // Certification Registry
              </span>
              <span className="text-xs text-red-400 uppercase tracking-widest">
                ● No Record
              </span>
            </div>
            <div className="border border-gray-800 bg-black p-6 flex flex-col gap-4">
              <p className="text-xs text-gray-600 uppercase tracking-widest">
                System Error — File Not Found
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                No certification record found. Complete the Content Moderation Simulator
                to generate your badge, then presave the single to unlock it.
              </p>
              <Link
                href="/trigger-warning"
                className="border-2 border-white text-white px-4 py-3 uppercase tracking-widest text-sm font-black hover:bg-white hover:text-black transition-colors text-center"
              >
                [ Start the Simulator ]
              </Link>
            </div>
          </div>
        )}

        {session !== null && session !== 'loading' && (
          <FinalBadge session={session} />
        )}

        <button
          className="fixed bottom-10 bg-white text-black font-mono text-sm px-3 py-1"
          onClick={() => setMailingList(true)}
        >
          become a slore
        </button>
        {mailingList && <MailingList onClose={() => setMailingList(false)} />}

      </main>
    </div>
  )
}
