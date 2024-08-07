"use client"

import { cn } from "@/lib/utils"
import { GiftType } from "@prisma/client"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { socket } from "@/lib/socket-service"

interface GiftPanelProps {
  gifts: GiftType[],
  liveId: string,
  selfId: string,
  onChange: (gift: GiftType) => void
}

export const GiftPanel = ({ 
  gifts,
  liveId,
  selfId,
  onChange 
} :GiftPanelProps) => {

  const [ collapsed, setCollapsed ] = useState(false)

  const onSendGift = (giftId: string) => {
    socket.emit('send-gift', {giftId, selfId, liveId})
  }

  return (
    <div className={cn(
      "bg-gray-400 bg-opacity-30 py-2 transition-all duration-1000 h-[64px] ",
      collapsed ? "rounded-full w-[64px] flex items-center justify-center" : "rounded-3xl w-[90%]]"
    )}>
      {collapsed 
        ? <div 
          onClick={()=>{setCollapsed(false)}}><ChevronRight /></div> 
        : <div className="flex items-center justify-center gap-4 px-4 h-full">
          <div className="flex flex-grow items-center justify-start gap-4 px-4 h-full">
            {gifts.map((gift) => (
              <div 
                className="text-[24px] w-[48px] h-[48px] bg-white hover:bg-gray-200 flex items-center justify-center rounded-full"
                onClick={() => {onChange(gift);onSendGift(gift.id); }}
                key={gift.id}
              >
                <img className="relative w-[80%] h-[80%]" src={gift.imageUrl} />
              </div>
            ))}
          </div>
          <div 
            className="flex-[0]"
            onClick={()=>{setCollapsed(true)}}
          >
            <ChevronLeft />
          </div>
        </div>
      }
    </div>
  )
}