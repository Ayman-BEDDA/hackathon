import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faCamera } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import video from '../assets/speak.mp4';
import Webcam from 'react-webcam';
import { TailSpin } from 'react-loader-spinner';

const socket = io('http://localhost:3001');

function Room() {
    const user = jwtDecode(localStorage.getItem('token'));
    const navigate = useNavigate();
    const location = useLocation();
    const { id: roomId } = useParams();
    const [streaming, setStreaming] = useState(location.state?.isMicrophoneOn || false);
    const [room, setRoom] = useState(null);
    const [loadingRoom, setLoadingRoom] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);
    const [loadingAudio, setLoadingAudio] = useState(false);
    const videoRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [audioUrl, setAudioUrl] = useState(null);
    const [transcriptions, setTranscriptions] = useState([]);
    const recognitionRef = useRef(null);
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const verifierSalle = async () => {
            try {
                const response = await fetch(`http://localhost:3001/rooms/${roomId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();
                setRoom(data);
                if (data.error) {
                    navigate('/');
                }
                setLoadingRoom(false);
            } catch (error) {
                console.error('Erreur:', error);
                navigate('/');
            }
        };

        verifierSalle();
    }, [roomId, navigate]);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("Web Speech API not supported in this browser.");
        } else {
            const recognition = new window.webkitSpeechRecognition();
            recognition.lang = 'fr-FR';
            recognition.continuous = true;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setLoadingMessages(true);
                    setLoadingAudio(true);
                    recognition.stop();
                    socket.emit('audioMessage', finalTranscript);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { role: 'user', content: finalTranscript }
                    ]);
                }
            };

            recognition.onerror = (event) => {
                console.error('Recognition error:', event.error);
            };

            recognitionRef.current = recognition;

            // Start recognition if streaming is initially true
            if (streaming) {
                recognition.start();
            }
        }
    }, [streaming]);

    useEffect(() => {
        socket.on('chatResponse', (response) => {
            setLoadingMessages(false);
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: response }]);
            playVocalResponse(response);
        });

        return () => {
            socket.off('chatResponse');
        };
    }, []);

    useEffect(() => {
        socket.on('transcriptionResult', (transcription) => {
            setMessages(prevMessages => [...prevMessages, { role: 'user', content: transcription }]);
        });
    }, []);

    useEffect(() => {
        const videoElement = videoRef.current;

        if (videoElement) {
            videoElement.addEventListener('ended', handleVideoEnded);
        }

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('ended', handleVideoEnded);
            }
        };
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleVideoEnded = () => {
        console.log('Video has ended');
        // Pause the video when it ends
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    const leaveRoom = async () => {
        try {
            await fetch(`http://localhost:3001/rooms/${roomId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            navigate('/');
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const toggleStreaming = () => {
        const recognition = recognitionRef.current;
        if (!streaming) {
            recognition.start();
        } else {
            recognition.stop();
        }
        setStreaming(!streaming);
    };

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);

        // Convert data URL to Blob
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
                uploadImage(file);
            });
    };

    const uploadImage = async (image) => {
        setLoadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', image);

            const response = await axios.post('http://localhost:3001/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const aiResponse = response.data.response;
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: aiResponse }]);
            setLoadingImage(false);
        } catch (error) {
            console.error('Error uploading image:', error);
            setLoadingImage(false);
        }
    };

    const playVocalResponse = async (message) => {
        console.log('Playing vocal response:', message);
        try {
            const response = await axios.post('http://localhost:3001/response-vocal', { text: message }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/wav' }));

            const audio = new Audio(url);

            await audio.play();

            // Play the video when the audio starts
            if (videoRef.current) {
                videoRef.current.play();
            }

            audio.onended = () => {
                console.log('Audio has ended');
                // Pause the video when the audio ends
                if (videoRef.current) {
                    videoRef.current.pause();
                }

                // Restart recognition
                const recognition = recognitionRef.current;
                recognition.start();
                setStreaming(true);
            };
            setLoadingAudio(false);
            setAudioUrl(url);
        } catch (error) {
            console.error('Error getting vocal response:', error);
            setAudioUrl(null);
        }
    };

    const toggleCamera = () => {
        setCameraEnabled(!cameraEnabled);
    };

    return (
        <div className="bg-orange-50 flex flex-col items-center p-4 justify-between">
            <header className="mb-8 w-full flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
                <div className="flex flex-col">
                    <p className="text-sm font-bold text-orange-600">Salle ID : {room?.id}</p>
                    <p className="text-sm font-bold text-orange-600">Patient : <span className="text-orange-600">{user.name} {user.surname}</span></p>
                </div>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-md transition duration-300 hover:bg-orange-600" onClick={leaveRoom}>
                    Quitter la salle
                </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md justify-between">
                    {cameraEnabled ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full rounded mt-4"
                        />
                    ) : (
                        <div className="w-full max-w-lg mx-auto">
                            <video ref={videoRef} src={video} className="w-full rounded-lg"/>
                        </div>
                    )}
                    <div className="flex items-center mt-8 gap-4">
                        <button
                            className={`bg-orange-500 text-white px-8 py-4 rounded-full shadow-md transition duration-300 flex items-center ${streaming ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-orange-600'} animate-pulse`}
                            onClick={toggleStreaming}
                        >
                            <FontAwesomeIcon icon={streaming ? faMicrophone : faMicrophoneSlash} className="mr-2" />
                        </button>
                        <button
                            className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-md transition duration-300 hover:bg-orange-600"
                            onClick={toggleCamera}
                        >
                            <FontAwesomeIcon icon={cameraEnabled ? faCamera : faCamera} className="mr-2" />
                            {cameraEnabled ? 'Désactiver la caméra' : 'Activer la caméra'}
                        </button>
                        {cameraEnabled && (
                            <button
                                className={`bg-green-500 text-white px-4 py-4 rounded-full shadow-md transition duration-300 hover:bg-green-600 ${loadingImage ? 'cursor-not-allowed' : ''}`}
                                onClick={capture}
                                disabled={loadingImage}
                            >
                                <FontAwesomeIcon icon={faCamera} className="mr-2" /> Capturer
                            </button>
                        )}
                    </div>
                    {loadingImage && (
                        <div className="flex items-center justify-center mt-4">
                            <TailSpin height={40} width={40} color="#FF4500" />
                            <p className="text-orange-500 ml-2">Analyse de l'image en cours...</p>
                        </div>
                    )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md h-full">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-lg font-bold text-orange-600 mb-4">Transcription</h2>
                        {imageSrc && cameraEnabled && (
                            <img src={imageSrc} alt="Captured" className="mt-4 rounded-lg w-40 h-32" />
                        )}
                    </div>
                    {loadingRoom ? (
                        <div className="flex items-center justify-center mt-4">
                            <TailSpin height={40} width={40} color="#FF4500" />
                        </div>
                    ) : (
                        <>
                            {messages.length === 0 ? (
                                <p className="text-gray-500">Les transcriptions apparaîtront ici. Parlez à l'assistant médical virtuel pour commencer.</p>
                            ) : (
                                <ul className="space-y-2 overflow-auto max-h-96">
                                    {messages.map((message, index) => (
                                        <li key={index} className={`flex items-center ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`p-4 rounded-lg ${message.role === 'assistant' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                {message.content}
                                            </div>
                                        </li>
                                    ))}
                                    {loadingMessages && (
                                    <div className="flex items-center justify-center mt-4">
                                        <TailSpin height={40} width={40} color="#FF4500" />
                                    </div>
                                )}
                                    <div ref={messagesEndRef} />
                                </ul>
                            )}
                        </>
                    )}
                    
                    {loadingAudio ? (
                        <div className="flex items-center justify-center mt-4">
                            <TailSpin height={40} width={40} color="#FF4500" />
                            <p className="text-orange-500 ml-2">Chargement de la réponse vocale en cours...</p>
                        </div>
                    ) : (
                        audioUrl && (
                            <audio src={audioUrl} controls className="mt-4 w-full" />
                        )
                    )}

                </div>
            </div>
        </div>
    );
}

export default Room;
