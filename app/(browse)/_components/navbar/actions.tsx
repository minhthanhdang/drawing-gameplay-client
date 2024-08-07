import { Button } from "@/components/ui/button";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server"
import Link from "next/link";

export const Actions = async () => {
  const user = await currentUser();

  return (
    <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0 pe-8 min-w-[650]px">
      {!user && (
        <SignInButton>
          <Button size="sm" variant="primary">
            Login
          </Button>
        </SignInButton>
      )}
      {!!user && (
        <div className="flex items-center gap-x-4">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
            asChild
          >
            <Link href={`/gallery`}>
              <span className="block">
                Gallery
              </span>
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
            asChild
          >
            <Link href={`/u/${user.username}`}>
              <span className="block">
                My LIVE Profile
              </span>
            </Link>
          </Button>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: "w-[48px] h-[48px]"
              }
            }}
          />
        </div>
      )}
    </div>
  )
}