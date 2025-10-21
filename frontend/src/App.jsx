import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Login from './pages/Auth/Login';
import LendersDashboard from './pages/Lenders/LendersDashboard'
import AuthLayout from './components/layouts/AuthLayout';
import LendersLayout from './components/layouts/LendersLayout';
import { useState } from 'react';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import HomeDetails from './pages/HomeDetails';
import SettingsPanel from './pages/Profile';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

const App = () => {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Loader
        logo="/images/homeLogo.png"
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<AuthLayout />}>
          <Route path="/signIn" element={<Login />} />
        </Route>
        <Route element={<LendersLayout />}>
          <Route path="/lenders" element={<LendersDashboard />} />
        </Route>

        <Route path="/home/:id" element={<HomeDetails />} />
        <Route path="/profile" element={<SettingsPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        className="!bottom-8 !mb-2"
        toastClassName={() =>
          "relative flex p-4 rounded-xl shadow-md bg-gray-900 text-white dark:bg-gray-800 font-medium"
        }
        bodyClassName={() => "text-sm"}
        progressClassName="!bg-orange-500"
      />
    </>
  )
}

export default App
