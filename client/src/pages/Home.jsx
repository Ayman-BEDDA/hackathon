import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import mainIcon from '../assets/chatbot.png';
//jwt-decode
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function Home() {


  const token = localStorage.getItem('token');

  const navigate = useNavigate();

  const user = jwtDecode(token);

  const handleStart = () => {
    if (!token) {
      navigate('/login');
      return;
    }
  
    try {
      fetch('http://localhost:3001/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId : token ? jwtDecode(token).id : null
      })
      })
      .then(response => response.json())
      .then(data => {
        navigate(`/room/${data.id}`);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center ">
      <header className="text-center mb-8">
        <main className="flex flex-col items-center mb-20">
          <img src={mainIcon} alt="CalMedicaCare" className="w-40 h-40 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-orange-500">CalmedicaCare+</h1>
        </main>
        <p className="text-xl text-black-700 flex">
          Bonjour&nbsp;<p className="text-orange-500 font-bold">
          {user.name} {user.surname}
        </p>, parlez à notre IA pour poser des questions médicales ou partager vos symptômes.
        </p>
      </header>
      <button className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-orange-600 transition duration-300 flex items-center transition duration-300 flex items-center animate-pulse" onClick={handleStart}>
        <FontAwesomeIcon icon={faMicrophone} className="mr-2" />
        Parlez à l'IA
      </button>
    </div>
  );
}

export default Home;
