import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import CreateAccount from './Components/CreateAccount';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import AuctionItem from './Components/AuctionItem';
import PostAuction from './Components/PostAuction';
import Landing from './Components/Landing';
import './App.css';
import { Search } from "lucide-react";
import AllAuctions from './Components/AllAuctions';


function App() {
  //isAuthenticated is the state, setIsAuthenticated changes the state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const navigate = useNavigate();

  //loads when the component load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    // navigate('/signin');
  };

  return (
    <Router>
       <nav className="navbar">
        {/* Left: Logo */}
        <img src="/Logo.png" alt="Auct4U Logo" className="logo-image" />

        {/* Center: Search Bar */}
        <div className="search-container">
          <div className="search-bar">
            <input type="text" placeholder="Search auctions..." />
            <Search className="search-icon" />
          </div>
        </div>

        {/* Right: Create Account Button */}
        <ul class="nav-links">
        <li><a href="/CreateAccount">Create Account</a></li>
        <li><a href="/Login">Login</a></li>
        </ul>
      </nav>
      <Routes>
           <Route path="/" element={<Landing/>} />
      </Routes>
      
        <main>
          <Routes>
            <Route path="/CreateAccount" element={<CreateAccount />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auction/:id" element={<AuctionItem />} />
            <Route path="/PostAuction" element={<PostAuction />} />
            <Route path="/AllAuctions" element={<AllAuctions />} />
          </Routes>
          
        </main>
        
    </Router>
  );
}

export default App;