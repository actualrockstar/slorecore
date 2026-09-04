// =============================================================================
// ELYWYD — "Everybody Loves You When You're Dead"
// Posthumous Attention Simulator — CENTRAL CONFIGURATION
// -----------------------------------------------------------------------------
// This is the ONE place to edit for:
//   - The pre-save URL
//   - Phase durations / pacing
//   - Every piece of on-screen copy (posts, headlines, statements, counters)
//
// The simulation logic (simulation.ts) and UI (Experience.tsx) read from here.
// Nothing below assumes the visitor is an artist, musician, or public figure.
// =============================================================================

// --- PRE-SAVE ---------------------------------------------------------------
// Replace the placeholder with the live pre-save link when it exists.
export const PRESAVE_URL = "[INSERT_PRE_SAVE_URL]";

// Where the "Return" / band context points (uses the site's normal routing).
export const HOME_URL = "/";

// The song / project title, used in the ending and share text.
export const SONG_TITLE = "Everybody Loves You When You're Dead";

// Fallback subject label when no name is entered.
export const DEFAULT_SUBJECT_NAME = "THE SUBJECT";

// Share copy for the optional secondary share action.
export const SHARE_TEXT =
  "I just watched the internet mourn me. Everybody Loves You When You're Dead.";

// This number is fixed for the ENTIRE escalation and must never change.
export const UNANSWERED_WHILE_ALIVE = 7;

// --- AUDIO ------------------------------------------------------------------
// Optional instrumental. Drop a file at the path below (see public/elywyd/audio/README.md).
// If the file is absent or fails to load, the experience falls back to a
// synthesized ambience and still works end-to-end.
export const AUDIO = {
  instrumentalSrc: "/elywyd/audio/instrumental.mp3", // optional; safe if missing
};

// --- PHASES -----------------------------------------------------------------
// All durations in milliseconds. Total run ≈ 51s + terminal ending.
// Edit these numbers to re-pace the whole experience. Order matters.
export const PHASE_ORDER = [
  "identification",
  "alive",
  "statusChange",
  "initialReaction",
  "viral",
  "content",
  "collapse",
  "ending",
] as const;

export type Phase = (typeof PHASE_ORDER)[number];

// `ending` is terminal (no auto-advance); its duration is ignored.
// Paced so the early phases are readable BEFORE the status change lands.
export const PHASE_DURATIONS: Record<Phase, number> = {
  identification: 5000,
  alive: 13000,
  statusChange: 4500,
  initialReaction: 11000,
  viral: 16000,
  content: 12000,
  collapse: 5500,
  ending: 0,
};

// --- PHASE 1: IDENTIFICATION ------------------------------------------------
export const TERMINAL_LINES = [
  "LOADING PROFILE...",
  "IDENTIFYING SUBJECT...",
  "SUBJECT FOUND.",
  "CONNECTING TO SOCIAL ARCHIVE...",
];

// --- PHASE 2: ALIVE AND OVERLOOKED ------------------------------------------
// The FIRST entry here is reused verbatim at the collapse/ending, so keep it.
export const ALIVE_MESSAGES = [
  "Can somebody call me when they get a chance?",
  "Long day. Anybody want to talk?",
  "I'm actually really proud of myself today.",
  "I don't know how I'm going to afford this.",
  "Does anybody else feel like they're losing their mind?",
  "I just want to breathe.",
  "I made it through another week.",
  "Is anyone awake?",
];

export const ALIVE_REACTIONS = [
  "Seen by 34 people.",
  "1 like.",
  "No replies.",
  "Message read at 8:42 PM.",
  "Delivered.",
  "Sponsored: your reminder is due.",
];

export const ALIVE_METRICS = [
  { label: "UNANSWERED MESSAGES", value: "7" },
  { label: "PEOPLE WHO CHECKED IN", value: "0" },
  { label: "MEANINGFUL REPLIES", value: "0" },
  { label: "POST VIEWS", value: "43" },
];

