import { getSelf } from "@/lib/auth-service";

import { currentUser } from "@clerk/nextjs/server";
import { getUserByUsername } from "@/lib/user-service";

import { getColors } from "@/lib/color-service";
import { getGiftTypes } from "@/lib/gift-service";
import { LiveStream } from "../_components/livestream";
import { getBackgrounds } from "@/lib/background-image-service";



interface CreatorPageProps {
  params: {
    username: string;
  }
}

const CreatorPage = async ({
  params,
}: CreatorPageProps) => {

  const externalUser = await currentUser();

  const user = await getUserByUsername(params.username);
  console.log(user, externalUser?.id)

  if (!user || user.externalUserId !== externalUser?.id) {
    throw new Error("Unauthorized")
  }

  const self = await getSelf();
  if (self.liveId) {
    throw new Error("User error")
  }
  

  const colors = await getColors();
  const giftTypes = await getGiftTypes();
  const backgrounds = await getBackgrounds();

  return (
    <>
      <div className="relative h-[90%] aspect-[9/16]">
        <LiveStream userId={user.id} gifts={giftTypes} colors={colors} backgrounds={backgrounds}/>
      </div>

      
    </>
  )
}

export default CreatorPage;