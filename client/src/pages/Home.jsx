import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import mainIcon from '../assets/chatbot.png';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
    } catch (error) {
      console.error('Invalid token', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleStart = () => {
    const token = localStorage.getItem('token');
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
          userId: token ? jwtDecode(token).id : null,
        }),
      })
        .then(response => response.json())
        .then(data => {
          navigate(`/room/${data.id}`);
        });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="bg-orange-50 flex flex-col items-center justify-center pt-16">
      <header className="text-center mb-8">
        <main className="flex flex-col items-center mb-20">
          <img src={mainIcon} alt="CalMedicaCare" className="w-40 h-40 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-orange-500">CalmedicaCare+</h1>
        </main>
        {user && (
          <p className="text-xl text-black-700 flex">
            Bonjour&nbsp;
            <span className="text-orange-500 font-bold">
              {user.name} {user.surname}
            </span>
            , parlez à notre IA pour poser des questions médicales ou partager vos symptômes.
          </p>
        )}
      </header>
      <button
        className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-orange-600 transition duration-300 flex items-center animate-pulse"
        onClick={handleStart}
      >
        <FontAwesomeIcon icon={faMicrophone} className="mr-2" />
        Parlez à l'IA
      </button>
    </div>
  );
}

export default Home;
