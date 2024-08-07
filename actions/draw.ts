"use server"

import { createNewStep, deleteAllSteps, getCanvas } from "@/lib/draw-service";

export const onDraw = async (
  roomId: string, 
  start: Point,
  end: Point | null,
  order: number,
  colorId: string,
  giftTypeId: string,
) => {
  try {
    await createNewStep(roomId, start, end, order, colorId, giftTypeId)
    console.log('created new step')
  } catch (error) {
    console.log("Unable to create new drawing step", error)
  }
}

export const onStartNewRoom = async (roomId: string) => {
  try {
    await deleteAllSteps(roomId)
  } catch {
    console.log('cannot delete steps')
  }
}


export const getPreviousSteps = async (roomId: string) => {
  try {
    const steps = await getCanvas(roomId)
    return steps
  } catch {
    throw new Error('Cannot get previous steps')
  }
}