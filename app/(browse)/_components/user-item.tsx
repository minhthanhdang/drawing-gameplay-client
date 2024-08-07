"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";


interface UserItemProps {
  username: string;
  imageUrl: string;
}

export const UserItem = ({
  username, 
  imageUrl,
}: UserItemProps) => {

  const pathname = usePathname();


  const href = `/${username}`;
  const isActive = pathname === href;

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full h-12 justify-start",
        isActive && "bg-accent",
      )}
    >
      <Link href={href}>
        <div className={cn(
          "flex items-center w-full gap-x-4",
        )}>
          <UserAvatar 
            imageUrl={imageUrl}
            username={username}
            showBadge
          />
          <p className="truncate font-bold text-[16px]">
            {username}
          </p>
        </div>
      </Link>
    </Button>
  )
}