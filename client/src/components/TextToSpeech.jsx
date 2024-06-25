import React, { useState } from 'react';
import axios from 'axios';

const TextToSpeech = () => {
    const [text, setText] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setText(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/response-vocal', { text }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/wav' }));
            setAudioUrl(url);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue.');
            setAudioUrl(null);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-5">Text to Speech</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="text">
                        Texte
                    </label>
                    <textarea
                        name="text"
                        id="text"
                        value={text}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Convertir en audio
                    </button>
                </div>
            </form>
            {audioUrl && (
                <div className="mt-4">
                    <audio controls src={audioUrl}></audio>
                </div>
            )}
        </div>
    );
};

export default TextToSpeech;
