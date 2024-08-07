import { db } from "./db";
import { getSelf } from "./auth-service";

export const sendGift = async (streamId: string, giftTypeId: string) => {
  const self = await getSelf();

  if (self.id) {
    await db.gift.create({
      data: {
        streamId,
        giftTypeId,
        gifterId: self.id,
      }
    })
  }
}

export const getNextGifter = async (streamId: string) => {
  const nextGifter = await db.gift.findFirst({
    where: {
      streamId,
    },
    orderBy: {
      createAt: "asc"
    }
  })

  return nextGifter;
}

export const consumeGift = async (giftId: string) => {

  await getSelf();

  await db.gift.delete({
    where: {
      id: giftId,
    }
  })
}

export const getGiftTypes = async () => {
  const gifts = await db.giftType.findMany({
    where: {}
  })

  return gifts;
} 
