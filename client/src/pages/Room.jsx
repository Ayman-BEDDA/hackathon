import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faCamera } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import {  jwtDecode  } from 'jwt-decode';
import video from '../assets/speak.mp4';
import Webcam from 'react-webcam';

const socket = io('http://localhost:3001');

function Room() {
    const user = jwtDecode(localStorage.getItem('token'));
    const navigate = useNavigate();
    const location = useLocation();
    const { id: roomId } = useParams();
    const [streaming, setStreaming] = useState(location.state?.isMicrophoneOn || false);
    const [room, setRoom] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const videoRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [audioUrl, setAudioUrl] = useState(null);
    const [transcriptions, setTranscriptions] = useState([]);
    const recognitionRef = useRef(null);
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [cameraEnabled, setCameraEnabled] = useState(false);

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
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: response }]);
            playVocalResponse(response);
        });

        return () => {
            socket.off('chatResponse');
        };
    }, []);

    useEffect(() => {
        socket.on('transcriptionResult', (transcription) => {
            setTranscriptions(prevTranscriptions => [...prevTranscriptions, transcription]);
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

    const handleVideoEnded = () => {
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
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const playVocalResponse = async (message) => {
        console.log('Playing vocal response:', message);
        try {
            const response = await axios.post('http://localhost:3001/response-vocal', { text: message }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/wav' }));

            const audio = new Audio(url);

            await audio.play();

            if (videoRef.current) {
                videoRef.current.play();
            }

            audio.onended = () => {
                if (videoRef.current) {
                    videoRef.current.pause();
                }

                const recognition = recognitionRef.current;
                recognition.start();
                setStreaming(true);
            };
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
        <div className="bg-orange-50 flex flex-col items-center p-4">
            <header className="mb-8 w-full flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="text-sm font-bold text-orange-600">Salle ID : {room?.id}</p>
                    <p className="text-sm font-bold text-orange-600">Patient : <span className="text-orange-600">{user.name} {user.surname}</span></p>
                </div>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-md transition duration-300 hover:bg-orange-600" onClick={leaveRoom}>
                    Quitter la salle
                </button>
            </header>
            <div className="flex items-center w-full justify-center flex-col">
                <div className="flex flex-col items-center mb-12">
                    <p className="text-md text-gray-800 mb-4">
                        {streaming ? 'Une fois que vous avez terminé de parler, appuyez sur le bouton ci-dessous pour couper le micro' : 'Cliquez sur le bouton ci-dessous pour commencer à parler.'}
                    </p>
                    <button
                        className={`bg-orange-500 text-white px-8 py-4 rounded-full shadow-md transition duration-300 flex items-center ${streaming ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-orange-600'} animate-pulse`}
                        onClick={toggleStreaming}
                    >
                        <FontAwesomeIcon icon={streaming ? faMicrophone : faMicrophoneSlash} className="mr-2" />
                    </button>
                </div>
                <div className="mt-8 w-full max-w-lg mx-auto p-4 bg-white rounded shadow-md overflow-y-auto">
                    <h2 className="text-lg font-bold text-orange-600">Messages</h2>
                    <ul className="mt-4">
                        {messages.map((message, index) => (
                            <li key={index} className="mb-2">
                                <div className={`p-2 rounded ${message.role === 'user' ? 'bg-gray-200 text-black-700' : 'bg-orange-400 text-white'}`}>
                                    {message.content}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {audioUrl && (
                        <audio src={audioUrl} controls className="mt-4" />
                    )}
                </div>
                <div className="mt-8 w-full max-w-lg mx-auto p-4 bg-white rounded shadow-md overflow-y-auto">
                    <h2 className="text-lg font-bold text-orange-600">Prendre une photo</h2>
                    {cameraEnabled ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full rounded"
                        />
                    ) : (
                        <p className="text-gray-500">La caméra est désactivée.</p>
                    )}
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md transition duration-300 hover:bg-blue-600 mt-4"
                        onClick={toggleCamera}
                    >
                        <FontAwesomeIcon icon={cameraEnabled ? faCamera : faCamera} className="mr-2" />
                        {cameraEnabled ? 'Désactiver la caméra' : 'Activer la caméra'}
                    </button>
                    {cameraEnabled && (
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md transition duration-300 hover:bg-green-600 mt-4"
                            onClick={capture}
                        >
                            <FontAwesomeIcon icon={faCamera} className="mr-2" /> Capturer
                        </button>
                    )}
                    {imageSrc && cameraEnabled && (
                        <img src={imageSrc} alt="Captured" className="mt-4 rounded" />
                    )}
                </div>
            </div>
            <div className="mt-8 w-full max-w-lg mx-auto">
                <video ref={videoRef} src={video} className="w-full"/>
            </div>
        </div>
    );
}

export default Room;