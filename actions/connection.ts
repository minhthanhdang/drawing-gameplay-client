"use server"

import { updateLive, endLive } from "@/lib/live-service";

export const onStartLive = async (userId: string, liveId: string) => {
  try {

    await updateLive(userId, liveId);

  } catch {
    throw new Error("cannot update start live Error")
  }
}


export const onEndLive = async (userId: string) => {
  try {
    await endLive(userId)
  } catch {
    throw new Error("cannot update start live Error")
  }
}