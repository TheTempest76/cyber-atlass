"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Home", href: "/Home" },
    { name: "Threat Reports", href: "/Home/Posts" },
    { name: "Verify Threat", href: "/Home/Verify" },
    { name: "Cyber Intel", href: "/Home/News" },
    { name: "Threat Map", href: "/Home/Map" },
    { name: "Phish Finder", href: "/Home/phish-finder" }
  ];

  const handleLogout = () => {
    console.log("User logged out");
    // Add your auth logout logic here
  };

  // Shared classes for hover & active effect
  const activeClasses =
    "bg-[#00ffff]/30 text-[#00ffff] shadow-[0_0_12px_#00ffff]";

  return (
    <nav className="bg-[#0a0a0a] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo + Website Name */}
          <Link
            href="/Home"
            className="flex items-center space-x-2 hover:text-[#0ff] transition-colors"
          >
            <svg
              className="h-8 w-8 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2l9 4.5v9L12 22 3 15.5v-9L12 2z"
              />
            </svg>
            <span className="text-2xl font-bold text-cyan-400 font-sans">
              CyberAtlas
            </span>
          </Link>

          {/* Desktop Menu + Log Out */}
          <div className="hidden md:flex items-center space-x-4 font-sans">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md transition-all duration-200 hover:text-white hover:bg-[#00ffff]/20 hover:shadow-[0_0_8px_#00ffff] ${
                    currentPath === link.href ? activeClasses : "text-gray-300"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-red-500 bg-[#111111]"
            >
              Log Out
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={toggleMenu}
              className="focus:outline-none p-2 rounded hover:bg-gray-800 transition"
            >
              <svg
                className="h-6 w-6 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] py-2" : "max-h-0"
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`block px-4 py-2 rounded-md mx-2 my-1 transition-all duration-200 hover:text-white hover:bg-[#00ffff]/20 hover:shadow-[0_0_8px_#00ffff] ${
              currentPath === link.href ? activeClasses : "text-gray-300"
            }`}
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}

        <button
          onClick={() => {
            handleLogout();
            setIsOpen(false);
          }}
          className="block w-[calc(100%-1rem)] mx-2 my-1 px-4 py-2 rounded-md text-red-500 bg-[#111111]"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}