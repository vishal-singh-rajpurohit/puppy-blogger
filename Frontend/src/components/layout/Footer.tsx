import Link from "next/link"

const Footer = () => {
  return (
    <footer className="m-4 rounded-lg border border-gray-200 bg-ui-bg-primary">
      <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-500 sm:text-center">
          © {new Date().getFullYear()} <Link href="/" className="font-medium hover:underline">Puppy Blogger</Link>. All Rights Reserved.
        </p>
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-gray-500 sm:justify-center">
            <li><Link href="/about" className="hover:underline">About</Link></li>
            <li><Link href="/me/feed" className="hover:underline">Community Feed</Link></li>
            <li><Link href="/me/write" className="hover:underline">Write Post</Link></li>
          </ul>
        </nav>
      </div>
    </footer>

  )
}

export default Footer