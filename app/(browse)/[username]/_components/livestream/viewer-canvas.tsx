"use client"
import { useState, useEffect, useRef, startTransition } from "react"
import { socket } from "@/lib/socket-service"
import { Color as DrawColor, DrawingStep, GiftType, Background } from "@prisma/client"
import { drawSplash, drawCloud, drawLine, clearCanvas, setCanvasBackground } from "@/lib/draw-utils"
import { getPreviousSteps } from "@/actions/draw"
import { mousePositionInCanvas } from "@/lib/draw-utils"


interface ViewerCanvasProps {
  liveId: string,
  viewerId: string,
  colors: DrawColor[],
  gifts: GiftType[],
  backgrounds: Background[],
  backgroundId: number | null
}

export const ViewerCanvas = ({
  liveId,
  viewerId,
  colors,
  gifts,
  backgrounds,
  backgroundId
}: ViewerCanvasProps) => {
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ isLoading, setIsLoading ] = useState(true)
  const [ newStepQueue, setNewStepQueue ] = useState<DrawingStep[]>([])

  const [ allowedGift, setAllowedGift ] = useState<GiftType | null>(null)

  const start = useRef<null | Point>(null)

  // SET BACKGROUND
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    clearCanvas(ctx, canvas.width, canvas.height)
    const tempBackground = backgrounds.find((background) => background.id == backgroundId)
    if (!tempBackground) return
    setCanvasBackground(ctx, tempBackground.imageUrl)
  }, [backgroundId]);

  // LOAD ALL PREVIOUS STEPS
  useEffect(() => {
    const loadCanvas = async () => {
      try {
        const steps = await getPreviousSteps(liveId)

        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return

        steps.forEach((step) => {
          const tempColor = colors.find((color) => color.id == step.colorId)
          if (!tempColor?.name) return
          const tempGift = gifts.find((gift) => gift.id == step.giftTypeId)
          if (!tempGift?.drawType) return
          console.log(step)

          if (tempGift.drawType == "splash") {
            drawSplash({ x: step.startX, y: step.startY }, ctx, tempColor.name)
          }

          if (tempGift.drawType == "cloud") {
            drawCloud({ x: step.startX, y: step.startY }, ctx, tempColor.name)
          }

          if (tempGift.drawType == "line") {
            if (!step.endX || !step.endY) return
            drawLine({ start: { x: step.startX, y: step.startY }, end: { x: step.endX, y: step.endY }, ctx, color: tempColor.name })
          }
        })
      } catch {
        console.log('cannot get previous steps')
      }
    }

    loadCanvas()
  }, []);


  // LISTEN FOR HOST DRAW
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    socket.on('draw', (data) => {
      
      console.log('Receive message, drawing data', data)

      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      const tempColor = colors.find((color) => color.id == data.colorId)
      if (!tempColor?.name) return
      const tempGift = gifts.find((gift) => gift.id == data.giftId)
      if (!tempGift?.drawType) return

      if (data.type == "splash") {
        drawSplash(data.start, ctx, tempColor.name)
      }

      if (data.type == "cloud") {
        drawCloud(data.start, ctx, tempColor.name)
      }

      if (data.type == "line") {
        drawLine({ start: data.start, end: data.end, ctx, color: tempColor.name })
      }
      
    })

    return () => {
      socket.off('draw')
    }
  }, [isLoading]);


  // LISTEN FOR SET BACKGROUND
  useEffect(() => {
    socket.on('set-background', (data) => {
      console.log('set background')
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      clearCanvas(ctx, canvas.width, canvas.height)
      const tempBackground = backgrounds.find((background) => background.id == data.backgroundId)
      if (!tempBackground) return
      setCanvasBackground(ctx, tempBackground.imageUrl)
      
    })

    return () => {
      socket.off('set-background')
    }
  }, []);

  // LISTEN FOR ALLOW USER
  useEffect(() => {
    socket.on('user-allowed', (data) => {
      console.log('receive user-allowed')
      if (data.viewerId != viewerId) return

      const tempGift = gifts.find((gift) => gift.id == data.giftId) || null
      setAllowedGift(tempGift)
    })

    return () => {
      socket.off('user-allowed')
    }
  }, []);


  const mouseDownHandler = (e: MouseEvent) => {
    if (!allowedGift) return

    const currentPoint = mousePositionInCanvas(e, canvasRef)
    if (!currentPoint) return

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (allowedGift.drawType == "splash" || allowedGift.drawType == "cloud") {
      console.log('emitting guess draw')
      socket.emit('guest-draw', {roomId: liveId, viewerId: viewerId, data: { start: currentPoint, end: null, giftId: allowedGift.id }})
    } else {
      start.current = currentPoint
    }
  }

  const mouseUpHandler = (e: MouseEvent) => {
    const tempStart = start.current
    start.current = null
    if (!allowedGift) return

    const currentPoint = mousePositionInCanvas(e, canvasRef)
    if (!currentPoint) return

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (allowedGift.drawType == "line" && tempStart) {
      socket.emit('guest-draw', {roomId: liveId, viewerId: viewerId, data: { start: tempStart, end: currentPoint, giftId: allowedGift.id }})
    }
  }

  useEffect(() => {
    window.addEventListener('mouseup', mouseUpHandler)
    canvasRef.current?.addEventListener('mousedown', mouseDownHandler)

    return () => {
      canvasRef.current?.removeEventListener('mousedown', mouseDownHandler)
      window.removeEventListener('mouseup', mouseUpHandler)
    }
  }, [allowedGift]);

  return (
    <canvas
      ref={canvasRef}
      height={1600}
      width={900}
      style={{ height: '100%', aspectRatio: "9/16"}}
    />
  )
}