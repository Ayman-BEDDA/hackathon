import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import Header from '../components/Header';
import VideoStream from '../components/VideoStream';
import Chat from '../components/Chat';
import video from '../assets/speak.mp4';

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
                    createReport(finalTranscript);
                }
            };

            recognition.onerror = (event) => {
                console.error('Recognition error:', event.error);
            };

            recognitionRef.current = recognition;

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

        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    const leaveRoom = async () => {
        try {
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
            playVocalResponse(aiResponse);
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

            if (videoRef.current) {
                videoRef.current.play();
            }

            audio.onended = () => {
                console.log('Audio has ended');
                if (videoRef.current) {
                    videoRef.current.pause();
                }

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

    const createReport = async (message) => {
        console.log('Creating report:', message);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:3001/reports/${user.id}`, {
                message,
                roomId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 201) {
                console.log('Report created:', response.data);
            } else {
                console.error('Error creating report:', response.data);
            }
        } catch (error) {
            console.error('Error creating report:', error);
        }
    };

    return (
        <div className="bg-orange-50 flex flex-col items-center p-4 justify-between">
            <Header room={room} user={user} leaveRoom={leaveRoom} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                <VideoStream
                    cameraEnabled={cameraEnabled}
                    toggleCamera={toggleCamera}
                    capture={capture}
                    streaming={streaming}
                    toggleStreaming={toggleStreaming}
                    loadingImage={loadingImage}
                    imageSrc={imageSrc}
                    videoRef={videoRef}
                    webcamRef={webcamRef}
                    video={video}
                />
                <Chat
                    messages={messages}
                    loadingRoom={loadingRoom}
                    loadingMessages={loadingMessages}
                    loadingAudio={loadingAudio}
                    audioUrl={audioUrl}
                    messagesEndRef={messagesEndRef}
                    imageSrc={imageSrc}
                    cameraEnabled={cameraEnabled}
                />
            </div>
        </div>
    );
}

export default Room;
