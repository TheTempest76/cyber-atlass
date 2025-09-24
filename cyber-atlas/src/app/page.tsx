"use client";

import Link from "next/link";
import Globe3D from "@/src/components/Globe3D";

export default function LandingPage() {

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Background layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-teal-900 to-emerald-900" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[length:24px_24px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="mb-16 grid grid-cols-1 items-center gap-10 md:mb-20 md:grid-cols-2">
          {/* Left: Copy & CTAs */}
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-black/30 px-3 py-1 text-xs text-cyan-200 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Real-time protection and insights
            </span>
            <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent drop-shadow">
              Cyber Atlas
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-200/90 max-w-2xl md:max-w-none mx-auto md:mx-0">
              Your comprehensive platform for cybercrime awareness, threat detection, and community protection. 
              Stay informed, stay safe, and help build a more secure digital world.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
              <Link
                href="/Auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-gray-900 font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                href="/Auth/signin"
                className="px-8 py-4 bg-black/40 border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300 font-semibold rounded-xl transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right: 3D Globe */}
          <div className="mx-auto w-full max-w-2xl md:max-w-none">
            <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-black/30 to-black/10 p-3 shadow-2xl backdrop-blur">
              <Globe3D />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
            </div>
          </div>
        </div>

        

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-5 lg:gap-8 mb-16 md:mb-20">
          <div className="group bg-black/40 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-2xl text-center hover:border-cyan-400/40 transition-colors shadow-lg md:translate-y-1 hover:md:-translate-y-0">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Threat Detection</h3>
            <p className="text-gray-200">Advanced AI-powered analysis to identify and verify potential scams and cyber threats.</p>
          </div>

          <div className="group bg-black/40 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-2xl text-center hover:border-cyan-400/40 transition-colors shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Latest News</h3>
            <p className="text-gray-200">Stay updated with the latest cybercrime news and security alerts from around the world.</p>
          </div>

          <div className="group bg-black/40 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-2xl text-center hover:border-cyan-400/40 transition-colors shadow-lg md:-translate-y-1 hover:md:-translate-y-0">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Community Reports</h3>
            <p className="text-gray-200">Report and track cybercrime incidents in your area to help protect your community.</p>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-cyan-300 mb-6 text-center">How it works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {["Scan & Verify", "Learn & Track", "Act & Report"].map((step, i) => (
              <div key={i} className="relative rounded-2xl border border-cyan-500/20 bg-black/30 p-6 shadow-lg">
                <div className="absolute -top-3 -left-3 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 px-3 py-1 text-sm font-semibold text-gray-900 shadow">
                  {i + 1}
                </div>
                <h3 className="mt-2 text-xl font-semibold text-cyan-200">{step}</h3>
                <p className="mt-2 text-gray-200/90">
                  {i === 0 && "Paste suspicious text, links, or files to get instant risk scoring and guidance."}
                  {i === 1 && "Stay updated with intel and explore the interactive map to spot trends."}
                  {i === 2 && "Report incidents to protect others and strengthen the community."}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-16 md:mb-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { k: "+10k", v: "Threats analyzed" },
              { k: "99.1%", v: "Detection precision" },
              { k: "24/7", v: "Intel updates" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-cyan-500/20 bg-black/30 p-6 text-center shadow-lg">
                <div className="text-3xl font-extrabold text-cyan-300">{s.k}</div>
                <div className="mt-1 text-sm uppercase tracking-wide text-cyan-200/70">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-cyan-300 mb-4">Ready to protect yourself?</h2>
          <p className="text-gray-200 mb-8">Join thousands of users who are already staying safe with Cyber Atlas.</p>
          <Link
            href="/Auth/signup"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-gray-900 font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            Create Your Account
          </Link>
        </div>

        
      </div>
    </div>
  );
}
