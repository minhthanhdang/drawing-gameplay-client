


type DrawRainbowProps = {
  start: Point,
  end: Point,
  ctx: CanvasRenderingContext2D | null,
  color?: string
}

type AllColors = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'


export const drawLine = ({
  start,
  end,
  ctx,
  color = 'red'
}: DrawRainbowProps) => {
  if (!ctx) return

  const colors = {
    "red": [
      "rgba(255, 0, 0, 0.1)",
      "rgba(250, 20, 20, 0.15)",
      "rgba(245, 40, 40, 0.2)",
      "rgba(240, 60, 60, 0.25)",
      "rgba(235, 80, 80, 0.3)"
    ],
    "orange":[
      "rgba(255, 165, 0, 0.2)",
      "rgba(250, 160, 20, 0.2)",
      "rgba(245, 155, 40, 0.2)",
      "rgba(240, 150, 60, 0.2)",
      "rgba(235, 145, 80, 0.2)"
    ],
    "yellow": [
      "rgba(255, 255, 0, 0.2)",
      "rgba(250, 250, 20, 0.2)",
      "rgba(245, 245, 40, 0.2)",
      "rgba(240, 240, 60, 0.2)",
      "rgba(235, 235, 80, 0.2)"
    ],
    "green": [
      "rgba(0, 128, 0, 0.2)",
      "rgba(20, 123, 20, 0.2)",
      "rgba(40, 118, 40, 0.2)",
      "rgba(60, 113, 60, 0.2)",
      "rgba(80, 108, 80, 0.2)"
    ],
    "blue": [
      "rgba(39,42,254,0.2)",
      "rgba(39,42,254,0.24)",
      "rgba(39,42,254,0.28)",
      "rgba(39,42,254,0.32)",
      "rgba(39,42,254,0.36)"
    ],
    "purple": [
      "rgba(238, 130, 238, 0.2)",
      "rgba(218, 110, 218, 0.2)",
      "rgba(198, 90, 198, 0.2)",
      "rgba(178, 70, 178, 0.2)",
      "rgba(158, 50, 158, 0.2)"
    ]
  }

  const convertColor = color as AllColors

  const chosenColors = colors[convertColor]

  const gap = 21
  
  let x1, y1, x2, y2
  x1 = start.x
    y1 = start.y
    x2 = end.x
    y2 = end.y

  const a = Math.atan2(y2 - y1, x2 - x1)
  const delta_x = gap * -Math.sin(a)
  const delta_y = gap * Math.cos(a)
  
  const stroke = (
    ctx: CanvasRenderingContext2D, 
    startX: number, 
    startY: number, 
    endX: number,
    endY: number, 
    color: string
  ) => {
    ctx.beginPath();
    ctx.lineWidth = 20;
    ctx.strokeStyle = color;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  if (!chosenColors) return
  for (let i = 0; i < 5; i++) {
    stroke(ctx, x1 + i*delta_x, y1 + i*delta_y,  x2 + i*delta_x, y2 + i*delta_y , chosenColors[i])
  }

}

export const drawSplash = (
  point: Point,
  ctx: CanvasRenderingContext2D | null,
  color = 'red'
) => {
  if (!ctx) return

  const image = new Image(80, 80)

  image.src = "/"+color+"-splash-2.png"

  image.onload = () => {
    ctx?.drawImage(image, point.x - 80, point.y - 80)
  }
}

export const mousePositionInCanvas = (e: MouseEvent, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const canvas = canvasRef.current
  if (!canvas) return null

  const rect = canvas.getBoundingClientRect()

  const width = rect.right - rect.left
  const ratio = width / canvas.width 

  const x = (e.clientX - rect.left) / ratio
  const y = (e.clientY - rect.top) / ratio

  if (!x || !y) return null
  else

  return { x, y } as Point
}

export const drawCloud = (
  point: Point,
  ctx: CanvasRenderingContext2D | null,
  color = 'red'
) => {
  if (!ctx) return

  const image = new Image(80, 80)

  image.src = "/"+color+"-cloud.png"

  image.onload = () => {
    ctx?.drawImage(image, point.x - 80, point.y - 80)
  }
}

export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  ctx.clearRect(0, 0, width, height)
}

export const setCanvasBackground = (
  ctx: CanvasRenderingContext2D,
  imageUrl: string
) => {
  const image = new Image(900, 1600)
  image.src = imageUrl

  image.onload = () => {
    ctx.drawImage(image, 0, 0)
  }
}