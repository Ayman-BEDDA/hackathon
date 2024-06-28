import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from 'react-loader-spinner';

const VideoStream = ({
    cameraEnabled, toggleCamera, capture, streaming, toggleStreaming,
    loadingImage, imageSrc, videoRef, webcamRef, video
}) => (
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
                <FontAwesomeIcon icon={faCamera} className="mr-2" />
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
);

export default VideoStream;
