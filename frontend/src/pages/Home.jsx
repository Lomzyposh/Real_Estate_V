import React from 'react'
import { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LoaderContext, useLoader } from '../contexts/LoaderContext';
import { toast } from 'react-toastify';
import MapView from '../components/MapView';
import Hero from '../components/tryFramer';

const Home = () => {
    const [isloggedIn, setIsLoggedIn] = useState(false);
    const { setShowLoader } = useLoader();
    const [name, setName] = useState('');
    const onClickF = () => {
        setShowLoader(true);
    }
    const notify = () => toast.success("Profile updated successfully!");

    return (
        <>
            <div className='text-black dark:text-white mt-50'>
                <button onClick={onClickF}>Show Loader</button>
                <ul>
                    <li>
                        <Link to='/signIn'>Sign Page</Link>
                    </li>
                    <li>
                        <Link to='/lenders'>Lender DashBoard</Link>
                    </li>

                </ul>

                <h1>Is Logged in: {isloggedIn}</h1>
                <h2>Name: {name}</h2>
                <button
                    onClick={notify}
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                >
                    Show Toast
                </button>
                {/* <MapView lat={41.902300} lng={-87.818500} zoom={12} /> */}
                <Hero />
            </div>
            </>
    )
}

export default Home

