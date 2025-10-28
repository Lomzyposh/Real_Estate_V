import React, { useEffect, useMemo, useRef, useState } from "react";
import NewPasswordForm from "./NewPassword";
import { useLoader } from "../../contexts/LoaderContext";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 40;

const OtpForm = ({ setShowOtpForm, email }) => {
  const [values, setValues] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [showChangePassword, setChangePassword] = useState(false);
  const { setShowLoader, setLoaderText } = useLoader();

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const inputsRef = useRef([]);
  inputsRef.current = useMemo(
    () => Array(OTP_LENGTH).fill(null).map((_, i) => inputsRef.current[i] ?? React.createRef()),
    []
  );

  const verifyCode = async (code) => {
    setLoaderText("Verifying Code...");
    setShowLoader(true);
    await delay(1000);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp: code })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }
      setChangePassword(true);
    } catch (err) {
      setError(err?.message || "Verification failed. Try again.");
    } finally {
      setIsSubmitting(false);
      setLoaderText('');
      setShowLoader(false);
    }
  }

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const focusInput = (i) => inputsRef.current[i]?.current?.focus();

  const handleChange = (i, v) => {
    setError("");
    const val = v.replace(/\D/g, "");
    setValues((prev) => {
      const next = [...prev];
      next[i] = val.slice(0, 1);
      return next;
    });
    if (val && i < OTP_LENGTH - 1) focusInput(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !values[i] && i > 0) {
      focusInput(i - 1);
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault(); focusInput(i - 1);
    }
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) {
      e.preventDefault(); focusInput(i + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = ((e.clipboardData || window.clipboardData).getData("text").match(/\d/g) || []).slice(0, OTP_LENGTH);
    if (!digits.length) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setValues(next);
    focusInput(Math.min(digits.length, OTP_LENGTH) - 1);
  };

  const code = values.join("");
  const isComplete = /^\d{6}$/.test(code);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isComplete) {
      setError("Enter the 6-digit code.");
      return;
    }
    setIsSubmitting(true);
    await verifyCode(code);
  };

  const handleResend = async () => {
    if (seconds > 0) return;
    setValues(Array(OTP_LENGTH).fill(""));
    setSeconds(RESEND_SECONDS);
    setError("");
    focusInput(0);
    // TODO: trigger resend API here
    // await verifyCode(code);

    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message)
      return;
    }
    alert("Sent innit🕳🕳");
  };

  return (

    <>
      {
        showChangePassword ? (
          <NewPasswordForm setShowForm={setChangePassword} email={email} />
        ) :
          <form
            onSubmit={handleSubmit}
            className="w-120 h-110 relative flex flex-col justify-center rounded-xl p-5 gap-4 bg-[var(--background)] dark:bg-[var(--dark-background)] shadow-lg shadow-gray-300/50 dark:shadow-black/50 mt-3"
            id="otpForm"
          >
            <i
              className="bi bi-arrow-left-circle absolute top-5 left-3 text-3xl text-[var(--text)] dark:text-white cursor-pointer hover:text-[var(--primary)]"
              onClick={() => setShowOtpForm(false)}
              title="Back"
              role="button"
              aria-label="Go back"
            />

            <h2 className="text-[var(--text)] dark:text-white text-2xl font-bold font-[Montserrat] text-center">
              Enter Verification Code
            </h2>
            <p className="text-center text-sm text-[var(--text2)]/80 dark:text-gray-300">
              We’ve sent a 6-digit code to your email/phone.
            </p>

            <div
              className="mt-2 flex items-center justify-between gap-2 sm:gap-3"
              onPaste={handlePaste}
            >
              {values.map((val, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={val}
                  ref={inputsRef.current[i]}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-14 w-12 sm:h-16 sm:w-14 rounded-xl border border-gray-300 bg-white text-center text-xl font-semibold tracking-[0.2em] outline-none
                       focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]
                       dark:border-gray-700 dark:bg-white/5 dark:text-gray-100"
                  autoComplete="one-time-code"
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>

            {error ? (
              <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {error}
              </p>
            ) : (
              <p className="text-xs text-[var(--text2)]/70 dark:text-gray-400">
                Tip: you can paste the entire code.
              </p>
            )}

            <button
              type="submit"
              disabled={!isComplete || isSubmitting}
              className="mt-2 flex w-full justify-center rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--background2)]
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dark-primary)]
                   shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),inset_0px_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.25)]
                   disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verifying…" : "Verify"}
            </button>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-[var(--text2)] dark:text-gray-300">Didn’t get the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={seconds > 0}
                className="font-semibold text-[var(--text)] dark:text-white underline-offset-4 hover:underline disabled:no-underline disabled:opacity-60"
              >
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
              </button>
            </div>
          </form>

      }
    </>
  );
};

export default OtpForm;
