import { db  } from "./db";

export const createNewStep = async (
  roomId: string, 
  start: Point,
  end: Point | null,
  order: number,
  colorId: string,
  giftTypeId: string,
) => {
  await db.drawingStep.create({
    data: {
      roomId,
      startX: start.x,
      startY: start.y,
      endX: end ? end.x : null,
      endY: end ? end.y : null,
      colorId,
      order,
      giftTypeId,
    },
  })
}

export const deleteAllSteps = async (roomId: string) => {
  
  await db.drawingStep.deleteMany({
    where: {roomId: roomId}
  })
    
}

export const getCanvas = async (roomId: string) => {

  const steps = await db.drawingStep.findMany({
    where: {
      roomId
    },
    orderBy: {
      order: 'asc'
    }
  })

  return steps

}