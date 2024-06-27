import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

function WaitingRoom() {
    const navigate = useNavigate();
    const { id: roomId } = useParams();
    const [isMicrophoneOn, setIsMicrophoneOn] = useState(false);
    const mediaStreamRef = useRef(null);

    const toggleMicrophone = () => {
        if (isMicrophoneOn) {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            setIsMicrophoneOn(false);
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaStreamRef.current = stream;
                    setIsMicrophoneOn(true);
                })
                .catch(error => {
                    console.error("Error accessing the microphone: ", error);
                    setIsMicrophoneOn(false);
                });
        }
    };

    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleStart = () => {
        navigate(`/room/${roomId}`, { state: { isMicrophoneOn } });
    };

    return (
        <div className="container mx-auto mt-8">
            <div className="flex flex-col items-center">
                <h1 className="text-3xl font-bold mb-4">Salle d'attente</h1>
                <p className="text-lg mb-6">Vous allez être mis en relation avec l'assistant médical virtuel.</p>
                <div className="flex justify-center mb-4">
                    <button
                        className={`bg-${isMicrophoneOn ? 'red' : 'orange'}-500 text-white font-semibold py-2 px-4 rounded mr-2`}
                        onClick={toggleMicrophone}
                    >
                        <FontAwesomeIcon icon={isMicrophoneOn ? faMicrophoneSlash : faMicrophone} className="mr-2" />
                        {isMicrophoneOn ? 'Désactiver le micro' : 'Activer le micro'}
                    </button>
                    <button
                        className={`bg-green-500 text-white font-semibold py-2 px-4 rounded mr-2`}
                        onClick={handleStart}
                    >
                        Rejoindre la salle
                    </button>
                    <button
                        className="bg-red-500 text-white font-semibold py-2 px-4 rounded"
                        onClick={() => navigate('/')}
                    >
                        Annuler
                    </button>
                </div>
                {!isMicrophoneOn && <p className="text-red-500">Veuillez activer votre microphone pour commencer.</p>}
            </div>
            <div className="mt-8 p-4 bg-gray-100 rounded shadow-md">
                <h2 className="text-2xl font-bold mb-2">Instructions</h2>
                <ul className="list-disc list-inside">
                    <li>Assurez-vous que votre microphone est activé et fonctionne correctement.</li>
                    <li>En cas de problème, vérifiez les paramètres de votre navigateur.</li>
                    <li>Vous pouvez annuler à tout moment en cliquant sur le bouton "Annuler".</li>
                </ul>
            </div>
        </div>
    );
}

export default WaitingRoom;
