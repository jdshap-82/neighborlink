import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-[#1B6B4A] flex items-center gap-2">
        <span>🏘️</span> NeighborLink
      </Link>
      <div className="flex gap-3">
        <Link
          href="/board"
          className="px-4 py-2 rounded-lg border-2 border-[#1B6B4A] text-[#1B6B4A] font-semibold text-sm hover:bg-[#E6F4ED] transition"
        >
          I'm a Resident
        </Link>
        <Link
          href="/join"
          className="px-4 py-2 rounded-lg bg-[#1B6B4A] text-white font-semibold text-sm hover:bg-[#134E35] transition"
        >
          I'm a Contractor
        </Link>
      </div>
    </nav>
  )
}
