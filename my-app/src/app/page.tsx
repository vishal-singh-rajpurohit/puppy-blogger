import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Instrument_Serif, Karla } from "next/font/google";

export const metadata: Metadata = {
  title: "Puppy Blogger — A Blogging Platform for Everyone",
  description:
    "Puppy Blogger is a free blogging platform open to any writer and any topic. Publish personal stories, tutorials, travel notes, creative writing, and more, and reach readers without any technical setup.",
  keywords: [
    "blogging platform",
    "start a blog online",
    "free blogging platform",
    "write and publish online",
    "personal blog site",
    "blogging community",
    "online writing platform",
  ],
  openGraph: {
    title: "Puppy Blogger — A Blogging Platform for Everyone",
    description:
      "A free blogging platform for any writer and any topic. Publish your first post in minutes.",
    type: "website",
  },
};

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

const body = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

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

function HeroSection() {
  return (
    <section className="w-full flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      <div className="flex items-center gap-3">
        <Image
          src="/icons/logo.png"
          alt="Puppy Blogger logo"
          loading="eager"
          width={56}
          height={56}
          className="object-contain"
        />
        <h1
          className="text-6xl leading-none text-ui-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Puppy Blogger
        </h1>
      </div>

      <span
        className="mt-5 block h-[3px] w-16 rounded-full bg-ui-bg-primary"
        aria-hidden="true"
      />

      <p
        className="mt-5 max-w-md text-lg text-ui-text-secondary"
        style={{ fontFamily: "var(--font-body)" }}
      >
        A blogging platform for every writer and every story.
      </p>

      <div
        className="mt-10 h-16 w-px border-l-2 border-dashed border-[#B0503B]/60"
        aria-hidden="true"
      />
      <PawMark className="mt-1 h-5 w-5 rotate-[8deg]" />
    </section>
  );
}

function AboutSection() {
  return (
    <section className="w-full flex items-center justify-center px-6 pb-16">
      <p
        className="max-w-md text-center text-base leading-relaxed text-ui-text-secondary"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Puppy Blogger is a blogging platform for everyone, whatever
        you want to write about. Share personal stories, tutorials,
        travel notes, recipes, or creative writing &mdash; no topic
        is too niche, and no writer is too new. Sign up, write your
        first post, and publish it in minutes.
      </p>
    </section>
  );
}

const CATEGORIES = [
  {
    title: "Lifestyle & journal",
    body: "Everyday stories, routines, and personal reflections from writers documenting their lives.",
  },
  {
    title: "Technology & how-to",
    body: "Guides, tutorials, and things writers have learned the hard way, explained simply.",
  },
  {
    title: "Travel & food",
    body: "Trip notes, local guides, and recipes from people who went and tried it themselves.",
  },
  {
    title: "Creative writing",
    body: "Poetry, short fiction, and personal essays from writers of every experience level.",
  },
];

function CategoriesSection() {
  return (
    <section className="w-full flex items-center justify-center px-6 pb-20">
      <div className="w-full max-w-2xl">
        <h2
          className="text-center text-3xl text-ui-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What you&apos;ll find here
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <article key={category.title} className="text-center sm:text-left">
              <h3
                className="text-xl text-ui-text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {category.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed text-ui-text-secondary"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {category.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StartWritingSection() {
  return (
    <section className="w-full flex items-center justify-center px-6 pb-28">
      <div
        className="relative w-full max-w-md rotate-[-1.2deg] bg-ui-bg-secondary p-10 text-center shadow-[0_18px_36px_-20px_rgba(43,35,24,0.45)]"
        style={{
          clipPath:
            "polygon(0 0, 92% 0, 100% 8%, 100% 100%, 0 100%)",
        }}
      >
        <h2
          className="text-3xl text-ui-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Got something to say?
        </h2>
        <p
          className="mx-auto mt-4 max-w-xs text-base text-ui-text-secondary"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Any topic, any voice, any length &mdash; your next post is
          one page away.
        </p>

        <Link
          href="/write"
          className="mt-7 inline-block rounded-sm bg-ui-btn-bg-primary px-7 py-3 text-base font-medium text-[#FAF6EC] transition-colors hover:bg-ui-btn-bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2318]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Start writing
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  const links = [
    { label: "Lifestyle", href: "/lifestyle" },
    { label: "Technology", href: "/technology" },
    { label: "Travel & food", href: "/travel" },
    { label: "Creative writing", href: "/creative-writing" },
    { label: "About", href: "/about" },
  ];

  return (
    <footer className="w-full border-t border-[#2B2318]/10 px-6 py-10">
      <nav
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        style={{ fontFamily: "var(--font-body)" }}
        aria-label="Footer"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-[#3F5B33] underline-offset-4 hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p
        className="mt-6 text-center text-xs text-[#5C5140]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        &copy; {new Date().getFullYear()} Puppy Blogger. A blogging
        platform for every writer and every topic.
      </p>
    </footer>
  );
}

export default function Home() {
  return (
    <div
      className={`${display.variable} ${body.variable} flex min-h-screen flex-col items-center`}
    >
      <HeroSection />
      <AboutSection />
      <CategoriesSection />
      <StartWritingSection />
      <SiteFooter />
    </div>
  );
}
