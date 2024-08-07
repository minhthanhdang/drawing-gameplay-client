"use client"

import { Button } from "@/components/ui/button"
import { startTransition, useEffect, useRef, useState } from "react"

import { startLive, endLive, hostNewOffer } from "@/lib/peer-connection-service";
import { onStartLive, onEndLive } from "@/actions/connection";

import { Settings } from "lucide-react";
import { SettingsPage } from "./settings";
import { DrawingGame } from "./drawing-game";
import { cn } from "@/lib/utils";
import { GiftType, Color as DrawColor, Background } from "@prisma/client";
import { announceStartLive } from "@/lib/socket-service";
import { socket } from "@/lib/socket-service";


const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

interface LiveStreamProps {
  userId: string,
  gifts: GiftType[],
  colors: DrawColor[],
  backgrounds: Background[]
}

export const LiveStream = ({
  userId,
  gifts,
  colors,
  backgrounds
}: LiveStreamProps) => {

  const [ liveStream, setLiveStream ] = useState<MediaStream | null>(null)

  const [ isLive, setIsLive ] = useState(false)
  const [ isPending, setIsPending ] = useState(false)
  const [ liveId, setLiveId ] = useState<string | null>(null)
  const [ pc, setPc ] = useState<RTCPeerConnection[] | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)

  const [ isSettingsOpen, setIsSettingsOpen ] = useState(false)
  const [ isDrawing, setIsDrawing ] = useState(false)
  const [ background, setBackground ] = useState<Background | null>(null)


  // HANDLE END LIVE
  useEffect(() =>{
    const handleBeforeUnload = () => {
      socket.emit('end-live', {userId, liveId})
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [])

  // ASK MEDIA PERMISSION
  useEffect(() => {

    if (liveStream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = liveStream;
    }

    const askStreamPermission = async () => {
      try {
        const tempLiveStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        if (tempLiveStream) {
          setLiveStream(tempLiveStream)
        }
      } catch (error) {
        setLiveStream(null)
      }
    }

    if (!liveStream){
      setIsLive(false)
      askStreamPermission()
    } 

    return () => {
      if (liveStream) {
        liveStream.getTracks().forEach((track) => {
          track.stop()
        })
      }    
    }

  }, [liveStream])


  const onStart = () => {
    if (!liveStream) return

    startTransition(() => {
      setIsPending(true)
      startLive(userId)
        .then((data) => {
          if (!data || !data.id) return
          announceStartLive(data.id, userId)
          setIsLive(true)
          console.log('setting liveId', data.id)
          setLiveId(data.id)
        })
        .catch(() => {
          console.log("Can't start live")
        })
      setIsPending(false)
    })
  }

  const onEnd = () => {
    if (!pc || !liveId) return 
    startTransition(() => {
      setIsPending(true)
      endLive(userId, liveId, pc)
        .then(() => {
          onEndLive(userId)
            .then(() => {
              setIsLive(false)
              setLiveId(null)
            })
            .catch(() => {
              console.log("Can't end live")
            })
        })
        .catch(() => {
          console.log("Can't end live")
        })
      setIsPending(false)
    })
  }

  // HOST NEW VIEWER
  useEffect(() => {
    socket.on('new-viewer', (data) => {
      console.log('receive new-viewer')

      if (!liveStream) return
      const tempPc = new RTCPeerConnection(servers);
      liveStream.getTracks().forEach((track) => {
        tempPc!.addTrack(track, liveStream);
      });
      
      console.log('whats wrong')
      if (!liveId) return
      console.log('whats wrong')

      startTransition(() => {
        console.log(data)
        hostNewOffer(tempPc, liveId, data.viewerId)
          .then(() => {
            if (pc) {
              setPc([...pc, tempPc])
            } else {
              setPc([tempPc])
            }
            socket.emit('pc-connection-ready', {viewerId: data.viewerId, liveId: liveId, userId})
          })
          .catch(() => {
            console.log("Can't host new offer")
          })
      }) 
    })

    return () => {
      socket.off('new-viewer')
    }

  }, [liveStream, pc, liveId]);


  const onStartDrawing = () => {
    if (!liveId) return
    socket.emit('start-draw', {userId, liveId})
    setIsSettingsOpen(false); 
    setIsDrawing(true)
  }

  const onChooseBackground = (background: Background) => {
    setIsSettingsOpen(false)
    socket.emit('set-background', {hostId: userId, liveId, backgroundId: background.id})
  }

  useEffect(() => {
    socket.on('set-background', (data) => {
      const tempBackground = backgrounds.find((background) => background.id == data.backgroundId)
      if (tempBackground) {
        setBackground(tempBackground)
      }
    })

    return () => {
      socket.off('set-background')
    }
  }, []);

  return (
    <div>
      <div className="relative aspect-[9/16] h-full flex items-center justify-center border-black border-2 rounded-[48px] overflow-hidden min-w-[400px] ">

        {liveStream
          ? <div
              className={cn(
                isDrawing 
                  ? "absolute top-6 right-9  aspect-[9/16] w-[100px] z-20 rounded-3xl overflow-hidden" 
                  : "absolute w-full h-full" 
              )}
            >
              <video 
                ref={videoRef} autoPlay playsInline muted
                className="w-full h-full object-cover"
              />
            </div>
           
          
          : <div className="absolute text-[24px]">
              No access to camera and microphone!
            </div>
        }

        {liveStream && !isSettingsOpen && (
          <div className="absolute left-4 top-4 flex z-40 "> 
            <Button onClick={()=>{setIsSettingsOpen(true)}}>
              <Settings />
            </Button>
          </div>
        )}

        {isSettingsOpen && (
          <div className="absolute top-0 left-0 h-full w-full rounded-3xl z-40">
            <SettingsPage 
              isLive={isLive}
              isDrawing={isDrawing}
              isPending={isPending}
              onStartLive={onStart}
              onEndLive={onEnd}
              onStartGame={onStartDrawing}
              onEndGame={() => {setIsDrawing(false); setIsSettingsOpen(false)}}
              onCloseSettings={() => {setIsSettingsOpen(false)}}
              backgrounds={backgrounds}
              setBackground={(background) => {onChooseBackground(background)}}
            />
          </div>
        )}

        {isDrawing && liveId && (
          <div className="absolute top-0 left-0 w-full h-full">
            <DrawingGame gifts={gifts} colors={colors} roomId={liveId} background={background}/>
          </div>
            
        )}


      </div>
    </div>
  )
}