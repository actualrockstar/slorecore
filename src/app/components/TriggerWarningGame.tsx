'use client'

import { useState } from 'react'
import { saveBadgeSession, generateSessionId } from '../lib/badgeSession'

type Screen = 'intro' | 'playing' | 'feedback' | 'result'
type Choice = 'approve' | 'flag'

const riskColor: Record<string, string> = {
  low:          'bg-gray-500',
  moderate:     'bg-yellow-400',
  high:         'bg-red-500',
  existential:  'bg-purple-500',
}

const statements = [
  {
    text: "This band uses real guitars.",
    user: "@anonymous_user_7741",
    approveResponse: "Approved. The algorithm will suppress it anyway.",
    flagResponse: "⚠️ Instrument-based content flagged for further review.",
    tags: ["music", "analog", "suspicious"],
    reported: 2,
    risk: "low",
    context: "negligible",
  },
  {
    text: "People should say what they actually mean.",
    user: "@user_49203_redacted",
    approveResponse: "Approved. Good luck with that out there.",
    flagResponse: "⚠️ Directness detected. Escalating to sensitivity committee.",
    tags: ["discourse", "directness", "threatening"],
    reported: 7,
    risk: "moderate",
    context: "low",
  },
  {
    text: "The internet might not always be right.",
    user: "@deleted_account_112",
    approveResponse: "Approved. Don't tell Reddit.",
    flagResponse: "⚠️ Misinformation about misinformation. Irony noted, still flagged.",
    tags: ["misinformation", "meta", "dangerous"],
    reported: 14,
    risk: "high",
    context: "very low",
  },
  {
    text: "Saying 'corn' instead of 'porn' is self-censorship.",
    user: "@user_compliance_ghost",
    approveResponse: "Approved. Agricultural content: cleared.",
    flagResponse: "⚠️ Agricultural subtext under review. Do not approach the corn.",
    tags: ["censorship", "agriculture", "subtext"],
    reported: 3,
    risk: "moderate",
    context: "low",
  },
  {
    text: "Everything does not need a disclaimer.",
    user: "@anonymous_user_0001",
    approveResponse: "Approved. This response has no disclaimer.",
    flagResponse: "⚠️ Disclaimer omission flagged. Very concerning behavior.",
    tags: ["opinion", "unsafe thought", "reckless"],
    reported: 5,
    risk: "moderate",
    context: "negligible",
  },
  {
    text: "Loud music is a valid emotional response.",
    user: "@flagged_repeatedly_88",
    approveResponse: "Approved. Decibel report filed with HR.",
    flagResponse: "⚠️ Volume-adjacent content. Noise complaint submitted.",
    tags: ["noise", "emotion", "volume"],
    reported: 9,
    risk: "moderate",
    context: "low",
  },
  {
    text: "Some rules exist to protect power, not people.",
    user: "@watch_listed_user_03",
    approveResponse: "Approved. Your file has been opened.",
    flagResponse: "⚠️ Anti-institutional sentiment detected. Monitoring initiated.",
    tags: ["discourse", "politics", "dangerous"],
    reported: 22,
    risk: "high",
    context: "very low",
  },
  {
    text: "You just moderated 8 statements. Reflect on that.",
    user: "@system_internal_audit",
    approveResponse: "Approved. You're one of us now.",
    flagResponse: "⚠️ Self-awareness flagged. Deeply ironic. Still flagged.",
    tags: ["self-awareness", "irony", "meta"],
    reported: 1,
    risk: "existential",
    context: "none",
  },
]

function getResult(approvals: number): { title: string; subtitle: string } {
  if (approvals >= 7) return {
    title: "FREE SPEECH ABSOLUTIST",
    subtitle: "intern level — please report to orientation",
  }
  if (approvals >= 5) return {
    title: "INDEPENDENT THINKER",
    subtitle: "under observation — your file is open",
  }
  if (approvals >= 3) return {
    title: "AMBIGUOUS THREAT",
    subtitle: "file pending review — stay by your phone",
  }
  if (approvals >= 1) return {
    title: "JUNIOR CONTENT MODERATOR",
    subtitle: "probationary — do not make eye contact with management",
  }
  return {
    title: "CHIEF CONTENT OFFICER",
    subtitle: "congratulations — you are the problem",
  }
}

