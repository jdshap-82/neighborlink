const SERVICES = [
  { id: "hvac", label: "HVAC", icon: "❄️" },
  { id: "plumbing", label: "Plumbing", icon: "🔧" },
  { id: "electrical", label: "Electrical", icon: "⚡" },
  { id: "handyman", label: "Handyman", icon: "🛠️" },
  { id: "pool", label: "Pool Services", icon: "🏊" },
  { id: "roofing", label: "Roofing", icon: "🏠" },
  { id: "lawn", label: "Lawn Care", icon: "🌿" },
  { id: "irrigation", label: "Irrigation", icon: "💧" },
  { id: "pest", label: "Pest Control", icon: "🐜" },
  { id: "doggrooming", label: "Dog Grooming", icon: "🐕" },
  { id: "babysitter", label: "Babysitter", icon: "👶" },
  { id: "dogwalking", label: "Dog Walking", icon: "🦮" },
  { id: "appliance", label: "Appliance Repair", icon: "🔌" },
  { id: "painting", label: "Painting", icon: "🎨" },
  { id: "golfcart", label: "Golf Cart Repair", icon: "🏌️" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9F6F1]">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-10 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#E6F4ED] text-[#1B6B4A] text-xs font-semibold tracking-wide mb-5">
          BUILT FOR WESTHAVEN · FRANKLIN, TN
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-5">
          Your neighbor's contractor<br />
          <span className="text-[#1B6B4A] italic">is already next door</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-9 leading-relaxed">
          Post what you need. Contractors already working in Westhaven see it instantly.
          No waiting for quotes from across town — get help from pros who are already here.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/board" className="px-8 py-4 rounded-lg bg-[#1B6B4A] text-white font-semibold text-lg hover:bg-[#134E35] transition">
            Post a Request — It's Free
          </Link>
          <Link href="/join" className="px-8 py-4 rounded-lg border-2 border-[#1B6B4A] text-[#1B6B4A] font-semibold text-lg hover:bg-[#E6F4ED] transition">
            Join as a Contractor
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "📋", title: "Post Your Need", desc: "Describe the job — leaky faucet, lawn mowing, pool opening. Takes 30 seconds." },
            { icon: "📍", title: "Contractors See It", desc: "Pros already working in Westhaven get notified. No cold calls, no searching." },
            { icon: "🤝", title: "Connect & Get It Done", desc: "Review ratings, pick your pro, and get the job done — often the same day." },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 border border-gray-200 text-center hover:shadow-lg transition">
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">{s.title}</div>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Services available in Westhaven</h2>
          <p className="text-center text-gray-500 mb-8">From urgent repairs to weekly maintenance</p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {SERVICES.map((s) => (
              <div key={s.id} className="px-4 py-2.5 rounded-xl bg-[#F9F6F1] border border-gray-200 text-sm font-medium flex items-center gap-1.5">
                <span>{s.icon}</span> {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
          {[
            { num: "2,400+", label: "Westhaven Families" },
            { num: "45+", label: "Active Contractors" },
            { num: "< 2 hrs", label: "Avg Response Time" },
            { num: "4.8 ★", label: "Avg Contractor Rating" },
          ].map((s, i) => (
            <div key={i} className="py-5">
              <div className="text-3xl font-bold text-[#1B6B4A]">{s.num}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-6 text-gray-400 text-sm border-t border-gray-200">
        © 2026 NeighborLink · Built for Westhaven, Franklin TN
      </footer>
    </div>
  );
}