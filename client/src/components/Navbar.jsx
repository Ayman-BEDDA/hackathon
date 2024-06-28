import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const token = localStorage.getItem('token');
    const [dropdownOpen, setDropdownOpen] = useState(false);


    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser({name: decodedToken.name, surname: decodedToken.surname});
            } catch (error) {
                console.error('Invalid token', error);
                navigate('/login');
            }
        }
    }
    , [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    }

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <nav className="bg-white p-4 w-full z-10 shadow-md fixed top-0">
            <div className="container mx-auto flex justify-between items-center">
                <Link to={"/"}>
                    <div className="text-orange-500 font-bold text-xl">
                        CalmediCare+
                    </div>
                </Link>
                {user ? (    
                    <div className="flex items-center">
                        <p className="text-gray-700 mr-4"><span className="font-thin">{user.name} {user.surname}</span></p>
                        <div className="relative">
                            <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
                                <img src="https://avatar.iran.liara.run/public" alt="avatar" className="inline-block h-12 w-12 rounded-full ring-2 ring-orange-200" />
                            </div>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                                    <button 
                                        onClick={handleLogout} 
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        Se déconnecter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <Link to="/register">
                            <button className="bg-orange-500 text-white font-semibold py-2 px-4 rounded mr-2">
                                S'inscrire
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="bg-orange-500 text-white font-semibold py-2 px-4 rounded mr-2">
                                Se connecter
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
