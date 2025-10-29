import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ForgotPassComp from '../../components/auth/ForgotPassComp';
import OtpForm from '../../components/auth/OtpForm';
import { useLoader } from '../../contexts/LoaderContext';
import { useAuth } from '../../contexts/AuthContext';



const Login = ({ setIsSignUpActive }) => {
  
  const { setShowLoader, setLoaderText } = useLoader();
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [email, setEmail] = useState('');
  const { checkStatus, login, setUser } = useAuth();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const navigate = useNavigate();

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const onSubmitForm = async (e) => {
    e.preventDefault();

    setErrorMsg('');
    setLoaderText("Checking Info...");
    setShowLoader(true);
    await delay(1000);

    try {
      const checkAuth = await login(email, password);
      if (!checkAuth) {
        setErrorMsg('Invalid email or password');
        return;
      }
      await checkStatus();
      navigate('/');
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.');
      console.error('Error verifying Credentials', err);
    } finally {
      setLoaderText('');
      setShowLoader(false);
    }
  }

  if (showOtpForm) {
    return (
      <div className="w-full min-h-full flex justify-center bg-transparent px-2">
        <OtpForm email={email} setShowOtpForm={setShowOtpForm} />
      </div>
    )
  }


  return (
    <div className="w-full min-h-full flex justify-center bg-transparent px-2">
      {
        showForgotForm ? (
          <ForgotPassComp setShowForgotForm={setShowForgotForm} />
        ) : (
          <form
            onSubmit={onSubmitForm}
            id="loginForm"
            className="w-120 h-110 flex flex-col justify-center rounded-xl p-5 gap-4 bg-[var(--background)] dark:bg-[var(--dark-background)] shadow-lg shadow-gray-300/50 dark:shadow-black/50 mt-3"
          >
            <h1 className="text-[var(--text)] text-center text-2xl font-bold font-[Montserrat] dark:text-white">
              Welcome Back
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-2">
              Please sign in to your account to continue.
            </p>

            {errorMsg && (
              <span className="text-[#d32f2f] bg-[#fdecea] border border-[#f5c6cb] px-3 py-2 rounded-md text-[0.9rem] font-medium mt-[6px] shadow-sm animate-fadeIn">
                {errorMsg}
              </span>
            )}
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-black dark:text-gray-100">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-gray-300 text-gray-900 placeholder-gray-500 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--dark-primary)] sm:text-sm/6
                  dark:border-gray-700 dark:bg-white/5 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-black dark:text-gray-100">
                  Password
                </label>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-gray-700 dark:text-gray-400 hover:text-indigo-300"
                    onClick={() => setShowForgotForm(true)}
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                Login
              </button>
            </div>
          </form>
        )
      }
    </div>
  )

}

export default Login
