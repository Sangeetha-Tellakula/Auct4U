import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PostAuction() {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState(0);
  const [closingTime, setClosingTime] = useState('');
  const [image, setImage] = useState(null); // Store selected image
  const [preview, setPreview] = useState(''); // Image preview
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signin'); // Redirect to login if not authenticated
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Generate preview URL
    }
  };

  const handlePostAuction = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You must be signed in to post an auction.');
      navigate('/signin');
      return;
    }

    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('description', description);
    formData.append('startingBid', startingBid);
    formData.append('closingTime', closingTime);
    if (image) {
      formData.append('image', image); // Append image file
    }

    try {
      await axios.post('http://localhost:5001/auction', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Important for image uploads
        },
      });

      alert('Auction item posted!');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to post auction. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Post New Auction</h2>
      <form onSubmit={handlePostAuction}>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
        <textarea
          placeholder="Item Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <input
          type="number"
          placeholder="Starting Bid"
          value={startingBid}
          onChange={(e) => setStartingBid(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={closingTime}
          onChange={(e) => setClosingTime(e.target.value)}
          required
        />

        {/* Image Upload Input */}
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {/* Image Preview */}
        {preview && <img src={preview} alt="Preview" className="image-preview" />}

        <button type="submit">Post Auction</button>
      </form>
    </div>
  );
}

export default PostAuction;
