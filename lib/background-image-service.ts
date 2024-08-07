import { db } from "./db"


export const getBackgrounds = async () => {

  try{
    const backgrounds = await db.background.findMany()
    console.log(backgrounds)
    return backgrounds
  } catch {
    return []
  }
  
}