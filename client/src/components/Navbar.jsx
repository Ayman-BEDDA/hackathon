import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMicrophone} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {

    const navigate = useNavigate();

   useEffect(() => {
         const token = localStorage.getItem('token');
         if (token) {
              setUser(token);
         }
    }
    , []);

    const [user, setUser] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    }



    return (
        <nav className="bg-white p-4 shadow-md w-full z-10">
            <div className="container mx-auto flex justify-between items-center">
                <Link to={"/"}>
                    <div className="text-orange-500 font-bold text-xl">
                        CalmedicaCare+
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
                    <Link to="response-vocal">
                        <button className="bg-white text-orange-500 font-semibold py-2 px-4 rounded">
                            <FontAwesomeIcon icon={faMicrophone}/>
                        </button>
                    </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
