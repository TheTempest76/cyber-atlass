"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type FeatureLink = {
  name: string;
  href: string;
  description: string;
  details: string;
  image: string;
};

const features: FeatureLink[] = [
  {
    name: "Threat Reports",
    href: "/Home/Posts",
    description: "View and submit verified threat reports.",
    details:
      "Browse real-time verified threat reports submitted by users across the globe. Filter by scam type, location, or date to stay informed and protect yourself from the latest cyber threats.",
    image: "https://picsum.photos/400/300?random=1",
  },
  {
    name: "Verify Threat",
    href: "/Home/Verify",
    description: "Check the authenticity of suspicious messages or emails.",
    details:
      "Suspect a phishing attempt or scam email? Our verification tool lets you cross-check the authenticity of messages and URLs instantly, so you know what’s safe and what’s not.",
    image: "https://picsum.photos/400/300?random=2",
  },
  {
    name: "Cyber Intel",
    href: "/Home/News",
    description: "Stay updated with latest cybersecurity news.",
    details:
      "Get curated news and intelligence about cyber attacks, data breaches, and malware campaigns from reliable sources. Stay ahead and make informed decisions to protect your online presence.",
    image: "https://picsum.photos/400/300?random=3",
  },
  {
    name: "Threat Map",
    href: "/Home/Map",
    description: "Visualize threat locations and trends worldwide.",
    details:
      "Explore a global map showing where threats and scams are being reported in real-time. Understand patterns, hotspots, and trends to stay alert and secure.",
    image: "https://picsum.photos/400/300?random=4",
  },
  {
    name: "Phish Finder",
    href: "/Home/phish-finder",
    description: "Detect phishing attempts and unsafe URLs.",
    details:
      "Enter any suspicious link and let Phish Finder analyze it. Detect phishing websites, malicious URLs, and unsafe downloads to prevent compromise before it happens.",
    image: "https://picsum.photos/400/300?random=5",
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-10">

        {/* Fraud suggestion */}
        <div className="bg-black/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-cyan-500/20 flex flex-col md:flex-row items-center gap-6">
          <img
            src="https://picsum.photos/400/300?random=6"
            alt="Tip"
            className="w-full md:w-48 h-48 object-cover rounded-xl border border-cyan-500/30 shadow-md"
          />
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">💡 Fraud Prevention Tip</h1>
            <p className="text-gray-200 leading-relaxed text-lg">
              Always verify unexpected emails, messages, or calls that request personal or financial information.
              Avoid clicking links or sending money without confirming the source.
            </p>
          </div>
        </div>

        {/* Mock posts */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-cyan-400 mb-4">Recent Alerts</h2>
          {[
            {
              id: 1,
              title: "Beware of Fake Investment Schemes",
              content:
                "Scammers are sending convincing emails promising high returns in a short period. Always verify the source and avoid sending money upfront.",
              tags: ["Investment", "Email Scam"],
              image: "https://picsum.photos/400/300?random=7",
            },
            {
              id: 2,
              title: "Phishing SMS Alert",
              content:
                "Received a text message asking to verify your account details? Never click unknown links. Always report suspicious messages.",
              tags: ["SMS", "Phishing"],
              image: "https://picsum.photos/400/300?random=8",
            },
          ].map((post) => (
            <div
              key={post.id}
              className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 object-cover rounded-xl mb-4 border border-cyan-500/30 shadow-md"
              />
              <h3 className="text-2xl font-semibold mb-2 text-cyan-300">{post.title}</h3>
              <p className="text-gray-100 mb-4 leading-relaxed">{post.content}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-cyan-700 to-green-700 text-cyan-100 px-3 py-1 rounded-full text-sm shadow-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Features / What CyberAtlas Does */}
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-cyan-400 mb-4">What CyberAtlas Does</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all flex flex-col items-center gap-4"
              >
                <img
                  src={feature.image}
                  alt={feature.name}
                  className="w-full h-48 md:h-64 object-cover rounded-xl border border-cyan-500/30 shadow-md"
                />
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2">{feature.name}</h3>
                  <p className="text-gray-200 mb-4">{feature.details}</p>
                  <Link
                    href={feature.href}
                    className="inline-block px-5 py-2 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-gray-900 font-semibold rounded-xl shadow-lg transition-all"
                  >
                    Explore {feature.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
