// import React, { useEffect, useRef, useState } from 'react';
// import io from 'socket.io-client';
// import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneAlt } from 'react-icons/fa';

// const VideoCall: React.FC = () => {
//     const [isCallActive, setIsCallActive] = useState(false);
//     const [isError, setIsError] = useState(false);
//     const [isAudioMuted, setIsAudioMuted] = useState(false);
//     const [isVideoMuted, setIsVideoMuted] = useState(false);
//     const localVideoRef = useRef<HTMLVideoElement | null>(null);
//     const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
//     const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
//     const socketRef = useRef<Socket | null>(null);
//     const localStreamRef = useRef<MediaStream | null>(null);

//     useEffect(() => {
//         // Initialize socket connection
//         socketRef.current = io('http://localhost:5000', {
//             transports: ['websocket'],
//         });

//         // Set up the peer connection
//         const peerConnection = new RTCPeerConnection({
//             iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//         });

//         peerConnectionRef.current = peerConnection;

//         // Handle ICE candidates
//         peerConnection.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socketRef.current?.emit('ice-candidate', event.candidate);
//             }
//         };

//         // Handle remote stream
//         peerConnection.ontrack = (event) => {
//             if (remoteVideoRef.current) {
//                 remoteVideoRef.current.srcObject = event.streams[0];
//             }
//         };

//         // Handle incoming offer
//         socketRef.current.on('offer', async (offer: RTCSessionDescriptionInit) => {
//             await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//             const answer = await peerConnection.createAnswer();
//             await peerConnection.setLocalDescription(answer);
//             socketRef.current?.emit('answer', answer);
//         });

//         // Handle incoming answer
//         socketRef.current.on('answer', (answer: RTCSessionDescriptionInit) => {
//             peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//         });

//         // Handle incoming ICE candidates
//         socketRef.current.on('ice-candidate', (candidate: RTCIceCandidateInit) => {
//             peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//         });

//         return () => {
//             peerConnection.close();
//         };
//     }, []);

//     const startVideoCall = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 video: true,
//                 audio: true,
//             });

//             if (localVideoRef.current) {
//                 localVideoRef.current.srcObject = stream;
//             }

//             localStreamRef.current = stream;

//             // Add local tracks to the peer connection
//             stream.getTracks().forEach((track) => {
//                 peerConnectionRef.current?.addTrack(track, stream);
//             });

//             // Create an offer and send it to the signaling server
//             const offer = await peerConnectionRef.current?.createOffer();
//             if (offer && peerConnectionRef.current) {
//                 await peerConnectionRef.current.setLocalDescription(offer);
//                 socketRef.current?.emit('offer', offer);
//             } else {
//                 console.error('Peer connection is not initialized');
//             }

//             setIsCallActive(true);
//         } catch (error) {
//             console.error('Error starting video call:', error);
//             setIsError(true);
//         }
//     };

//     const endVideoCall = () => {
//         if (peerConnectionRef.current) {
//             peerConnectionRef.current.close();
//             setIsCallActive(false);
//         }
//         if (localVideoRef.current) {
//             localVideoRef.current.srcObject = null;
//         }
//         if (remoteVideoRef.current) {
//             remoteVideoRef.current.srcObject = null;
//         }
//     };

//     const toggleAudio = () => {
//         if (localStreamRef.current) {
//             localStreamRef.current.getAudioTracks().forEach((track) => {
//                 track.enabled = !track.enabled;
//             });
//             setIsAudioMuted(!isAudioMuted);
//         }
//     };

//     const toggleVideo = () => {

//         if (localStreamRef.current) {
//             localStreamRef.current.getVideoTracks().forEach((track) => {
//                 track.enabled = !track.enabled;
//             });
//             setIsVideoMuted(!isVideoMuted);
//             console.log(isVideoMuted);
//         }
//     };

//     return (
//         <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-10">
//             <h1 className="text-4xl font-semibold mb-8">WebRTC Video Call</h1>

//             {/* Error State */}
//             {isError && (
//                 <div className="bg-red-600 text-white p-4 rounded-lg mb-4 w-full max-w-lg">
//                     <p>Error starting the video call. Please check your camera/microphone permissions.</p>
//                 </div>
//             )}

//             {/* Video Layout */}
//             <div className="flex justify-center gap-4 mb-1 w-full">
//                 {/* Local Video */}
//                 <div className={`w-full max-w-2xl`}>
//                     <video
//                         ref={localVideoRef}
//                         autoPlay
//                         muted
//                         className="w-full h-5/6 rounded-lg shadow-lg border-0"
//                     />
     
//                 </div>

//                 {/* Remote Video */}
//                 {isCallActive && (
//                     <div className={`w-full max-w-2xl`}>
//                         <video
//                             ref={remoteVideoRef}
//                             autoPlay
//                             className="w-full h-5/6 rounded-lg shadow-lg border-0"
//                         />
                       
//                     </div>
//                 )}
//             </div>

//             {/* Call Control Buttons */}
//             <div className="flex justify-center space-x-6 mb-8">
//                 {!isCallActive && (
//                     <button
//                         className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-500 transition"
//                         onClick={startVideoCall}
//                     >
//                         Start Video Call
//                     </button>
//                 )}

//                 {isCallActive && (
//                     <>
//                         <button
//                             className={`px-6 py-3 ${isAudioMuted ? 'bg-red-600' : 'bg-yellow-600'} text-white rounded-full hover:${isAudioMuted ? 'bg-red-500' : 'bg-yellow-500'} transition`}
//                             onClick={toggleAudio}
//                         >
//                             {isAudioMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
//                         </button>

