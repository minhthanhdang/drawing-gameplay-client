import { Button } from "@/components/ui/button"
import { X, Palette, Disc } from "lucide-react"
import { BackgroundChoice } from "./background-choice"
import { Background } from "@prisma/client"

interface SettingsPageProps {
  isLive: boolean,
  isPending: boolean,
  isDrawing: boolean,
  onStartLive: () => void,
  onEndLive: () => void,
  onStartGame: () => void,
  onEndGame: () => void, 
  onCloseSettings: () => void,
  backgrounds: Background[],
  setBackground: (background: Background) => void
}

export const SettingsPage = ({
  isLive,
  isDrawing,
  isPending,
  onStartLive,
  onEndLive,
  onStartGame,
  onEndGame,
  onCloseSettings,
  backgrounds,
  setBackground
}: SettingsPageProps) => {

  return (
    <div className="w-full h-full bg-white rounded-3xl p-3 flex flex-col items-center overflow-y-scroll">
      <div className="w-full flex justify-end">
        <X onClick={onCloseSettings} strokeWidth={3}/>
      </div>
      <div className="w-full flex items-center justify-center text-[24px] font-semibold py-2 border-b-2">
        Settings
      </div>
      <div className="w-full h-[20px]"></div>

      <div className="w-full text-[16px] px-2 pt-2 flex gap-2 font-semibold">
        <Disc/>
        Live Stream
      </div>
      <div className="w-full ps-4">
        {isLive ? "You are currently live" : "You are offline, press to start LIVE!"}
      </div>
      <div className="w-full py-4 flex items-center justify-center">
      {isLive
        ? <Button 
            onClick={()=>{onCloseSettings(); onEndLive()}}
            disabled={isPending}
          >
            End Live
          </Button>
        : <Button 
            onClick={()=>{onCloseSettings(); onStartLive()}}
            disabled={isPending}
          >
            Start Live
          </Button>
      }
      </div>

      <div className="w-full text-[16px] px-2 flex gap-2 font-semibold">
        <Palette />
        Drawing Game
      </div>
      {isLive
        ? <>
            <div className="w-full ps-4">
              Press to start the drawing game
            </div>
            {isDrawing
              ? <>
                  <Button 
                    onClick={onEndGame} disabled={isPending}
                    className="my-2"
                  >
                    End Game
                  </Button>
                  <div>
                    Choose a background
                  </div>
                  <BackgroundChoice backgrounds={backgrounds} setBackground={setBackground}/>
                </>
              : <Button onClick={onStartGame} disabled={isPending}>
                  Start Game
                </Button>
            }
          </>
        : <div>
            You need to Live before playing game!
          </div>
      }
      
    </div>
  )
}