// The exact message + reactions restored at the collapse. Must match ALIVE_MESSAGES[0].
export const COLLAPSE_MESSAGE = {
  text: "Can somebody call me when they get a chance?",
  reactions: ["Seen by 34 people.", "No replies."],
};

// --- PHASE 3: STATUS CHANGE -------------------------------------------------
export const STATUS_CHANGE = {
  interrupt: "CONNECTION INTERRUPTED",
  changed: "SUBJECT STATUS CHANGED",
  from: "ALIVE",
  to: "DECEASED",
  details: [
    "TIME OF DEATH: JUST NOW",
    "CAUSE: WITHHELD",
    "CASE STATUS: PENDING",
  ],
};

// --- PHASE 4: INITIAL REACTION ----------------------------------------------
export const INITIAL_REACTIONS = [
  "Wait, what happened?",
  "This cannot be real.",
  "I was literally just thinking about them.",
  "Gone way too soon.",
  "They deserved so much more.",
  "I wish I had reached out.",
  "I hope they knew how loved they were.",
  "Please check on your friends.",
  "Why does this keep happening?",
  "Rest easy.",
];

// --- PHASE 5: VIRAL ESCALATION ----------------------------------------------
export const VIRAL_PERSONAL = [
  "Posting this old photo of us. I can't believe it.",
  "The break room won't be the same without them.",
  "I keep going back to our last conversation. I wish I'd done more.",
  "I only met them once but they changed how I see everything.",
  "We were basically best friends. Nobody knew them like I did.",
  "They lit up every single room they walked into.",
  "Found an old voicemail. Not ready to delete it.",
  "They covered my shift the day my kid was born. I never said thank you.",
];

export const VIRAL_PUBLIC = [
  "LOCAL NEWS: Community gathers for candlelight vigil tonight.",
  "A fundraiser has been organized in their memory.",
  "Sign the petition — over 40,000 signatures and climbing.",
  "#RememberThem is now trending in your area.",
  "A memorial mural is going up downtown this weekend.",
  "An old post of theirs is being shared everywhere right now.",
  "The diner where they worked has closed for the day in their honor.",
  "Commentators debate what their death means for all of us.",
  "A public figure calls the loss 'absolutely heartbreaking.'",
];

export const VIRAL_INSTITUTIONAL = [
  "We are deeply saddened by this loss.",
  "Our thoughts are with the family at this time.",
  "We remain committed to change.",
  "An internal review is underway.",
  "This does not reflect our values.",
  "Resources are available for anyone affected.",
  "A moment of silence will be observed.",
];

export const VIRAL_COMMERCIAL = [
  "Limited edition memorial tee — 100% of maybe goes to a cause.",
  "This tribute post is sponsored.",
  "[BLACK SQUARE POSTED]",
  "New podcast episode: We Need To Talk About What Happened.",
  "DOCUMENTARY ANNOUNCED: coming this fall.",
  "REACTION VIDEO: I Can't Believe They're Gone *emotional*",
  "YOU WON'T BELIEVE THEIR FINAL POST (GONE WRONG)",
  "Grab the commemorative candle before it sells out.",
];

// --- PHASE 6: THE SUBJECT BECOMES CONTENT -----------------------------------
export const CONTENT_POSTS = [
  "I knew them better than anyone.",
  "You did not know them.",
  "Do not speak for them.",
  "Here is what they would have wanted.",
  "They would have supported this.",
  "They absolutely would not have supported this.",
  "Stop politicizing their death.",
  "Their death is inherently political.",
  "I have followed this story from the beginning.",
  "THREAD: Everything we know so far. 🧵",
  "Five warning signs everyone missed.",
  "The final message they posted, decoded.",
  "What their death teaches us about society.",
  "Exclusive interview with someone who met them once.",
  "This tribute has been sponsored.",
  "New merch drop honoring a life. Link in bio.",
  "Reminder that engagement is up 400% on this topic.",
];

