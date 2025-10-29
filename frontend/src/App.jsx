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
import Map from './pages/Map';
import AllProperties from './pages/AllProperties';
import AgentDashboard from './pages/Agents/AgentDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Sell from './pages/Sell';
import { Toaster } from "react-hot-toast";
import Footer from './components/Footer';
import Contact from './pages/Contact';

const App = () => {
  const [loading, setLoading] = useState(false);



  return (
    <>
      <Loader
        logo="/images/homeLogo.png"
      />
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<AuthLayout />}>
          <Route path="/signIn" element={<Login />} />
        </Route>
        <Route element={<LendersLayout />}>
          <Route path="/lenders" element={<LendersDashboard />} />
        </Route>

        <Route path="/details/:id" element={<HomeDetails />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/contact" element={<Contact />} />


        <Route path="/allProperties" element={<AllProperties />} />
        <Route path="/profile" element={<SettingsPanel />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/agentDashboard" element={<AgentDashboard />} />
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
      <Footer />
    </>
  )
}

export default App
