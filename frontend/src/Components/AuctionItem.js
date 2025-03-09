import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function AuctionItem() {
  const { id } = useParams();
  const [item, setItem] = useState({});
  const [bid, setBid] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/auctions/${id}`);
        setItem(res.data);
      } catch (error) {
        setMessage('Error fetching auction item: ' + (error.response?.data?.message || error.message));
        console.error(error);
      }
    };

    fetchItem();
  }, [id]);

  const handleBid = async () => {
    const username = prompt('Enter your username to place a bid:');

    if (bid <= item.currentBid) {
      setMessage('Bid must be higher than the current bid.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken'); // Get token from storage
      const res = await axios.post(
        `http://localhost:5001/bid/${id}`,
        { bid, username },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in header
          },
        }
      );
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error placing bid.');
      console.error(error);
    }
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '500px', margin: 'auto' }}>
      {/* Display Auction Item Image */}
      {item.imageUrl && (
        <img 
          src={item.imageUrl} 
          alt={item.itemName} 
          style={{ width: '100%', height: 'auto', borderRadius: '10px', marginBottom: '10px' }}
        />
      )}

      <h2>{item.itemName}</h2>
      <p>{item.description}</p>
      <p><strong>Current Bid:</strong> ${item.currentBid}</p>
      <p><strong>Highest Bidder:</strong> {item.highestBidder || 'No bids yet'}</p>

      <input
        type="number"
        value={bid}
        onChange={(e) => setBid(e.target.value)}
        placeholder="Enter your bid"
        style={{ padding: '30px', marginRight: '10px' }}
      />
      <button onClick={handleBid} style={{ padding: '30px 30px', cursor: 'pointer' }}>Place Bid</button>

      {message && <p className="message" style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
    </div>
  );
}

export default AuctionItem;