// --- METRICS (attention counters) -------------------------------------------
// These climb during viral + content phases. `format` controls display size.
export const COUNTERS = [
  { key: "mentions", label: "MENTIONS", target: 1_240_000 },
  { key: "tributes", label: "TRIBUTE POSTS", target: 318_400 },
  { key: "searches", label: "SEARCHES FOR YOUR NAME", target: 2_900_000 },
  { key: "claimed", label: "PEOPLE CLAIMING THEY KNEW YOU", target: 47_812 },
  { key: "wished", label: "PEOPLE WHO WISH THEY'D REACHED OUT", target: 92_540 },
  { key: "statements", label: "STATEMENTS RELEASED", target: 214 },
  { key: "products", label: "MEMORIAL PRODUCTS LISTED", target: 1_663 },
];

// --- HEADLINES --------------------------------------------------------------
export const HEADLINES = [
  "A Life Remembered Too Late.",
  "The Person Everyone Suddenly Knew.",
  "Questions Remain After Local Death.",
  "Community Asks How This Was Allowed to Happen.",
  "Friends Say the Signs Were Always There.",
  "A Final Post Takes on New Meaning.",
  "Thousands Gather to Honor Someone Many Never Met.",
  "Their Words Are Everywhere Now.",
  "What This Death Says About All of Us.",
  "Why Did Nobody Listen Before?",
  "An Ordinary Life Becomes a National Conversation.",
  "Everyone Is Paying Attention Now.",
];

// --- FICTIONAL AUTHORS / OUTLETS / HANDLES ----------------------------------
// All generic and invented. Used to attribute feed items deterministically.
export const AUTHOR_NAMES = [
  "Dana R.", "Marcus T.", "Priya S.", "Jordan L.", "Elena M.", "Sam K.",
  "Aisha B.", "Theo V.", "Nina C.", "Owen P.", "Rosa D.", "Kai H.",
  "Grace W.", "Malik J.", "Sofia N.", "Leon F.",
];

export const OUTLET_NAMES = [
  "The Daily Ledger", "Channel 7 Now", "Frontpage Wire", "The Signal",
  "Public Record", "Metro Dispatch", "The Evening Feed",
];

export const INSTITUTION_NAMES = [
  "Northbrook General Hospital", "Delmar Street Diner", "Riverside High School",
  "Meridian Logistics", "The Corner Bar", "Unit 4 Retail Group",
  "Westgate Community College", "Pinehill Care Home",
];

export const BRAND_NAMES = [
  "VANTA Apparel", "Kettle & Co.", "NOVA Energy", "Halcyon Wellness",
  "Driftwood Coffee", "Amperage Wireless",
];

export const COMMENTATOR_HANDLES = [
  "@truth_unfiltered", "@yourdailytake", "@wokeuptoday", "@thecommonsense",
  "@nationfirst", "@justiceforall", "@the_real_story", "@no_agenda_ever",
];

// --- ENDING -----------------------------------------------------------------
export const ENDING = {
  beat1: "Funny how that works.",
  beat2: "Nobody had anything to say yesterday.",
  title: "EVERYBODY LOVES YOU WHEN YOU'RE DEAD.",
  primaryCta: "LOVE US WHILE WE'RE STILL HERE",
  altCta: "DON'T WAIT UNTIL WE'RE DEAD",
  supporting: `Pre-save "${SONG_TITLE}."`,
};

// --- ANALYTICS EVENT NAMES --------------------------------------------------
// Fired via Vercel Analytics track(). No PII, image, or name is ever sent.
export const ANALYTICS_EVENTS = {
  pageView: "elywyd_page_view",
  photoSelected: "elywyd_photo_selected",
  started: "elywyd_simulation_started",
  completed: "elywyd_simulation_completed",
  skipped: "elywyd_simulation_skipped",
  replayed: "elywyd_replayed",
  presaveClicked: "elywyd_presave_clicked",
  audioEnabled: "elywyd_audio_enabled",
  shareClicked: "elywyd_share_clicked",
} as const;
