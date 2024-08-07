import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server"

import Link from "next/link";

export const Actions = async () => {
  const user = await currentUser();

  return (
    <div className="flex items-center justify-end gap-x-2 pe-8">
      {!!user && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
            asChild
          >
            <Link  href={`/gallery`}>
              <span className="hidden lg:block">
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
              <span className="hidden lg:block">
                My LIVE Profile
              </span>
            </Link>
          </Button>
        </>
      )}
      
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground hover:text-primary"
        asChild
      >
        <Link href="/">
          <LogOut className="h-5 w-5 mr-2"/>
        </Link>
      </Button>
      <UserButton 
        afterSignOutUrl="/"
      />
    </div>
  )
}