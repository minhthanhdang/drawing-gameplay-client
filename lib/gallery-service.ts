import { db } from "./db";


export const getUserGallery = async (userId: string) => {
  return await db.background.findMany({
    where: {
      userId
    }
  })
}

export const getGallery = async (userId: string | null) => {
  if (userId !== null) {
    return await db.background.findMany({
      where: {
        OR: [
          {userId: {
            not: userId
          }},
          {
            userId: null
          }
        ]
        
      }
    })
  } else {
    return await db.background.findMany()
  }
  
}