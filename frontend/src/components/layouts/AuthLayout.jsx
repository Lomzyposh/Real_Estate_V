import React, { useContext, useEffect, useState } from 'react'
import '../../styles/auth.css'
import { Outlet } from 'react-router-dom';
import Login from '../../pages/Auth/Login';
import SignUp from '../../pages/Auth/SignUp';
import { ThemeContext } from '../../contexts/ThemeContext';
import clsx from 'clsx'


const AuthLayout = () => {

    const [isSignUpActive, setIsSignUpActive] = useState(false);

    const sliderStyle = {
        left: isSignUpActive ? '50%' : '0%                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ',
    };

    const { theme, toggleTheme } = useContext(ThemeContext);


    return (
        <>
            <header className='w-full p-6 flex justify-between align-items-center'>
                {/* <button className='bg-amber-300 p-2 rounded-2xl text-gray-600 cursor-pointer' onClick={addJSON}>Add Data</button> */}
                <div className="flex items-center justify-center gap-2 cursor-pointer"
                    onClick={() => navigate("/")}>
                    <img src="/images/homeLogo.png" alt="Logo" className='w-12 h-12' />
                    <h2 className="text-xl text-[var(--text)] dark:text-[var(--primary)] font-bold font-[Montserrat] tracking-wide">NestNova</h2>
                </div>

                <button className="w-10 h-10 bg-[var(--background)] rounded-full text-[var(--text)] cursor-pointer z-20 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),inset_0px_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.3)]" title="Toggle Dark Mode" onClick={toggleTheme}>
                    <i className={`${theme === 'light' ? "bi bi-moon dark" : "bi bi-sun"}`} ></i>
                </button>

            </header>
            {/* {showLoader &&
                <div className="flex justify-center items-center z-50 fixed top-0 left-0 w-full h-full backdrop-blur-xs">
                    <div className="w-20 h-20 p-2 rounded-full flex justify-center items-center border-2 border-[#121212]">
                        <img src="/images/homeLogo.png" alt="" className="w-full h-full animate-spin ease-in-out" />
                    </div>
                </div>
            } */}
            <div
                className="hidden md:block w-[50vw] z-[-1] h-screen fixed  right-0"
            >
                <img
                    src="/images/handHouse.png"
                    alt="Wavy Right Side Image"
                    className="float-right w-full h-full object-cover brightness-70 saturate-150 animate-bounce [animation-iteration-count:.5] duration-1000"
                />

            </div>

            <div className="relative w-[50%] max-w-xs md:w-40 font-bold bg-gray-400 flex justify-between p-1 mx-auto md:ml-5 rounded-3xl shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),inset_0px_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.3)] mt-4 md:mt-0">
                <div className="absolute top-0 rounded-3xl w-[50%] h-full bg-[var(--primary)] shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),inset_0px_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.3)] transition-all duration-500" style={sliderStyle}></div>
                <button className="p-2 z-10 border-none rounded-2xl text-sm text-white cursor-pointer" id="loginSwitch" onClick={() => setIsSignUpActive(false)}>Login</button>
                <button className="p-2 z-10 border-none rounded-2xl text-sm text-white cursor-pointer" id="signUpSwitch" onClick={() => setIsSignUpActive(true)}>Sign Up</button>
            </div>
            <main className='md:w-[50%] ml-0 md:ml-20'>
                {isSignUpActive ?
                    <SignUp setIsSignUpActive={setIsSignUpActive} /> :
                    <Login setIsSignUpActive={setIsSignUpActive} />
                }
            </main>
        </>
    )
}

export default AuthLayout
