import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import mainIcon from '../assets/chatbot.png';

function Home() {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center">
      <header className="text-center mb-8">
        <main className="flex flex-col items-center mb-20">
          <img src={mainIcon} alt="CalMedicaCare" className="w-40 h-40 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-orange-500">CalmedicaCare+</h1>
        </main>
        <p className="text-xl text-black-700">
          Parlez à notre IA pour poser des questions médicales ou partager vos symptômes.
        </p>
      </header>
      <button className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-orange-600 transition duration-300 flex items-center transition duration-300 flex items-center animate-pulse">
        <FontAwesomeIcon icon={faMicrophone} className="mr-2" />
        Parlez à l'IA
      </button>
    </div>
  );
}

export default Home;
