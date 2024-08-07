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
      <div className="ps-8 flex items-center gap-x-4 transition">
        <div className="bg-white rounded-full p-1">
          <Image
            src="/logo.svg"
            alt="TikTokLogo"
            height="48"
            width="48"
          />
        </div>
        <div className="text-4xl font-bold pt-1">
          TikTok LIVE
        </div>
      </div>
    </Link>
  )
}