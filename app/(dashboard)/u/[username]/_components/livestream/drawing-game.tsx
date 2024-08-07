"use client"

import { useEffect, useRef, useState, startTransition } from 'react'
import { GiftType, Color as DrawColor, Background } from '@prisma/client'

import { clearCanvas, drawCloud, drawLine, drawSplash, mousePositionInCanvas, setCanvasBackground } from '@/lib/draw-utils'
import { socket, announceHostDraw } from '@/lib/socket-service'
import { onDraw, onStartNewRoom } from '@/actions/draw'

import { ColorPicker } from './color-picker'
import { BrushPanel } from './brush-panel'


interface DrawingGameProps {
  gifts: GiftType[],
  colors: DrawColor[],
  roomId: string,
  background: Background | null
}

export const DrawingGame = ({
  gifts,
  colors,
  roomId,
  background
}: DrawingGameProps) => {

  const [ giftQueue, setGiftQueue ] = useState<any>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [ color, setColor ] = useState(colors[0])
  const  [ gift, setGift ] = useState<GiftType | null>(gifts[0])

  const start = useRef<null | Point>(null)

  const step = useRef(0)
  const [ prevBackground, setPrevBackground ] = useState<Background | null>(null)


  // RESTART LIVE
  useEffect(() => {
    const deleteSteps = async () => {
      try {
        await onStartNewRoom(roomId)
      } catch {
        console.log('cannot delete steps')
      }
    }

    deleteSteps()
    step.current = 0
    
  }, [])
  
  // HANDLE DRAWING POINTS
  const mouseDownHandler = (e: MouseEvent) => {

    const currentPoint = mousePositionInCanvas(e, canvasRef)
    if (!currentPoint) return

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    
    if (gift?.drawType == "splash" || gift?.drawType == "cloud") {

      announceHostDraw({roomId: roomId, selfId: "",  data: { type: gift?.drawType,start: currentPoint, end: null, colorId: color.id, giftId: gift.id }})
      
    } else {
      start.current = currentPoint
    }

  }

  const mouseUpHandler = (e: MouseEvent) => {

    console.log("drawing", gift?.drawType)
    const currentPoint = mousePositionInCanvas(e, canvasRef)

    
    if (!currentPoint) {
      start.current = null
      return
    }

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) {
      start.current = null
      return
    }
    if (!start.current) return
    if (gift?.drawType == "line") {
      
      announceHostDraw({roomId: roomId, selfId: "", data: { type: gift?.drawType, start: start.current, end: currentPoint, colorId: color.id, giftId: gift.id }})
      start.current = null
    } 
  }

  useEffect(() => {
    window.addEventListener('mouseup', mouseUpHandler)
    canvasRef.current?.addEventListener('mousedown', mouseDownHandler)

    return () => {
      canvasRef.current?.removeEventListener('mousedown', mouseDownHandler)
      window.removeEventListener('mouseup', mouseUpHandler)
    }
  }, [gift, color])

  // RECEIVE GIFT
  useEffect(() => {
    socket.on('send-gift', (data) => {
      setGiftQueue([...giftQueue, data])
      console.log(giftQueue)
    })
    return () => {
      socket.off('send-gift')
    }
  }, [giftQueue])


  // HANDLE DRAW GIFT
  useEffect(() => {
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
      
      startTransition(() => {
        onDraw(roomId, data.start, data.end, step.current, tempColor.id, tempGift!.id)
          .then(() => {
            console.log("insert step success")
            step.current++
          })
          .catch(() => {console.log('cannot insert step')})
      })
      
    })

    return () => {
      socket.off('draw')
    }
  }, [])


  // HANDLE BACKGROUND CHANGE
  useEffect(() => {
    if (!background) {
      if (!prevBackground) return
      else {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return
        clearCanvas(ctx, canvas.width, canvas.height)
      }
    } else {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      clearCanvas(ctx, canvas.width, canvas.height)
      setCanvasBackground(ctx, background.imageUrl)
    }
  }, [background])


  // ALLOW NEXT VIEWER TO DRAW
  const onAllowViewer = () => {
    if (giftQueue.length == 0) return

    socket.emit('allow-user', {roomId: roomId, viewerId: giftQueue[0].viewerId, giftId: giftQueue[0].giftId})
  }


  // HANDLE GUEST DRAW
  useEffect(() => {
    socket.on('guest-draw', (data) => {
      const drawData = data.data
      if (!data.viewerId) return 
      if (data.viewerId != giftQueue[0].viewerId) return
      console.log('guest drawing')
      console.log(data)

      const tempGift = gifts.find((gift) => gift.id == drawData.giftId)
      if (!tempGift) return

      if (tempGift.drawType == "splash") {
        announceHostDraw({roomId: roomId, selfId: "", data: { type: "splash", start: drawData.start, end: null, colorId: color.id, giftId: drawData.giftId }})
      }

      if (tempGift.drawType == "cloud") {
        announceHostDraw({roomId: roomId, selfId: "", data: { type: "cloud", start: drawData.start, end: null, colorId: color.id, giftId: drawData.giftId }})
      }

      if (tempGift.drawType == "line") {
        announceHostDraw({roomId: roomId, selfId: "", data: { type: "line", start: drawData.start, end: drawData.end, colorId: color.id, giftId: drawData.giftId }})
      }

      const tempGiftQueue = [...giftQueue].slice(1)
      setGiftQueue(tempGiftQueue)

      startTransition(() => {
        onDraw(roomId, drawData.start, drawData.end, step.current, color.id, drawData.giftId)
          .then(() => {
            console.log("insert step success")
            step.current++
          })
          .catch(() => {console.log('cannot insert step')})
      })
      
    })

    return () => {
      socket.off('guest-draw')
    }
  }, [color, giftQueue]);

  return (
    <div className='h-full w-full flex flex-col items-center'>
      <canvas
        ref={canvasRef}
        height={1600}
        width={900}
        style={{ height: '100%', aspectRatio: "9/16"}}
      />

      <div className='absolute bottom-4 left-4 w-full'>
        <div className='relative w-full h-full z-20'>
          <BrushPanel gifts={gifts} selfId={""} onChange={(e: GiftType)=>{console.log("setting to ", e.drawType); setGift(e)}}/>
        </div>
      </div>

      <div className='absolute bottom-24 left-4 w-[64px] flex flex-col items-center'>
        <ColorPicker colors={colors} changeColor={(color)=>{setColor(color)}}/>
      </div>

      {giftQueue && (
        <div className='absolute right-4 bottom-24 bg-black rounded-3xl p-4'>
          <button onClick={onAllowViewer} className='text-white text-[24px]'>
            Allow
          </button>
        </div>
      )}

    </div>
  )
}