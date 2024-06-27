import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from "react-router-dom";

const Navbar = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token) {
            setUser(token);
        }
    }
    , [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    }

    return (
        <nav className="bg-white p-4 w-full z-10 shadow-md fixed top-0">
            <div className="container mx-auto flex justify-between items-center">
                <Link to={"/"}>
                    <div className="text-orange-500 font-bold text-xl">
                        CalmediCare+
                    </div>
                </Link>
                {user ? (
                    <Link to="/logout">
                        <button className="bg-orange-500 text-white font-semibold py-2 px-4 rounded" onClick={handleLogout}>
                            Se déconnecter
                        </button>
                    </Link>
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
