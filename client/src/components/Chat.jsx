import React from 'react';
import { TailSpin } from 'react-loader-spinner';

const Chat = ({ messages, loadingRoom, loadingMessages, loadingAudio, audioUrl, messagesEndRef, imageSrc, cameraEnabled }) => (
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
);

export default Chat;
