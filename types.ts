type Point = { x: number; y: number }


type DrawRainbowProps = {
  prevPoint: Point
  currentPoint: Point
  color: string
}

type Draw = {
  ctx: CanvasRenderingContext2D;
  currentPoint: Point;
  prevPoint: Point | null;
}


type Line = {
  start: Point,
  end: Point,
  color: string
}


type MessageType = {
  type: string,
  content: Line | string
}

type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'


type Message = {
  data: Point | Line
  
} 

type DrawAction = {
  type: string,
  start: Point, 
  end: Point | null,
  colorId: string,
  giftId: string
}

type DrawMessageData = {
  selfId: string,
  roomId: string,
  data: DrawAction
}