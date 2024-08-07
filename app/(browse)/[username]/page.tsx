import { getUserByUsername, getUserLiveByUsername } from "@/lib/user-service";
import { notFound } from "next/navigation";
import { LiveStream } from "./_components/livestream";

import { getGiftTypes } from "@/lib/gift-service";
import { getSelf } from "@/lib/auth-service";
import { getColors } from "@/lib/color-service";
import { getBackgrounds } from "@/lib/background-image-service";

interface UserPageProps {
  params: {
    username: string;
  }
}

const UserPage = async ({
  params
}: UserPageProps) => { 

  const host = await getUserLiveByUsername(params.username);

  const self = await getSelf();

  const gifts = await getGiftTypes();
  const colors = await getColors();
  const backgrounds = await getBackgrounds();

  if (!host ) {
    notFound();
  }

  return (
    <div className="relative h-[90%] aspect-[9/16] rounded-3xl">

      <LiveStream viewerId={self.id} hostId={host.userId} gifts={gifts} colors={colors} backgrounds={backgrounds}/>
            
    </div>
  )
}

export default UserPage;