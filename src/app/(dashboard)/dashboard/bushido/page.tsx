'use client';

/**
 * 60 Din Bushido — Samurai Discipline Tracker
 * Drop this file at:
 *   src/app/(dashboard)/dashboard/bushido/page.tsx
 *
 * No extra dependencies needed — uses only:
 *  • React (already in project)
 *  • lucide-react (already in project)
 *  • localStorage (no Firebase needed, keeps it self-contained)
 *  • Tailwind + your existing GlassCard / cn utilities
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Progress {
  days: Record<number, boolean>;
  longestStreak: number;
}

interface Phase {
  key: string;
  title: string;
  sub: string;
  range: string;
  desc: string;
  pool: Array<(d: number) => string>;
}

interface Quote {
  jp: string;
  romaji: string;
  text: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PILLARS = [
  { jp: '初心', romaji: 'Shoshin — Beginner\'s Mind', text: 'Har naye din ko ek naye student ki tarah shuru karo. Ego aur overconfidence — yeh teen sabse bade enemies hain growth ke.' },
  { jp: '改善', romaji: 'Kaizen — Continuous Improvement', text: '1% improvement, roz, bina miss kiye — yahi Japanese factories aur martial arts dojos ka core principle hai.' },
  { jp: '腹八分目', romaji: 'Hara Hachi Bu — 80% Rule', text: 'Pet bhar ke nahi, 80% tak. Iska matlab sirf khane se nahi — har cheez mein thoda discipline rakhna hai.' },
  { jp: '我慢', romaji: 'Gaman — Endure With Dignity', text: 'Tough situation mein bina complaint, bina drama ke, quietly endure karna. Chup reh ke seh ke aage badhna hai.' },
  { jp: '禊', romaji: 'Misogi — Purification Challenge', text: 'Roz ek tough physical/mental challenge khud ko do — cold shower, hard workout — jo comfort zone se bahar nikale.' },
  { jp: '生き甲斐', romaji: 'Ikigai — Apna Kyun', text: 'Wo reason jo subah tumhe bed se uthata hai. Apna kyun likho aur usse roz dekho.' },
  { jp: '武士道', romaji: 'Bushido — Way of the Warrior', text: 'Samurai code ke saat virtues: honor, courage, benevolence, respect, honesty, loyalty, aur self-control.' },
  { jp: '金継ぎ', romaji: 'Kintsugi — Golden Repair', text: 'Jab bartan toot jaata hai, usse gold se jodte hain. Fail hona allowed hai — restart na karna failure hai.' },
];

const CODE: Record<string, string[]> = {
  'Mano — Mind': [
    'Jo badla nahi ja sakta, usse waste-energy se mat lado — accept karo, aage badho.',
    'Apne baare mein halka socho, duniya ke baare mein gehra — ego side, learning aage.',
    'Mood pe decision mat lo. Pehle ruko, socho, phir act karo.',
    'Resentment aur complaint ko jagah mat do.',
    'Jealousy zeher hai — doosron ki growth se inspire ho, jalna nahi.',
    'Excuse banana band karo. Har excuse goal ki ek choti maut hai.',
  ],
  'Tan — Body': [
    'Subah jaldi uthna non-negotiable hai. Din pe control subah se shuru hota hai.',
    'Hara Hachi Bu — pet ka 80% bharo, junk food se door raho.',
    'Roz body ko challenge do — workout, walk ya stretch, koi din miss nahi.',
    'Sona ek schedule hai, mood nahi. Fix time pe sona, fix time pe uthna.',
    'Nasha, vaping, excess screen — body ek temple hai, gandha mat karo.',
    'Comfort zone se roz ek baar nikalna seekho.',
  ],
  'Kuren — Discipline': [
    'Roz ek fixed deep-work block — phone door, sirf kaam, minimum 2 ghante.',
    'Plan ko follow karo, mood ko follow mat karo.',
    'Kaizen — roz 1% better, chhoti improvement, bina exception.',
    'Jo aaj ho sakta hai, kal pe mat daalo.',
    'Phone/social media ek fixed time-box mein rakho.',
    'Har raat apne din ka audit karo — kya kiya, kya miss hua.',
  ],
  'Giri — Honor': [
    'Jo bola hai wahi karo. Apne aap se kiya waada sabse bada waada hai.',
    'Doosron ki respect karo, khaaskar jo tumse seekh rahe hain.',
    'Dikhave ke liye kuch mat karo. Kaam khud bolega.',
    'Haar ko izzat se lo, jeet ko bhi izzat se — dono mein seekhna hai.',
    'Apne values se kabhi mat hato, chahe koi dekh raha ho ya na ho.',
    'Apni izzat apni comfort se zyada important maano.',
  ],
};

const QUOTES: Quote[] = [
  { jp: '七転び八起き', romaji: 'Nana korobi, ya oki', text: 'Saat baar girna, aath baar uthna — girna problem nahi hai, na uthna problem hai.' },
  { jp: '一期一会', romaji: 'Ichi-go ichi-e', text: 'Yeh waqt, yeh mauka — dobara nahi aayega. Jo pal hai, usme pura present raho.' },
  { jp: '雨降って地固まる', romaji: 'Ame futte ji katamaru', text: 'Baarish ke baad zameen aur sakht ho jaati hai — struggle insaan ko mazboot banata hai.' },
  { jp: '虎穴に入らずんば虎子を得ず', romaji: 'Koketsu ni irazunba koji wo ezu', text: 'Sher ki maand mein gaye bina sher ka bachha nahi milta — bada reward bina risk ke nahi aata.' },
  { jp: '案ずるより産むが易し', romaji: 'Anzuru yori umu ga yasushi', text: 'Jitna sochte ho usse asaan hota hai karna — overthinking action se zyada thaka deta hai.' },
  { jp: '千里の道も一歩から', romaji: 'Senri no michi mo ippo kara', text: 'Hazaar mile ka raasta bhi ek kadam se shuru hota hai — bade goal se mat daro, aaj ka kadam dekho.' },
  { jp: '今日の我に勝つ', romaji: 'Kyō no ware ni katsu', text: 'Asli jeet wo hai jab tum aaj, kal ke apne se behtar nikle — competition khud se hai.' },
  { jp: '猿も木から落ちる', romaji: 'Saru mo ki kara ochiru', text: 'Bade se bada expert bhi kabhi girta hai — apni galti se sharam mat khao, seekho.' },
];

const PHASES: Phase[] = [
  {
    key: 'shoshin', title: 'Shoshin', sub: 'Foundation', range: 'Din 1–15',
    desc: 'Yeh phase neev ki hai. Lakshya intensity nahi, consistency hai. Iron Code ki basic habits ko bina miss kiye 15 din chalana hi sabse bada challenge hai.',
    pool: [
      () => '5:30 AM uthna, 10 min sunlight + paani — bina snooze ke.',
      () => 'Phone ko subah ke pehle ghante tak haath mat lagao.',
      (d) => `${20 + (d % 5)} pushups — sirf form pe focus, speed pe nahi.`,
      () => 'Aaj ek no-excuse diary entry likho — jo kaam pending tha wo poora karo.',
      () => 'Junk food zero, paani 2.5 litre minimum.',
      () => '90 min ka phone-free deep study/practice block.',
      () => 'Raat 10:30 baje screen off, sona 11 baje tak.',
    ],
  },
  {
    key: 'kaizen', title: 'Kaizen', sub: 'Growth', range: 'Din 16–30',
    desc: 'Ab base set ho gaya hai. Har 5 din mein thoda intensity badhao — Kaizen ka matlab hi yeh hai: chhota, consistent, lagataar upward push.',
    pool: [
      (d) => `Deep work block ${2 + Math.floor((d - 15) / 10)}h — bina ek bhi phone-check ke.`,
      (d) => `${30 + (d - 15)} pushups + ${15 + (d - 15)} squats.`,
      () => 'Cold shower / cold splash — 60 second minimum, bhaagna mana hai.',
      () => 'Aaj jo sabse mushkil topic/task tal rahe ho, wahi sabse pehle karo.',
      () => '30 min walk bina earphones — sirf socho, plan karo.',
      () => 'Social media: sirf 1 fixed 20-min window, baaki time app delete/hide.',
      () => 'Gratitude — 3 cheezein likho jo aaj achi hui, chhoti hi kyun na ho.',
    ],
  },
  {
    key: 'bushido', title: 'Bushido', sub: 'Hard Mode', range: 'Din 31–45',
    desc: 'Yahan se test asli hai. Yahi wo jagah hai jaha 90% log quit karte hain — tum nahi karoge.',
    pool: [
      (d) => `Intermittent fasting: ${12 + Math.min(d - 30, 4)} ghante ka fasting window.`,
      (d) => `${40 + (d - 30)} pushups + ${5 + Math.floor((d - 30) / 3)} min plank.`,
      () => '3 ghante ka single-sitting deep work — phone doosre room mein.',
      () => '1 ghanta complete silence — koi music, koi scroll, sirf socho ya likho.',
      () => 'Cold shower full body, 90 second se kam nahi.',
      () => 'Aaj kisi ek insaan ki bina expectation ke madad karo (Bushido: Jin — benevolence).',
      () => 'Sabse bada fear jo goal ke baare mein hai, usse likh ke uska 1 action-step nikalo.',
    ],
  },
  {
    key: 'satori', title: 'Satori', sub: 'Mastery', range: 'Din 46–60',
    desc: 'Aakhri phase — yahan discipline ek task nahi rehta, identity ban jaata hai. Bina list dekhe bhi sab automatically follow ho.',
    pool: [
      () => 'Apna pura din bina kisi reminder ke khud schedule karo aur follow karo.',
      (d) => `${50 + (d - 45)} pushups + 5km walk/run equivalent.`,
      () => '4 ghante deep work, 2 alag blocks mein.',
      () => 'Kisi junior/dost ko aaj 1 cheez teach karo jo tumne is journey mein seekhi.',
      () => 'Apna before vs now ek paragraph mein likho — kya badla hai.',
      () => 'Ek full digital detox: subah 6 se shaam 6 tak sirf zaroori kaam ke liye phone.',
      () => 'Apne 60-din ke iron code ko refine karo — agle 60 din ke liye apna khud ka version banao.',
    ],
  },
];

const MORNING_RITUAL = [
  ['5:30', 'Uthna — bina snooze, seedha paanv zameen pe.'],
  ['5:40', 'Paani + 10 min sunlight / fresh air.'],
  ['6:00', 'Movement — pushups / walk / stretch.'],
  ['6:30', 'Cold shower (Misogi).'],
  ['7:00', 'Din ka top-3 priority likho.'],
  ['7:15', 'Deep work block #1 — phone door.'],
];

const EVENING_RITUAL = [
  ['8:00', 'Halka dinner — Hara Hachi Bu yaad rakho.'],
  ['8:30', 'Social media ka fixed window (agar bacha ho).'],
  ['9:30', 'Kal ke top-3 likho.'],
  ['10:00', 'Din ka audit — kya kiya, kya chhoda.'],
  ['10:30', 'Screen off.'],
  ['11:00', 'Sona — fix time, har din.'],
];

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'bushido-progress-v1';

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch { /* ignore */ }
  return { days: {}, longestStreak: 0 };
}

