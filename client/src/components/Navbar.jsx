import React from 'react';
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMicrophone} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
    return (
        <nav className="bg-orange-500 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to={"/"}>
                    <div className="text-white font-bold text-xl">
                        MyApp
                    </div>
                </Link>
                <div>
                    <Link to="/register">
                        <button className="bg-white text-orange-500 font-semibold py-2 px-4 rounded mr-2">
                            S'inscrire
                        </button>
                    </Link>
                    <Link to="/login">
                        <button className="bg-white text-orange-500 font-semibold py-2 px-4 rounded mr-2">
                            Se connecter
                        </button>
                    </Link>
                    <Link to="response-vocal">
                        <button className="bg-white text-orange-500 font-semibold py-2 px-4 rounded">
                            <FontAwesomeIcon icon={faMicrophone}/>
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
