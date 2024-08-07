import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
})

export const Logo = () => {
  return (
    <Link href="/">
      <div className="flex items-center transition ps-8">
        <div className="bg-white rounded-full p-1">
          <Image
            src="/logo.svg"
            alt="TikTokLogo"
            height="48"
            width="48"
          />
        </div>
        <div className="text-4xl font-bold">
          TikTok LIVE
        </div>
      </div>
    </Link>
  )
}