import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0b1220] text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md"
      >
        {/* GIF or image */}
        <img
          src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
          alt="Not Found"
          className="mx-auto w-72 h-72 object-contain mb-6"
        />

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Oops! Page Not Found
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you’re looking for doesn’t exist or has been moved.
          <br />
          Let’s get you back on track.
        </p>

        {/* Button */}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold shadow-md hover:opacity-90 transition-all"
        >
          <i className="bi bi-arrow-left-circle text-lg" />
          Go Home
        </Link>
      </motion.div>

      {/* Optional floating 404 text */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="absolute bottom-10 text-[120px] font-extrabold text-gray-400 dark:text-gray-600 select-none pointer-events-none"
      >
        404
      </motion.h2>
    </div>
  );
};

export default NotFound;
