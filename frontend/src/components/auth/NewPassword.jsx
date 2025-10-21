import React, { useState } from 'react'
import RedStar from '../RedStar';
import { useNavigate } from 'react-router-dom';
import { useLoader } from '../../contexts/LoaderContext';

const NewPasswordForm = ({ setShowForm, email }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [strength, setStrength] = useState(0);
    const navigate = useNavigate();
    const { setShowLoader, setLoaderText } = useLoader();

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const calculateStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[@$!%*?&]/.test(pwd)) score++;
        return score;
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        setStrength(calculateStrength(value));
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        console.log("email prop ->", email);

        if (!newPassword || !confirmNewPassword) {
            setErrorMsg('All fields are required.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }
        if (strength < 2) {
            setErrorMsg('Password is too weak.');
            return;
        }
        setLoaderText("Changing Password. Please Wait....🙁");
        setShowLoader(true);
        await delay(1000);

        try {
            const res = await fetch('/api/setPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password: newPassword })
            })
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || 'Password change Failed. Try Again Later')

                return;
            }
            alert("Changed Successfully.")
            navigate('/');
        } catch (err) {
            setErrorMsg('An error occurred. Please try again.');
            console.error('Error Changing Password', err);
        } finally {
            setLoaderText('');
            setShowLoader(false);
        }
    }

    return (
        <form
            onSubmit={onSubmitForm}
            className="w-120 h-110 flex flex-col justify-center rounded-xl p-5 gap-4 bg-[var(--background)] dark:bg-[var(--dark-background)] shadow-lg shadow-gray-300/50 dark:shadow-black/50 mt-3"
        >
            <h1 className="text-[var(--text)] text-center text-2xl font-bold font-[Montserrat] dark:text-white">
                Create a new Password.
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-2">
                Try something you won't forget this time🙁🤐
            </p>

            {errorMsg && (
                <span className="text-[#d32f2f] bg-[#fdecea] border border-[#f5c6cb] px-3 py-2 rounded-md text-[0.9rem] font-medium mt-[6px] shadow-sm animate-fadeIn">
                    {errorMsg}
                </span>
            )}
            <div>
                <label htmlFor="password" className="block text-sm/6 font-medium text-black dark:text-gray-100">
                    New Password <RedStar />
                </label>
                <div className="mt-2">
                    <input
                        id="password"
                        type="password"
                        onChange={handlePasswordChange}
                        value={newPassword}
                        required
                        className="block w-full rounded-md bg-gray-300 text-gray-900 placeholder-gray-500 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--dark-primary)] sm:text-sm/6
                  dark:border-gray-700 dark:bg-white/5 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                    <div className="w-full h-2 mt-2 rounded bg-gray-200 dark:bg-gray-700">
                        <div
                            className={`h-2 rounded transition-all duration-300
                                ${strength === 1 ? "w-1/4 bg-red-500" : ""}
                                ${strength === 2 ? "w-2/4 bg-yellow-500" : ""}
                                ${strength === 3 ? "w-3/4 bg-blue-500" : ""}
                                ${strength === 4 ? "w-full bg-green-500" : ""}`}
                        />
                    </div>
                    <p className="text-xs mt-1 text-gray-500">
                        {strength === 0 && "Enter a password"}
                        {strength === 1 && "Weak"}
                        {strength === 2 && "Fair"}
                        {strength === 3 && "Good"}
                        {strength === 4 && "Strong"}
                    </p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="confirmPass" className="block text-sm/6 font-medium text-black dark:text-gray-100">
                        Confirm New Password <RedStar />
                    </label>
                </div>
                <div className="mt-2">
                    <input
                        id="confirmPass"
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="block w-full rounded-md bg-gray-300 text-gray-900 placeholder-gray-500 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--dark-primary)] sm:text-sm/6
                  dark:border-gray-700 dark:bg-white/5 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                </div>
            </div>
            <div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-[var(--primary)] px-3 py-2 text-sm/6 font-semibold text-white hover:bg-[var(--background2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),inset_0px_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.3)] cursor-pointer"
                >
                    Set
                </button>
            </div>
        </form>
    )
}

export default NewPasswordForm


