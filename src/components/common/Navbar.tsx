"use client";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm py-3 px-4 fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/Wti_logo.svg"
            alt="WTI Logo"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
        </Link>
      </div>
    </nav>
  );
}
