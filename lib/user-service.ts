import { db } from "./db"

export const getUserByUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      externalUserId: true,
    }
  })

  return user;
}

export const getUserLiveByUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      liveId: true,
    }
  })

  if (user) {
    return {
      userId: user.id,
      liveId: user.liveId,
    };
  }
  return null;
}

export const getUserById = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
    
  })

  return user;
}

export const getAllUsers = async () => {
  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      imageUrl: true,
    }
  })

  return users;
}