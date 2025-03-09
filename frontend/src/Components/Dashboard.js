import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import "./Dashboard.css";

function Dashboard() {
  const [items, setItems] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      nav('/signin'); // Redirect to signin if not authenticated
      return;
    }

    const fetchItems = async () => {
      try {
        const res = await axios.get('http://localhost:5001/auctions');
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };
    fetchItems();
  }, []);

  // Function to calculate time left
  const getTimeLeft = (closingTime) => {
    if (!closingTime) return "No closing time set";

    const now = new Date(); // Current time
    const closeTime = new Date(closingTime); // Closing time from DB
    const diff = closeTime - now; // Difference in milliseconds

    if (diff <= 0) {
      return "Auction Closed"; // If time is over
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s left`;
  };

  return (
    <div className="dashboard-container">
      <h2>Auction Dashboard</h2>

      {/* Post New Auction Button */}
      <Link to="/post-auction">
        <button className="post-button">Post New Auction</button>
      </Link>

      <div className="auction-list">
        {items.map((item) => (
          <div key={item._id} className="auction-item">
            <Link to={`/auction/${item._id}`}>
              {/* Auction Image */}
              <img 
                src={item.imageUrl ? 
                (item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5001/uploads/${item.imageUrl}`) 
                : 'https://via.placeholder.com/150'} 
                alt={item.itemName} 
                className="auction-image" 
                />

              <div className="auction-details">
                <h3>{item.itemName}</h3>
                <p>Current Bid: ${item.currentBid}</p>
                <p>{item.isClosed ? '(Closed)' : '(Ongoing)'}</p>
                <p><strong>Time Left:</strong> {getTimeLeft(item.closingTime)}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