function saveProgress(p: Progress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getChallenge(dayNum: number): string {
  let acc = 0;
  for (const phase of PHASES) {
    if (dayNum <= acc + 15) {
      const idx = (dayNum - acc - 1) % phase.pool.length;
      return phase.pool[idx](dayNum);
    }
    acc += 15;
  }
  return '';
}

function computeStreaks(days: Record<number, boolean>) {
  const total = 60;
  let best = 0, run = 0, current = 0;
  for (let d = 1; d <= total; d++) {
    if (days[d]) { run++; best = Math.max(best, run); } else { run = 0; }
  }
  for (let d = total; d >= 1; d--) {
    if (days[d]) current++; else break;
  }
  return { current, best };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HankoSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="44" fill="none" stroke="#e0552f" strokeWidth="5" />
      <text x="50" y="64" textAnchor="middle" fontSize="44" fill="#e0552f" fontFamily="serif">完</text>
    </svg>
  );
}

function SectionBadge({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="font-mono text-xs tracking-widest text-[#e0552f]">{num}</span>
      <span className="text-xs tracking-widest uppercase text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BushidoPage() {
  const [progress, setProgress] = useState<Progress>({ days: {}, longestStreak: 0 });
  const [openDetail, setOpenDetail] = useState<{ phaseKey: string; dayNum: number } | null>(null);
  const [stampingDay, setStampingDay] = useState<number | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'tracker' | 'pillars' | 'code' | 'quotes' | 'ritual'>('tracker');
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    autoTimer.current = setInterval(() => {
      setQIndex((i) => (i + 1) % QUOTES.length);
    }, 7000);
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, []);

  const doneCount = Object.values(progress.days).filter(Boolean).length;
  const { current: streak, best: bestStreak } = computeStreaks(progress.days);

  const toggleDay = useCallback((dayNum: number) => {
    setProgress((prev) => {
      const next = { ...prev, days: { ...prev.days } };
      if (next.days[dayNum]) {
        delete next.days[dayNum];
      } else {
        next.days[dayNum] = true;
        setStampingDay(dayNum);
        setTimeout(() => setStampingDay(null), 450);
      }
      const { best } = computeStreaks(next.days);
      next.longestStreak = Math.max(next.longestStreak, best);
      saveProgress(next);
      return next;
    });
  }, []);

  const resetProgress = () => {
    if (!confirm('Pura progress reset karna hai? Yeh undo nahi ho sakta.')) return;
    const fresh: Progress = { days: {}, longestStreak: 0 };
    setProgress(fresh);
    setOpenDetail(null);
    saveProgress(fresh);
  };

  const nextUndoneDay = (() => {
    for (let d = 1; d <= 60; d++) {
      if (!progress.days[d]) return d;
    }
    return null;
  })();

  // ── Nav tabs ──
  const TABS: { id: typeof activeTab; label: string }[] = [
    { id: 'tracker', label: '60-Day Tracker' },
    { id: 'pillars', label: 'Pillars' },
    { id: 'code', label: 'Iron Code' },
    { id: 'quotes', label: 'Kotowaza' },
    { id: 'ritual', label: 'Daily Ritual' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#e0552f] font-mono text-xs tracking-widest">武士道</span>
            <span className="text-xs text-muted-foreground tracking-widest">· 60 DIN · SAMURAI DISCIPLINE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">60 Din Bushido</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kaizen se banega. Koi shortcut nahi. Sirf raasta.</p>
        </div>
        <div className="text-4xl select-none opacity-20 font-serif">道</div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: doneCount, l: 'Din Complete' },
          { v: streak, l: 'Current Streak' },
          { v: Math.max(bestStreak, progress.longestStreak), l: 'Best Streak' },
        ].map(({ v, l }) => (
          <div key={l} className="rounded-xl border border-border/50 bg-card p-4 text-center">
            <div className="text-2xl font-bold font-mono text-[#e0552f]">{v}</div>
            <div className="text-xs text-muted-foreground mt-0.5 tracking-wide">{l}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 flex-wrap border-b border-border/40 pb-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2',
              activeTab === t.id
                ? 'text-[#e0552f] border-[#e0552f] bg-[#e0552f]/5'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ TRACKER TAB ══════════════════ */}
      {activeTab === 'tracker' && (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button
              onClick={resetProgress}
              className="text-xs text-muted-foreground hover:text-destructive border border-border/50 rounded-lg px-3 py-1.5 transition-colors"
            >
              Reset progress
            </button>
          </div>

          {PHASES.map((phase, pi) => {
            const startDay = pi * 15 + 1;
            const days = Array.from({ length: 15 }, (_, i) => startDay + i);

            return (
              <div key={phase.key} className="space-y-4">
                {/* Phase header */}
                <div className="flex items-baseline justify-between border-b border-border/30 pb-3">
                  <div>
                    <span className="font-serif text-lg font-semibold">{phase.title}</span>
                    <span className="ml-2 text-sm text-[#e0552f]">{phase.sub}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{phase.range}</span>
                </div>
                <p className="text-sm text-muted-foreground">{phase.desc}</p>

                {/* Day grid */}
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-5 md:grid-cols-10 lg:grid-cols-15">
                  {days.map((dayNum) => {
                    const isDone = !!progress.days[dayNum];
                    const isToday = dayNum === nextUndoneDay;
                    const isStamping = stampingDay === dayNum;
                    return (
                      <button
                        key={dayNum}
                        onClick={() => {
                          toggleDay(dayNum);
                          setOpenDetail(
                            openDetail?.dayNum === dayNum ? null : { phaseKey: phase.key, dayNum }
                          );
                        }}
                        className={cn(
                          'aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200',
                          isDone
                            ? 'border-[#e0552f] bg-[#e0552f]/5'
                            : 'border-border/40 bg-card hover:border-[#e0552f]/60',
                          isToday && !isDone && 'border-amber-500/70 ring-1 ring-amber-500/40',
                        )}
                        aria-label={`Din ${dayNum}${isDone ? ' — complete' : ''}`}
                      >
                        {!isDone && (
                          <span className="font-mono text-xs text-muted-foreground">{dayNum}</span>
                        )}
                        <span
                          className={cn(
                            'absolute inset-0 flex items-center justify-center p-1 transition-all duration-300',
                            isDone ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                            isStamping && 'animate-[stampHit_0.4s_ease-out]',
                          )}
                        >
                          <HankoSVG />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Day detail panel */}
                {openDetail?.phaseKey === phase.key && (
                  <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-[#e0552f]">Din {openDetail.dayNum}</span>
                      <button
                        onClick={() => setOpenDetail(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Band karo ✕
                      </button>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase text-amber-500 mb-1">Aaj ka Tough Challenge</p>
                      <p className="font-serif text-base text-foreground leading-relaxed">
                        {getChallenge(openDetail.dayNum)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Foundation (har din)</p>
                      <p className="text-sm text-muted-foreground">
                        Iron Code ke 24 rules mein se kam-se-kam apne phase ke core 4 follow karo — wake time, deep work block, no junk, raat ka audit.
                      </p>
                    </div>
                    <button
                      onClick={() => toggleDay(openDetail.dayNum)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        progress.days[openDetail.dayNum]
                          ? 'border border-[#e0552f]/50 text-[#e0552f] hover:bg-[#e0552f]/10'
                          : 'bg-[#e0552f] text-white hover:bg-[#c1432a]'
                      )}
                    >
                      {progress.days[openDetail.dayNum] ? 'Mark Undone' : 'Hanko Lagao — Din Complete ✓'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════ PILLARS TAB ══════════════════ */}
      {activeTab === 'pillars' && (
        <div className="space-y-4">
          <SectionBadge num="01" label="Buniyaad — Saat Japanese Sutra" />
          <p className="text-sm text-muted-foreground max-w-xl">
            Yeh sirf motivation nahi, yeh asli practiced philosophies hain — samurai, Zen monks aur Japanese workplaces mein sadiyon se use hoti hain.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <div
                key={p.jp}
                className="rounded-xl border border-border/40 bg-card p-5 flex gap-4 hover:border-[#e0552f]/40 transition-colors"
              >
                <span className="font-mono text-xs text-muted-foreground mt-1 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="font-serif text-2xl text-[#e0552f]">{p.jp}</div>
                  <div className="text-xs text-muted-foreground tracking-wide mb-2">{p.romaji}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ IRON CODE TAB ══════════════════ */}
      {activeTab === 'code' && (
        <div className="space-y-4">
          <SectionBadge num="02" label="Tetsu no Okite — 24 Non-Negotiable Rules" />
          <p className="text-sm text-muted-foreground max-w-xl">
            Miyamoto Musashi ke Dokkōdō se inspired — ek modern student/achiever ke liye adapt kiya gaya. Yeh guidelines nahi hain. Yeh rules hain.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(CODE).map(([group, rules]) => (
              <div key={group} className="rounded-xl border border-border/40 bg-card p-5">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-amber-500 mb-4 pb-2 border-b border-border/30">
                  {group}
                </h3>
                <ol className="space-y-0">
                  {rules.map((rule, i) => (
                    <li key={i} className="flex gap-3 py-2.5 text-sm text-muted-foreground border-b border-border/20 last:border-0">
                      <span className="font-mono text-[#e0552f] text-xs shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-muted/40 border border-border/30 p-4 text-sm text-muted-foreground">
            <strong className="text-amber-500">Yaad rakho:</strong> ek rule todna failure nahi hai. Rule ko todke usse ignore karna — wahi asli failure hai.
          </div>
        </div>
      )}

      {/* ══════════════════ QUOTES TAB ══════════════════ */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <SectionBadge num="04" label="Kotowaza — Japanese Proverbs" />
          <p className="text-sm text-muted-foreground max-w-xl">
            Sadiyon purane Japanese kahawaten, jo struggle, failure aur discipline par sabse seedhi baat karti hain.
          </p>
          <div className="rounded-xl border border-border/40 bg-card p-8 text-center space-y-4">
            <div className="font-serif text-4xl text-[#e0552f]">{QUOTES[qIndex].jp}</div>
            <div className="text-xs tracking-widest text-muted-foreground">{QUOTES[qIndex].romaji}</div>
            <p className="font-serif text-lg text-foreground max-w-md mx-auto leading-relaxed">
              {QUOTES[qIndex].text}
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => { setQIndex((i) => (i - 1 + QUOTES.length) % QUOTES.length); if (autoTimer.current) clearInterval(autoTimer.current); }}
                className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:border-[#e0552f] hover:text-[#e0552f] transition-colors"
              >‹</button>
              <div className="flex gap-1.5">
                {QUOTES.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => { setQIndex(i); if (autoTimer.current) clearInterval(autoTimer.current); }}
                    className={cn('w-1.5 h-1.5 rounded-full cursor-pointer transition-colors', i === qIndex ? 'bg-[#e0552f]' : 'bg-border')}
                  />
                ))}
              </div>
              <button
                onClick={() => { setQIndex((i) => (i + 1) % QUOTES.length); if (autoTimer.current) clearInterval(autoTimer.current); }}
                className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:border-[#e0552f] hover:text-[#e0552f] transition-colors"
              >›</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ RITUAL TAB ══════════════════ */}
      {activeTab === 'ritual' && (
        <div className="space-y-4">
          <SectionBadge num="05" label="Mainichi no Michi — Daily Ritual" />
          <p className="text-sm text-muted-foreground max-w-xl">
            Iron Code ko ek timeline mein daal diya hai. Isse copy karke apne phone lock screen pe rakho.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/40 bg-card p-5">
              <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                <span className="text-[#e0552f]">朝</span>
                <span>Asa no Michi — Morning Way</span>
              </h3>
              <ul className="space-y-0">
                {MORNING_RITUAL.map(([t, x]) => (
                  <li key={t} className="flex gap-3 py-2.5 text-sm border-b border-border/20 last:border-0">
                    <span className="font-mono text-amber-500 text-xs shrink-0 mt-0.5 w-10">{t}</span>
                    <span className="text-muted-foreground">{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border/40 bg-card p-5">
              <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                <span className="text-[#e0552f]">夜</span>
                <span>Yoru no Michi — Evening Way</span>
              </h3>
              <ul className="space-y-0">
                {EVENING_RITUAL.map(([t, x]) => (
                  <li key={t} className="flex gap-3 py-2.5 text-sm border-b border-border/20 last:border-0">
                    <span className="font-mono text-amber-500 text-xs shrink-0 mt-0.5 w-10">{t}</span>
                    <span className="text-muted-foreground">{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-6 border-t border-border/30 text-center space-y-1">
        <div className="text-2xl text-[#e0552f] font-serif opacity-40">道</div>
        <p className="text-xs text-muted-foreground">Tumhara raasta tumhara hai. 60 din baad jo bachega — wahi asli tum ho.</p>
      </div>
    </div>
  );
}