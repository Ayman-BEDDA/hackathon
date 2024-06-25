import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';

function Room() {
    const navigate = useNavigate();
    const { id: roomId } = useParams();

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
                <button className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-orange-600 flex items-center">
                    <FontAwesomeIcon icon={faPhoneSlash} className="mr-2" />
                    Fin de l'appel
                </button>
            </footer>
        </div>
    );
}

export default Room;
