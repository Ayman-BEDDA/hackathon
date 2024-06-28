import React from 'react';

const Header = ({ room, user, leaveRoom }) => (
    <header className="mb-8 w-full flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
        <div className="flex flex-col">
            <p className="text-sm font-bold text-orange-600">Salle ID : {room?.id}</p>
            <p className="text-sm font-bold text-orange-600">Patient : <span className="text-orange-600">{user.name} {user.surname}</span></p>
        </div>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-md transition duration-300 hover:bg-orange-600" onClick={leaveRoom}>
            Quitter la salle
        </button>
    </header>
);

export default Header;
