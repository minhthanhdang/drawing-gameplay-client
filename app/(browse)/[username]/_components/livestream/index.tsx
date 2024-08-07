"use client"


import { Background, GiftType } from "@prisma/client";

import { socket } from "@/lib/socket-service";
import { useState, useEffect, useRef } from "react";
import { joinLive, exitLive } from "@/lib/peer-connection-service";
import { startTransition } from "react";
import { announceJoinLive } from "@/lib/socket-service";

import { GiftPanel } from "./gift-panel";
import { ViewerCanvas } from "./viewer-canvas";
import { Color as DrawColor } from "@prisma/client";
import { cn } from "@/lib/utils";

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

interface LiveStreamProps {
  viewerId: string,
  hostId: string,
  gifts: GiftType[],
  colors: DrawColor[],
  backgrounds: Background[]
}

export const LiveStream = ({
  viewerId,
  hostId,
  gifts,
  colors,
  backgrounds
}: LiveStreamProps) => {

  const [ stream, setStream ] = useState<MediaStream | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const [ pc, setPc ] = useState<RTCPeerConnection | null>(null)
  const [ liveId, setLiveId ] = useState<string | null>(null)
  const [ isDrawing, setIsDrawing ] = useState(false)
  const [ backgroundId, setBackgroundId ] = useState<number | null>(null)


  // TRY TO JOIN LIVE
  useEffect(() => {

    announceJoinLive(hostId, viewerId)

    socket.on('host-offline', () => {
      setLiveId(null)
      console.log('host is offline')
    })

    return () => {
      socket.off('host-offline')
    }

  }, [])


  // ANSWER OFFER
  useEffect(() => {
    socket.on('live-connection-ready', (data) => {
      console.log("trying to connect")
      if (data.viewerId !== viewerId) return
      const tempPc = new RTCPeerConnection(servers)
      const tempStream = new MediaStream()

      try {
        console.log('joining live')
        startTransition(() => {
          joinLive(data.liveId, viewerId, tempPc, tempStream)
            .then(() => {
              setLiveId(data.liveId)
              setStream(tempStream)
              setPc(tempPc)
              setIsDrawing(data.isDrawing)
              setBackgroundId(data.backgroundId)
            })
            .catch(()=> {
              console.log('error joining live')
            })
        })
      } catch {
        console.log('error loading live')
      }
    })

    return () => {
      socket.off('live-connection-ready')
      if (!pc || !liveId) return
      exitLive(pc, liveId)
      
    }
  }, [pc, stream, liveId]);


  // RELOAD PAGE WHEN LIVE STARTED
  useEffect(() => {
    console.log('whatt')
    socket.on('live-started', (data) => {
      console.log('live started')
      window.location.reload()
    })
    return () => {
      socket.off('live-started')
    }
  }, [])


  // SET STREAM TO VIDEO
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      console.log(stream.getTracks())
  
      videoRef.current.srcObject = stream
      console.log(videoRef.current.srcObject)
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop()
        })
      }    
    }
  }, [stream]);


  useEffect(() => {
    socket.on('start-draw', (data) => {
      setIsDrawing(true)
    })

    return () => {
      socket.off('start-draw')
    }
  }, []);

  if (!liveId) {
    return (
      <div className="flex items-center justify-center">
        <div className="font-semibold text-[24px]">
          User is offline
        </div>
      </div>
    )
  } else {
    return (
      <div className="aspect-[9/16] h-full w-full rounded-[48px] overflow-hidden flex border-2 border-black items-center justify-center">

        <div
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
        {isDrawing && (
          <div className="absolute top-0 left-0 w-full h-full">
            <ViewerCanvas liveId={liveId} viewerId={viewerId} colors={colors} gifts={gifts} backgrounds={backgrounds} backgroundId={backgroundId}/>
          </div>
        )}
      
        
        <div className="absolute bottom-6 left-0 w-full z-30">
          <div className="px-8">
            <GiftPanel gifts={gifts} liveId={liveId} selfId={viewerId} onChange={()=>{}}/>
          </div>
        </div>
      </div>
    )
  }

}