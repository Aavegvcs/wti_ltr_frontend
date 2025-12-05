// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// export default function SuccessPage() {
//   const router = useRouter();

//   useEffect(() => {
//     const t = setTimeout(() => {
//       router.push("/");
//     }, 2500);
//     return () => clearTimeout(t);
//   }, [router]);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
//       <img
//         src="/success.gif"
//         alt="Success"
//         className="w-40 h-40"
//       />
//       <h1 className="text-xl font-semibold mt-4 text-green-700">
//         Trip Sheet Submitted Successfully!
//       </h1>
//     </div>
//   );
// }
// src/app/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.push("/");
    }, 2500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f7f5]">
      <img src="/tripsheet.png" alt="Success" className="w-full h-full" />
    </div>
  );
}

