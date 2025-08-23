"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

type Report = {
  id: string;
  title: string;
  description: string;
  tags?: string[];
};

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [posts, setPosts] = useState<Report[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<string>("Unknown");

  useEffect(() => {
    const fetchData = async () => {
      onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);

        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const type = userDoc.exists() ? userDoc.data().type : "unknown";
            setUserType(type);

            // Fetch posts
            const querySnapshot = await getDocs(collection(db, "scamReports"));
            const fetchedPosts: Report[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              fetchedPosts.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                tags: data.tags || [],
              });
            });

            const filtered = fetchedPosts
              .filter((p) => p.title && p.description)
              .slice(0, 2);

            const staticPosts: Report[] = [
              { id: "static1", title: "Phishing Alert", description: "Multiple phishing emails reported targeting your employee type." },
              { id: "static2", title: "Fake Investment Scams", description: "Reports of fraudulent schemes circulating online." },
            ];

            setPosts(filtered.length > 0 ? filtered : staticPosts);

            // Get location
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) =>
                  setLocation(`${pos.coords.latitude},${pos.coords.longitude}`),
                () => setLocation("Unknown")
              );
            }

            // Gemini API call
            const response = await fetch(
              "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-goog-api-key": process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
                },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        {
                          text: `Provide 4 concise, professional cybersecurity recommendations for a ${type} located at ${location}. Use bullet points. Avoid casual filler.`
                        }
                      ]
                    }
                  ]
                })
              }
            );

            const data = await response.json();
            const generatedTips =
              data.candidates?.[0]?.content?.parts?.[0]?.text
                .split("\n")
                .filter((t: string) => t.trim() !== "") || [];

            setTips(generatedTips);
          } catch (err) {
            console.error(err);
            setPosts([]);
            setTips([]);
          }
        }

        setLoading(false);
      });
    };

    fetchData();
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* Combined Tips + Posts Card */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: AI Tips */}
          <div className="flex-1 bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-cyan-400 mb-2">
              Welcome {currentUser?.displayName || currentUser?.email || "User"}!
            </h2>
            <p className="text-gray-200 mb-4">
              Here’s what <span className="text-cyan-300 font-bold">{userType}</span> must know to stay secure:
            </p>
            <div className="bg-black/60 border border-cyan-500/30 rounded-xl p-4 shadow-md flex flex-col gap-2">
              <h3 className="text-cyan-300 font-semibold flex items-center gap-2">
                💡 Professional Tips
              </h3>
              <ul className="list-disc list-inside text-gray-100 space-y-1">
                {tips.length > 0 ? tips.map((tip, idx) => <li key={idx}>{tip}</li>) : <li>Loading AI tips...</li>}
              </ul>
            </div>
          </div>

          {/* Right: Recent Posts */}
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-2xl font-bold text-cyan-400 mb-2">
              Here’s what other <span className="text-cyan-300 font-bold">{userType}</span> are encountering:
            </h3>
            {loading ? (
              <p>Loading reports...</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all"
                >
                  <h4 className="text-xl font-semibold text-cyan-300 mb-2">{post.title}</h4>
                  <p className="text-gray-100 leading-relaxed">{post.description}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-cyan-700 to-green-700 text-cyan-100 px-3 py-1 rounded-full text-sm shadow-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
