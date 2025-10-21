import React, { useState } from 'react'
import OtpForm from './OtpForm';
import NewPasswordForm from './NewPassword';
import { useLoader } from '../../contexts/LoaderContext';

const ForgotPassComp = ({ setShowForgotForm }) => {
  const { setShowLoader, setLoaderText } = useLoader();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setLoaderText("Verifying Email...");
    setShowLoader(true);
    await delay(1000);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message)
        return;
      }
      alert("Sent innit🕳🕳");
      setShowOtpForm(true);
    } catch (err) {
      console.log('ERR: ', err)
    } finally {
      setLoading(false);
      setLoaderText('');
      setShowLoader(false);
    }
  }

  return (
    <>
      {
        showOtpForm ? (
          <OtpForm setShowOtpForm={setShowOtpForm} email={email} />
        ) : (
          <form className="w-120 h-110 flex  flex-col justify-center rounded-xl p-5 gap-4 bg-[var(--background)] dark:bg-[var(--dark-background)] shadow-lg shadow-gray-300/50 dark:shadow-black/50 mt-3 relative" id="forgotPassForm" onSubmit={submitForm}>
            <i className="bi bi-arrow-left-circle absolute top-5 left-3 text-3xl text-[var(--text)] cursor-pointer hover:text-[#4CAF50]" onClick={() => setShowForgotForm(false)}></i>
            <h2 className='text-[var(--text)] text-2xl font-bold font-[Montserrat] dark:text-white'>Forgot Password?</h2>
            {/* <p className='text-[var(--text3)]'>Fill in your email</p> */}

            {errorMsg && (
              <span className="text-[#d32f2f] bg-[#fdecea] border border-[#f5c6cb] px-3 py-2 rounded-md text-[0.9rem] font-medium mt-[6px] shadow-sm animate-fadeIn">
                {errorMsg}
              </span>
            )}

            <div>
              <label htmlFor="forgotEmailInput" className="block text-sm/6 font-medium text-gray-800 dark:text-gray-100">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="forgotEmailInput"
                  placeholder=" "
                  autoComplete="email"
                  required
                  type="email"
                  value={email}
                  className="block w-full rounded-md bg-gray-300 text-gray-900 placeholder-gray-500 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--dark-primary)] sm:text-sm/6
                  dark:border-gray-700 dark:bg-white/5 dark:text-gray-100 dark:placeholder-gray-400"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className='flex w-full justify-center rounded-md bg-[var(--primary)] px-3 py-2 text-sm/6 font-semibold text-white hover:bg-[var(--background2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),inset_0px_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.3)] cursor-pointer'>
              {loading ? 'Sending' : 'Send Reset Code'}

            </button>
          </form>
        )}
    </>
  )
}

export default ForgotPassComp