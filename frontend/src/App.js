import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { Web3Provider } from './contexts/Web3Context';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Exam from './pages/Exam';
import Admin from './pages/Admin';
import AdminSimple from './pages/AdminSimple';
import MetaMaskAdmin from './pages/MetaMaskAdmin';
import Dashboard from './pages/Dashboard';
import NFTGallery from './pages/NFTGallery';

// Styles
import './App.css';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/exam" element={<Exam />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-simple" element={<AdminSimple />} />
              <Route path="/metamask-admin" element={<MetaMaskAdmin />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/nft-gallery" element={<NFTGallery />} />
              {/* Catch-all route for any unmatched paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;

