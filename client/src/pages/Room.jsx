import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Room() {
    const navigate = useNavigate();
    const { id: roomId } = useParams();
    const [streaming, setStreaming] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

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
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
    
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        socket.emit('audioMessage', reader.result); // Envoie les données sous forme de ArrayBuffer
                    };
                    reader.readAsArrayBuffer(e.data);
                }
            };
          })
          .catch(error => {
            console.error("Error accessing the microphone: ", error);
          });
      }, []);


      const toggleStreaming = () => {
        if (!streaming) {
          mediaRecorder.start(1000); // Collect 1-second chunks of audio
          setStreaming(true);
        } else {
          mediaRecorder.stop();
          setStreaming(false);
        }
      };


    return (
        <div className="min-h-screen bg-orange-50 flex flex-col items-center">
            <header className="text-center mb-8">
                <main className="flex flex-col items-center mb-20">
                    <h1 className="text-4xl font-bold text-orange-500">Room</h1>
                </main>
            </header>
            <main>
                <p className="text-xl text-black-700">
                    Content
                </p>
            </main>
            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-md flex justify-center">
            <button onClick={toggleStreaming}>
                {streaming ? 'Stop Streaming' : 'Start Streaming'}
            </button>
            </footer>
        </div>
    );
}

export default Room;
