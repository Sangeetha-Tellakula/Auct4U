
import React, { useEffect, useState } from "react";
//import "./Landing.css"; // Import CSS file


function Landing() {
  return (
    <>
      <div className="marquee-container">
        <div className="marquee">
          <span>Welcome to Auction App. Complete the Signup process for parcipating in auction.</span>
        </div>
      </div>
      <ul class="nav-links">
        <li><a href="/PostAuction">Post Auction</a></li>
        <li><a href="/Dashboard">Dashboard</a></li>
        <ul class="separate-button">
        <li><a href="/AllAuctions">All Auctions</a></li>
      </ul>
      <li class="dropdown">
  <a href="/All Categories">All Categories ▾</a>
  <ul class="dropdown-menu">
    <li><a href="/clocks">Antiqueclocks</a></li>
    <li><a href="/statues">Statues</a></li>
    <li><a href="/mahals">Mahals</a></li>
    <li><a href="/AgricultureLands">AgriLands</a></li>
    <li><a href="Idols">Idols</a></li>
  </ul>
</li>

      </ul>
      <img src="/Logo.png" alt="Auct4U Logo" className="background-image" />
      <footer>
          <p>&copy; 2024 Auction App. All rights reserved.</p>
          <p>Welcome to the best place to buy and sell items through auctions!</p>
        </footer>
    
    </>
  );
}

export default Landing;