//                         <button
//                             className={`px-6 py-3 ${isVideoMuted ? 'bg-red-600' : 'bg-blue-600'} text-white rounded-full hover:${isVideoMuted ? 'bg-red-500' : 'bg-blue-500'} transition`}
//                             onClick={toggleVideo}
//                         >
//                             {isVideoMuted ? <FaVideoSlash /> : <FaVideo />}
//                         </button>

//                         <button
//                             className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-500 transition"
//                             onClick={endVideoCall}
//                         >
//                             <FaPhoneAlt />
//                         </button>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default VideoCall;



//                {/* <img
//   src="https://www.ihna.edu.au/blog/wp-content/uploads/2022/10/user-dummy.png"
//   alt="Dummy"
//   className="w-full aspect-[16/9] object-cover rounded-lg shadow-lg"
// /> */}

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneAlt, FaDesktop } from 'react-icons/fa';

const VideoCall: React.FC = () => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io('http://localhost:5000', {
            transports: ['websocket'],
        });

        // Set up the peer connection
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        peerConnectionRef.current = peerConnection;

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('ice-candidate', event.candidate);
            }
        };

        // Handle remote stream
        peerConnection.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Handle incoming offer
        socketRef.current.on('offer', async (offer: RTCSessionDescriptionInit) => {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socketRef.current?.emit('answer', answer);
        });

        // Handle incoming answer
        socketRef.current.on('answer', (answer: RTCSessionDescriptionInit) => {
            peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        // Handle incoming ICE candidates
        socketRef.current.on('ice-candidate', (candidate: RTCIceCandidateInit) => {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // Handle screen share start event
        socketRef.current?.on('screen-share-started', (data: { stream: MediaStream }) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = data.stream;
            }
        });

        return () => {
            peerConnection.close();
        };
    }, []);

    const startVideoCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            localStreamRef.current = stream;

            // Add local tracks to the peer connection
            stream.getTracks().forEach((track) => {
                peerConnectionRef.current?.addTrack(track, stream);
            });

            // Create an offer and send it to the signaling server
            const offer = await peerConnectionRef.current?.createOffer();
            if (offer && peerConnectionRef.current) {
                await peerConnectionRef.current.setLocalDescription(offer);
                socketRef.current?.emit('offer', offer);
            } else {
                console.error('Peer connection is not initialized');
            }

            setIsCallActive(true);
        } catch (error) {
            console.error('Error starting video call:', error);
            setIsError(true);
        }
    };

    const endVideoCall = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            setIsCallActive(false);
        }
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsAudioMuted(!isAudioMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsVideoMuted(!isVideoMuted);
        }
    };

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
            });

            // Add screen stream's tracks to the peer connection
            screenStream.getTracks().forEach((track) => {
                peerConnectionRef.current?.addTrack(track, screenStream);
            });

            // Update local video element to show screen share
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
            }

            // Send the screen share stream to the remote peer
            socketRef.current?.emit('screen-share-started', { stream: screenStream });

            setIsScreenSharing(true);
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    };

    const stopScreenShare = () => {
        if (localStreamRef.current) {
            // Stop screen share tracks and switch back to webcam
            localStreamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
            startVideoCall(); // Restart the video call with the webcam
            setIsScreenSharing(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-10">
            <h1 className="text-4xl font-semibold mb-8">WebRTC Video Call</h1>

            {/* Error State */}
            {isError && (
                <div className="bg-red-600 text-white p-4 rounded-lg mb-4 w-full max-w-lg">
                    <p>Error starting the video call. Please check your camera/microphone permissions.</p>
                </div>
            )}

            {/* Video Layout */}
            <div className="flex justify-center gap-4 mb-1 w-full">
                {/* Local Video */}
                <div className={`w-full max-w-2xl`}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className="w-full h-5/6 rounded-lg shadow-lg border-0"
                    />
                </div>

                {/* Remote Video */}
                {isCallActive && (
                    <div className={`w-full max-w-2xl`}>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            className="w-full h-5/6 rounded-lg shadow-lg border-0"
                        />
                    </div>
                )}
            </div>

            {/* Call Control Buttons */}
            <div className="flex justify-center space-x-6 mb-8">
                {!isCallActive && (
                    <button
                        className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-500 transition"
                        onClick={startVideoCall}
                    >
                        Start Video Call
                    </button>
                )}

                {isCallActive && (
                    <>
                        <button
                            className={`px-6 py-3 ${isAudioMuted ? 'bg-red-600' : 'bg-yellow-600'} text-white rounded-full hover:${isAudioMuted ? 'bg-red-500' : 'bg-yellow-500'} transition`}
                            onClick={toggleAudio}
                        >
                            {isAudioMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                        </button>

                        <button
                            className={`px-6 py-3 ${isVideoMuted ? 'bg-red-600' : 'bg-blue-600'} text-white rounded-full hover:${isVideoMuted ? 'bg-red-500' : 'bg-blue-500'} transition`}
                            onClick={toggleVideo}
                        >
                            {isVideoMuted ? <FaVideoSlash /> : <FaVideo />}
                        </button>

                        <button
                            className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-500 transition"
                            onClick={endVideoCall}
                        >
                            <FaPhoneAlt />
                        </button>

                        <button
                            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition"
                            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                        >
                            <FaDesktop /> {isScreenSharing }
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VideoCall;
