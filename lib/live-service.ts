import { db } from "./db"

export const updateLive = async (userId: string, liveId: string) => {
  await db.user.update({
    where: {
      id: userId
    },
    data: {
      liveId: liveId
    }
  })
}

export const endLive = async (userId: string) => {
  await db.user.update({
    where: {
      id: userId
    },
    data: {
      liveId: null
    }
  })
}

export const updateLiveId = async (userId: string, liveId: string) => {
  await db.user.update({
    where: {
      id: userId
    },

    data: {
      liveId: liveId
    }
  })
}