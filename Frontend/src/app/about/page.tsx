import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Sparkles, Heart, Feather, Compass, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Puppy Blogger",
  description:
    "Puppy Blogger is an open, warm, and distraction-free blogging community where every writer can share stories, tutorials, and personal reflections.",
};

function PawMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={className}
      fill="#B0503B"
    >
      <ellipse cx="20" cy="26" rx="9.5" ry="8" />
      <ellipse cx="8" cy="14" rx="4" ry="5.2" />
      <ellipse cx="18" cy="8" rx="4.2" ry="5.5" />
      <ellipse cx="29" cy="10" rx="4" ry="5.2" />
      <ellipse cx="34" cy="19" rx="3.6" ry="4.6" />
    </svg>
  );
}

export default function AboutPage() {
  const values = [
    {
      icon: <Feather className="h-6 w-6 text-[#B0503B]" />,
      title: "Quiet, Distraction-Free Writing",
      description:
        "No intrusive popups, banners, or endless notifications. A thoughtful block editor that lets you focus entirely on your words and ideas.",
    },
    {
      icon: <Heart className="h-6 w-6 text-[#B0503B]" />,
      title: "Genuine Human Connections",
      description:
        "Connect through genuine dialogue. Leave heartfelt comments, appreciate stories with likes, and follow writers who inspire you.",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-[#B0503B]" />,
      title: "Open to Every Topic",
      description:
        "From technical deep dives and programming tutorials to quiet reflections, travel diaries, and recipes — every voice has a place here.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-[#B0503B]" />,
      title: "Thoughtful Reading Typography",
      description:
        "Crafted with warm paper-like tones, carefully paired fonts, and multiple themes (Default, Dark, and Forest) designed for relaxed reading.",
    },
    {
      icon: <Compass className="h-6 w-6 text-[#B0503B]" />,
      title: "Explore at Your Own Pace",
      description:
        "Chronological, authentic community feed without manipulative engagement algorithms. Discover what people are genuinely creating.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-[#B0503B]" />,
      title: "You Own Your Content",
      description:
        "Save drafts privately while you refine your thoughts, publish when you're ready, and manage your full profile and archives anytime.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/icons/logo.png"
            alt="Puppy Blogger"
            width={48}
            height={48}
            className="object-contain"
          />
          <h1 className="text-4xl sm:text-5xl font-serif text-ui-text-primary">
            About Puppy Blogger
          </h1>
        </div>

        <span
          className="mx-auto mt-4 block h-[3px] w-14 rounded-full bg-ui-bg-primary"
          aria-hidden="true"
        />

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ui-text-secondary">
          Puppy Blogger is a cozy, open corner of the web dedicated to the joy of writing and reading. 
          We built this platform to bring back the warmth, simplicity, and authenticity of personal blogging.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-8 w-px border-l-2 border-dashed border-[#B0503B]/60" />
          <PawMark className="h-5 w-5 rotate-12" />
        </div>
      </div>

      {/* The Story / Philosophy */}
      <section className="mt-16 rounded-xl border border-gray-200/60 bg-ui-card-primary p-8 sm:p-10 shadow-sm">
        <h2 className="text-2xl font-serif text-ui-text-primary">Our Story & Mission</h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-ui-text-secondary">
          <p>
            In an era dominated by rapid micro-posts, attention-seeking algorithms, and cluttered feeds, 
            the simple pleasure of sitting down with an honest essay or an informative guide has become rare.
          </p>
          <p>
            Puppy Blogger was created with one simple conviction: <strong>everyone has a story worth telling</strong>, 
            and writers deserve a calm, beautiful space to craft their thoughts without technical hurdles or algorithmic pressure.
          </p>
          <p>
            Whether you are documenting your daily life, explaining a complex technical topic, sharing a poem, or keeping a travel journal, 
            Puppy Blogger gives you the canvas and gets out of your way.
          </p>
        </div>
      </section>

      {/* Core Values / Features */}
      <section className="mt-16">
        <h2 className="text-center text-3xl font-serif text-ui-text-primary">
          What Makes Puppy Blogger Special
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-ui-text-secondary">
          Designed from the ground up for comfortable reading, authentic expression, and welcoming community.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200/50 bg-ui-card-primary p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-md bg-ui-bg-secondary p-3">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-ui-text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ui-text-secondary">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Community Call to Action */}
      <section className="mt-20 text-center">
        <div className="relative mx-auto max-w-xl rounded-2xl bg-ui-bg-secondary p-10 shadow-sm">
          <h2 className="text-3xl font-serif text-ui-text-primary">
            Ready to start your journey?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-ui-text-secondary">
            Join our growing community of writers, creators, and readers. Share your first post or explore today&apos;s feed.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/me/write"
              className="w-full sm:w-auto rounded-sm bg-ui-btn-bg-primary px-6 py-2.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover shadow-sm"
            >
              Start Writing Now
            </Link>
            <Link
              href="/me/feed"
              className="w-full sm:w-auto rounded-sm border border-gray-300 bg-ui-card-primary px-6 py-2.5 text-sm font-medium text-ui-text-primary transition hover:bg-ui-card-secondary"
            >
              Explore the Feed
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
