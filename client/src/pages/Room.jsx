import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Room() {
    const navigate = useNavigate();
    const { id: roomId } = useParams();
    const [streaming, setStreaming] = useState(false);
    const [room, setRoom] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [transcription, setTranscription] = useState('');

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
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        audioChunksRef.current.push(e.data);
                    }
                };
            })
            .catch(error => {
                console.error("Error accessing the microphone: ", error);
            });

        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        socket.on('transcriptionResult', (transcription) => {
            setTranscription(transcription);
        });
    }, []);

    const toggleStreaming = () => {
        const recorder = mediaRecorderRef.current;
        if (!streaming) {
            if (recorder) {
                audioChunksRef.current = [];
                recorder.start();
                setStreaming(true);
            }
        } else {
            if (recorder) {
                recorder.stop();
                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm; codecs=opus' });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        socket.emit('audioMessage', reader.result);
                    };
                    reader.readAsArrayBuffer(audioBlob);
                };
                setStreaming(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col items-center">
            <header className="text-center mb-8">
                <main className="flex flex-col items-center mb-20">
                    <h1 className="text-4xl font-bold text-orange-500">Salle {room?.id}</h1>
                </main>
            </header>
            <p className="text-xl text-black-700">
                {streaming ? 'En cours de streaming audio' : 'Cliquez sur le bouton ci-dessous pour commencer le streaming audio'}
            </p>
            <button className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-orange-600 transition duration-300 flex items-center transition duration-300 flex items-center animate-pulse" onClick={toggleStreaming}>
                <FontAwesomeIcon icon={faPhoneSlash} className="mr-2" />
                {streaming ? 'Arrêter le streaming audio' : 'Commencer le streaming audio'}
            </button>
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-orange-500">Transcription</h2>
                <p className="text-black-700">{transcription}</p>
            </div>
        </div>
    );
}

export default Room;