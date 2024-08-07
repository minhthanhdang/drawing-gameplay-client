import { Color as dbColor } from "@prisma/client";
import { db  } from "./db";


export const getColors = async () => {
  let colors: dbColor[] = []
  try{
    const colors = await db.color.findMany()
    return colors
  } catch {
    return []
  }
}