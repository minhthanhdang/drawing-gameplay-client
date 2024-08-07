import { io } from "socket.io-client";
export const socket = io("https://3.107.49.137:443")

export const announceStartLive = (roomId: string, userId: string) => {

  socket.emit("start-live", {roomId, userId})
}

export const announceEndLive = (roomId: string, userId: string) => {
  socket.emit("end-live", {roomId, userId})
}


export const announceJoinLive = (hostId: string, viewerId: string) => {
  socket.emit("join-live", {hostId, viewerId})
}



export const announceHostDraw = ({ 
  roomId, 
  selfId, 
  data
}: DrawMessageData) => {
  socket.emit("host-draw", {roomId, selfId, data})
}

export const announceAllowGuest = () => {
  
}

export const announceStartDraw = () => {

}


