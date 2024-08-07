
import firebase from "firebase/compat/app";
import 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, onSnapshot, addDoc, getDocs, deleteDoc, updateDoc, getDoc, and } from 'firebase/firestore';


// setup firestore and peer connection
const firebaseConfig = {
  apiKey: "AIzaSyAOdassfF7mYZHhUEjuWTcImvGHNKQQfAA",
  authDomain: "drawing-app-f9da6.firebaseapp.com",
  projectId: "drawing-app-f9da6",
  storageBucket: "drawing-app-f9da6.appspot.com",
  messagingSenderId: "633658089773",
  appId: "1:633658089773:web:7aa54417dadeba330433a4",
  measurementId: "G-FQ6P6N0BTE"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);


// HOST START LIVE
export const startLive = async (userId: string) => {

  const roomDoc = doc(collection(firestore, "calls"));
  console.log("roomRef", roomDoc)

  console.log("imhere")
  const viewerRef = doc(roomDoc, "viewers", userId)

  
  if (!viewerRef) return
  await setDoc(viewerRef, { 
    offerCandidates: [],
    answerCandidates: []
  })


  /*
  const offerCandidates = collection(callDoc, 'offerCandidates');
  const answerCandidates = collection(callDoc, 'answerCandidates');

  pc.onicecandidate = (event) => {
    console.log('is this bugging')
    event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
  };

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await setDoc(callDoc, { offer });

  onSnapshot(callDoc, (snapshot) => {
    const data = snapshot.data();
    
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
  */

  console.log(roomDoc.id)
  return {id: roomDoc.id};

}


// HOST END LIVE
export const endLive = async (userId: string, liveId: string | null, pcs: RTCPeerConnection[]) => {
  pcs.forEach((pc) => {
    pc.close();
  });

  if (liveId) {

    const callDoc = doc(collection(firestore, 'calls'), liveId);

    const answerCandidates = collection(callDoc, 'answerCandidates')
    const answerCandidatesDoc = await getDocs(answerCandidates)
    answerCandidatesDoc.forEach((doc) => {
      deleteDoc(doc.ref);
    });

    
    const offerCandidates = collection(callDoc, 'offerCandidates')
    const offerCandidatesDoc = await getDocs(offerCandidates)
    offerCandidatesDoc.forEach((doc) => {
      deleteDoc(doc.ref);
    });

    await deleteDoc(callDoc);

  }
}


export const hostNewOffer = async (pc: RTCPeerConnection, liveId: string, viewerId: string) => {
  
  const roomRef = doc(firestore, "calls", liveId);
  const viewerDoc = doc(roomRef, "viewers", viewerId)
  await setDoc(viewerDoc, { 
    offerCandidates: [],
    answerCandidates: []
  })
 
  if (!viewerDoc) return
  const offerCandidates = collection(viewerDoc, 'offerCandidates');
  const answerCandidates = collection(viewerDoc, 'answerCandidates');
  console.log('hosting new offer')
  
  pc.onicecandidate = (event) => {
    event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
  };

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await setDoc(viewerDoc, { offer });

  onSnapshot(viewerDoc, (snapshot) => {
    const data = snapshot.data();
    
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
}

/* VIEWER JOIN LIVE
export const joinLive = async (liveId: string, pc: RTCPeerConnection, stream: MediaStream) => {
  

  const callDoc = doc(collection(firestore, 'calls'), liveId)
  const answerCandidates = collection(callDoc, 'answerCandidates')
  const offerCandidates = collection(callDoc, 'offerCandidates')
  

  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      stream.addTrack(track);
    });
  };

  pc.onicecandidate = (event) => {
    event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
  };

  const callDocSnapshot = await getDoc(callDoc);
  const callData = callDocSnapshot.data();

  const offerDescription = callData?.offer;
  

  if (!offerDescription) throw new Error("Offer not found");

  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await updateDoc(callDoc, { answer });

  onSnapshot(offerCandidates, (snapshot) => {
    console.log(snapshot.docChanges())
    snapshot.docChanges().forEach((change) => {
      console.log(change.type);
      if (change.type === 'added') {
        let data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });

  console.log("this is liveId", liveId)

}*/

export const joinLive = async (liveId: string, viewerId: string, pc: RTCPeerConnection, stream: MediaStream) => {
  
  console.log("trying to join live")
  const roomDoc = doc(firestore, "calls", liveId);
  const viewerDoc = doc(roomDoc, "viewers", viewerId);
  const offerCandidates = collection(viewerDoc, 'offerCandidates');
  const answerCandidates = collection(viewerDoc, 'answerCandidates');

  
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      stream.addTrack(track);
    });
  };

  pc.onicecandidate = (event) => {
    event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
  };

  const callDocSnapshot = await getDoc(viewerDoc);
  const callData = callDocSnapshot.data();

  const offerDescription = callData?.offer;
  
  if (!offerDescription) throw new Error("Offer not found");

  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await updateDoc(viewerDoc, { answer });

  onSnapshot(offerCandidates, (snapshot) => {
    console.log(snapshot.docChanges())
    snapshot.docChanges().forEach((change) => {
      console.log(change.type);
      if (change.type === 'added') {
        let data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });

  console.log("this is liveId", liveId)
  return {liveId}

}

export const exitLive = async (pc: RTCPeerConnection, liveId: string) => {
  pc.close();
  console.log('exiting live')

  if (liveId) {
    const callDoc = doc(collection(firestore, 'calls'), liveId);

  }
}
