import React from 'react';
import {Link} from "react-router-dom";

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
                        <button className="bg-white text-orange-500 font-semibold py-2 px-4 rounded">
                            Se connecter
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
