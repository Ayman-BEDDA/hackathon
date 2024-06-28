import React from 'react';
import {useNavigate} from "react-router-dom";

function HomePro({ user }) {

    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Bonjour&nbsp;
                <span className="text-orange-500">{user.name} {user.surname}</span>. Bienvenue sur votre espace dédié aux professionnels de santé.
            </h1>
            <button
                className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-orange-600 transition duration-300"
                onClick={ () => navigate('/patients') }
            >
                Accédez aux données des patients
            </button>
        </div>
    );
}

export default HomePro;