export default function TriggerWarningGame() {
  const [screen, setScreen]         = useState<Screen>('intro')
  const [index, setIndex]           = useState(0)
  const [approvals, setApprovals]   = useState(0)
  const [lastResponse, setLastResponse] = useState('')
  const [lastChoice, setLastChoice] = useState<Choice | null>(null)
  const [history, setHistory]       = useState<Choice[]>([])

  function handleChoice(choice: Choice) {
    const s = statements[index]
    const newHistory = [...history, choice]
    setHistory(newHistory)
    setLastChoice(choice)
    if (choice === 'approve') {
      setApprovals(a => a + 1)
      setLastResponse(s.approveResponse)
    } else {
      setLastResponse(s.flagResponse)
    }
    setScreen('feedback')
  }

  function handleNext() {
    if (index + 1 >= statements.length) {
      const r = getResult(approvals)
      saveBadgeSession({
        sessionId: generateSessionId(),
        badgeType: r.title,
        subtitle: r.subtitle,
        approvedCount: approvals,
        triggerWarnedCount: statements.length - approvals,
        history,
        createdAt: new Date().toISOString(),
      })
      setScreen('result')
    } else {
      setIndex(i => i + 1)
      setScreen('playing')
    }
  }

  function handleRestart() {
    setScreen('intro')
    setIndex(0)
    setApprovals(0)
    setLastResponse('')
    setLastChoice(null)
    setHistory([])
  }

  const result = getResult(approvals)
  const progressPct = Math.round((index / statements.length) * 100)
  const s = statements[index] ?? statements[statements.length - 1]

  return (
    <div className="max-w-xl w-full font-mono text-white">

      {/* ── Dashboard chrome ── */}
      <div className="bg-gray-950 border border-gray-700 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 tracking-widest uppercase">
          SLORE-MOD v2.3 // Content Enforcement Terminal
        </span>
        <span className="flex items-center gap-1.5 text-xs text-red-400 uppercase tracking-widest">
          <span className="animate-blink">●</span> Live
        </span>
      </div>

      {/* ── Main panel ── */}
      <div className="bg-black border-x border-b border-gray-700 p-5 flex flex-col gap-5">

        {/* ══ INTRO ══ */}
        {screen === 'intro' && (
          <div className="flex flex-col gap-4">
            <div className="border border-gray-700 bg-gray-950 px-4 py-3 flex items-center justify-between">
              <p className="text-xs text-gray-400 uppercase tracking-widest">System Notice</p>
              <span className="text-xs bg-red-600 text-white px-2 py-0.5 uppercase tracking-widest font-bold">
                Mandatory
              </span>
            </div>

            <div className="border border-gray-800 px-4 py-3 text-xs text-gray-400 flex flex-col gap-1 leading-relaxed">
              <p><span className="text-gray-600">TO:</span> Newly Assigned Reviewer</p>
              <p><span className="text-gray-600">FROM:</span> Office of Digital Compliance</p>
              <p><span className="text-gray-600">RE:</span> Mandatory Content Review — Case Batch #TW-001</p>
              <div className="border-t border-gray-800 mt-2 pt-2 text-gray-500">
                You have been selected to review flagged statements.<br />
                For each item, determine: <span className="text-white">Approve</span> or <span className="text-yellow-400">Trigger Warning</span>.<br />
                There are no wrong answers. There are only consequences.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="animate-blink text-green-400 text-xs">●</span>
              <span className="text-xs text-green-400 uppercase tracking-widest">Case File Ready — 8 Items Pending</span>
            </div>

            <button
              onClick={() => setScreen('playing')}
              className="border-2 border-white px-4 py-3 uppercase tracking-widest text-sm font-bold hover:bg-white hover:text-black transition-colors w-full"
            >
              [ Accept Assignment ]
            </button>

            <p className="text-xs text-gray-700 italic">
              * Promotional experience for "Trigger Warning" by The Slores.
            </p>
          </div>
        )}

        {/* ══ PLAYING ══ */}
        {screen === 'playing' && (
          <div className="flex flex-col gap-4">

            {/* Progress bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-gray-600 uppercase tracking-widest">
                <span>Queue Progress</span>
                <span>{index}/{statements.length} reviewed</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Ticket header */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 uppercase tracking-widest">
                Case #{String(index + 1).padStart(3, '0')}
              </span>
              <span className="bg-yellow-400 text-black px-2 py-0.5 font-bold uppercase tracking-widest">
                ● Under Review
              </span>
            </div>

            {/* Content card */}
            <div className="border border-gray-700 flex">
              {/* Threat level strip */}
              <div className={`w-1.5 shrink-0 ${riskColor[s.risk] ?? 'bg-gray-500'}`} />

              <div className="flex flex-col gap-3 p-4 flex-1">
                {/* Fake username */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">{s.user}</span>
                  <span className="border border-red-600 text-red-500 px-1 text-xs uppercase tracking-wider">flagged</span>
                </div>

                {/* Statement */}
                <p className="text-base font-bold leading-snug">
                  &ldquo;{s.text}&rdquo;
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {s.tags.map(tag => (
                    <span key={tag} className="text-xs border border-red-800 text-red-400 px-2 py-0.5 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Metadata bar */}
            <div className="grid grid-cols-3 border border-gray-800 text-xs">
              <div className="border-r border-gray-800 px-3 py-2">
                <p className="text-gray-600 uppercase tracking-widest mb-1">⚑ Reported</p>
                <p className="text-gray-300">{s.reported} users</p>
              </div>
              <div className="border-r border-gray-800 px-3 py-2">
                <p className="text-gray-600 uppercase tracking-widest mb-1">▲ Risk</p>
                <p className="text-gray-300">{s.risk}</p>
              </div>
              <div className="px-3 py-2">
                <p className="text-gray-600 uppercase tracking-widest mb-1">◎ Context</p>
                <p className="text-gray-300">{s.context}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleChoice('approve')}
                className="flex-1 border-2 border-white px-4 py-3 uppercase tracking-widest text-sm font-bold hover:bg-white hover:text-black transition-colors hover-shake"
              >
                Approve
              </button>
              <button
                onClick={() => handleChoice('flag')}
                className="flex-1 border-2 border-yellow-400 text-yellow-400 px-4 py-3 uppercase tracking-widest text-sm font-bold hover:bg-yellow-400 hover:text-black transition-colors hover-shake"
              >
                ⚠ Trigger Warning
              </button>
            </div>

          </div>
        )}

        {/* ══ FEEDBACK ══ */}
        {screen === 'feedback' && (
          <div className="flex flex-col gap-4">

            {/* Stamped card */}
            <div className="border border-gray-700 flex relative">
              <div className={`w-1.5 shrink-0 ${riskColor[s.risk] ?? 'bg-gray-500'}`} />
              <div className="flex flex-col gap-3 p-4 flex-1 opacity-40">
                <p className="text-xs text-gray-500">{s.user}</p>
                <p className="text-base font-bold leading-snug">&ldquo;{s.text}&rdquo;</p>
              </div>

              {/* Stamp */}
              {lastChoice === 'approve' ? (
                <div key={`stamp-${index}`} className="animate-stamp absolute top-1/2 left-1/2 border-4 border-green-400 text-green-400 px-4 py-2 text-xl font-black uppercase tracking-widest whitespace-nowrap pointer-events-none">
                  ✓ Approved
                </div>
              ) : (
                <div key={`stamp-${index}`} className="animate-stamp absolute top-1/2 left-1/2 border-4 border-yellow-400 text-yellow-400 px-4 py-2 text-xl font-black uppercase tracking-widest whitespace-nowrap pointer-events-none">
                  ⚠ Trigger Warning
                </div>
              )}
            </div>

            {/* System response */}
            <div className="border-l-4 border-gray-700 pl-4">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">System Response</p>
              <p className="text-sm text-gray-300 italic leading-relaxed">{lastResponse}</p>
            </div>

            <button
              key={`next-${index}`}
              onClick={handleNext}
              className="border-2 border-white px-4 py-2 uppercase tracking-widest text-sm font-bold hover:bg-white hover:text-black transition-colors animate-fadeInBounceDown"
            >
              {index + 1 >= statements.length ? '[ View Final Determination ]' : 'Next Item →'}
            </button>

          </div>
        )}

        {/* ══ RESULT ══ */}
        {screen === 'result' && (
          <div className="flex flex-col gap-5">

            {/* Cert card */}
            <div className="border-2 border-white p-5 flex flex-col gap-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Department of Digital Compliance // Official Determination
              </p>
              <div className="border-t border-b border-gray-700 py-3 flex flex-col gap-1">
                <p className="text-xs text-gray-600 uppercase tracking-widest">This certifies that:</p>
                <p className="text-sm text-gray-400 uppercase tracking-widest">[ You ]</p>
                <p className="text-2xl font-black uppercase tracking-tight leading-tight mt-1">
                  {result.title}
                </p>
                <p className="text-xs text-gray-500 italic mt-1">{result.subtitle}</p>
              </div>

              {/* Score squares */}
              <div className="flex justify-center gap-1.5">
                {history.map((c, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 border text-xs flex items-center justify-center font-bold ${
                      c === 'approve'
                        ? 'border-green-500 text-green-400'
                        : 'border-yellow-500 text-yellow-400'
                    }`}
                    title={c === 'approve' ? 'Approved' : 'Trigger Warning'}
                  >
                    {c === 'approve' ? '✓' : '⚠'}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-700">
                {approvals} approved · {statements.length - approvals} flagged
                {approvals === 0 && ' · Impressive.'}
                {approvals === statements.length && ' · Suspicious.'}
              </p>

              <p className="text-xs text-gray-700 border-t border-gray-800 pt-3 mt-1">
                _____________________________ // Chief Algorithm, SLORE-MOD System
              </p>
            </div>

            {/* Presave CTA */}
            <div className="border border-gray-800 bg-gray-950 p-4 flex flex-col gap-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Your badge has been saved. Presave the single to collect it:</p>
              <a
                href="https://symphony.to/slorec0re/trigger-warning"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center border-2 border-yellow-400 text-yellow-400 px-4 py-3 uppercase tracking-widest text-sm font-black hover:bg-yellow-400 hover:text-black transition-colors"
              >
                ⬇ Presave to Collect Your Badge →
              </a>
            </div>

            <button
              onClick={handleRestart}
              className="text-xs text-gray-700 underline hover:text-gray-400 transition-colors text-left"
            >
              Re-open case (your file will be updated)
            </button>

          </div>
        )}

      </div>
    </div>
  )
}
