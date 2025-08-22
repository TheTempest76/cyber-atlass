"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function SigninPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1️⃣ Sign in user
      const userCred = await signInWithEmailAndPassword(auth, form.email, form.password);

      // 2️⃣ Get location (ask user permission)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // 3️⃣ Update Firestore document
          await updateDoc(doc(db, "users", userCred.user.uid), {
            location: { latitude, longitude },
            lastLogin: new Date(),
          });

          // 4️⃣ Redirect to Home page
          router.push("/Home");
        },
        async (error) => {
          console.warn("Location not available:", error);

          // Update Firestore without location
          await updateDoc(doc(db, "users", userCred.user.uid), {
            lastLogin: new Date(),
          });

          router.push("/Home");
        }
      );
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Sign In
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
          className="mb-4 w-full rounded-lg border p-3 focus:border-blue-500 focus:ring focus:ring-blue-200"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="mb-6 w-full rounded-lg border p-3 focus:border-blue-500 focus:ring focus:ring-blue-200"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <Link
            href="/signup"
            className="w-1/2 rounded-lg bg-gray-200 py-3 text-center font-semibold text-gray-700 hover:bg-gray-300 transition"
          >
            Sign Up
          </Link>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
