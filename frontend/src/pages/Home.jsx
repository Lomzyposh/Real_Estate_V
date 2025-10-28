import React from 'react'
import { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LoaderContext, useLoader } from '../contexts/LoaderContext';
import { toast } from 'react-toastify';
import MapView from '../components/MapView';
import Hero from '../components/tryFramer';

export default function Home({
    background =
    "/images/mainHouse1.jpg",
}) {
    const [isloggedIn, setIsLoggedIn] = useState(false);
    const { setShowLoader } = useLoader();
    const [name, setName] = useState('');
    const onClickF = () => {
        setShowLoader(true);
    }
    const notify = () => toast.success("Profile updated successfully!");

    return (
        <>
            {/* <div className='text-black dark:text-white mt-50'>
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
                <Hero />
            </div> */}
            <section className="relative w-full mt-10">

                <div
                    className="relative h-[68vh] min-h-[520px] w-full overflow-hidden rounded-2xl sm:rounded-3xl"
                    style={{
                        backgroundImage: `url(${background})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >

                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60 dark:from-black/50 dark:via-black/30 dark:to-black/70" />


                    <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-6 sm:px-6 lg:px-10 lg:pb-10">

                        <div className="mb-4 flex flex-wrap gap-2">
                            {["House", "Apartment", "Residential"].map((t) => (
                                <span
                                    key={t}
                                    className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-800 backdrop-blur dark:bg-white/10 dark:text-gray-100 dark:ring-1 dark:ring-white/10"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>

                        <div className="max-w-5xl">
                            <h1 className="text-4xl font-semibold font-[Poppins] leading-tight tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
                                Build Your Future, One <br className="hidden sm:block" />
                                Property at a Time.
                            </h1>

                            <p className="mt-4 max-w-xl text-sm/6 text-white/90 sm:text-base/7">
                                Own your world. One property at a time.
                                Explore homes, apartments and lands across prime locations.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="-mt-6 w-full px-3 sm:px-6 lg:px-10">
                    <div className="mx-auto w-full max-w-6xl rounded-2xl border border-gray-200/70 bg-white/80 p-3 shadow-lg backdrop-blur dark:border-gray-800/70 dark:bg-[#0b1220]/80">
                        <div className="flex items-center justify-between px-2 pb-2 pt-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Find the best place
                            </h3>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                            <Field label="Looking for">
                                <input
                                    type="text"
                                    placeholder="Enter type"
                                    className="field"
                                    aria-label="Looking for"
                                />
                            </Field>

                            <Field label="Price">
                                <select className="field" aria-label="Price">
                                    <option value="">Price</option>
                                    <option value="0-50000">$0 — $50k</option>
                                    <option value="50000-150000">$50k — $150k</option>
                                    <option value="150000-300000">$150k — $300k</option>
                                    <option value="300000+">$300k+</option>
                                </select>
                            </Field>

                            {/* Locations */}
                            <Field label="Locations">
                                <select className="field" aria-label="Location">
                                    <option value="">Location</option>
                                    <option>Lagos</option>
                                    <option>Abuja</option>
                                    <option>Port Harcourt</option>
                                    <option>Ibadan</option>
                                </select>
                            </Field>

                            {/* Rooms */}
                            <Field label="Number of rooms">
                                <select className="field" aria-label="Number of rooms">
                                    <option value="">2 Bed rooms</option>
                                    <option>1 Bed</option>
                                    <option>2 Beds</option>
                                    <option>3 Beds</option>
                                    <option>4+ Beds</option>
                                </select>
                            </Field>
                        </div>

                        <div className="mt-3 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    Filter:
                                </span>
                                {["Street", "House", "Residential", "Apartment"].map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-[#0f172a] dark:text-gray-200 dark:hover:bg-[#111a2f]"
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                                Search Properties
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section className='h-[100vh]'>

            </section>
        </>
    )
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                {label}
            </span>
            {children}
        </label>
    );
}



