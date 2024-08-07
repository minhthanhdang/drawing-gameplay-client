"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Color as DrawColor } from "@prisma/client"


interface ColorPickerProps {
  colors: DrawColor[],
  changeColor: (color: DrawColor) => void
}

export const ColorPicker = ({ 
  colors,
  changeColor
} :ColorPickerProps) => {

  const [ collapsed, setCollapsed ] = useState(false)

  return (
    <div className={cn(
      "bg-gray-400 bg-opacity-30 py-2 transition-all w-[64px] h-full",
      collapsed ? "rounded-full w-[64px] h-[64px] flex items-center justify-center" : "rounded-[48px] full"
    )}>
      {collapsed 
        ? <div 
          onClick={()=>{setCollapsed(false)}}><ChevronUp /></div> 
        : <div className="flex flex-col items-center justify-center gap-4 px-4">
            <div 
              className="flex-[0]"
              onClick={()=>{setCollapsed(true)}}
            >
              <ChevronDown />
            </div>
            <div className="flex flex-col-reverse flex-grow items-center justify-center gap-4 py-4">
              {colors.map((color) => (
                <div 
                  className="text-[24px] w-[48px] h-[48px] bg-white hover:bg-gray-200 flex items-center justify-center rounded-full"
                  onClick={() => changeColor(color)}
                  key={color.id}
                >
                  <img className="relative w-[80%] h-[80%]" src={color.imageUrl} />
                </div>
              ))}
            </div>
            
          </div>
      }
    </div>
  )
}