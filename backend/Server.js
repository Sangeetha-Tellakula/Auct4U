const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Import multer
const path = require('path');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cors());

// Serve static files (for images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const SECRET_KEY = 'my_super_secret_123!';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/auction')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

  // Multer Storage Config (Upload to "uploads" folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save images in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});
const upload = multer({ storage });


// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
//create table user
const User = mongoose.model('User', userSchema);

// Auction Item Schema
const auctionItemSchema = new mongoose.Schema({
  itemName: String,
  description: String,
  currentBid: Number,
  highestBidder: String,
  closingTime: Date,
  isClosed: { type: Boolean, default: false },
  imageUrl: String, // Store image URL
});
const AuctionItem = mongoose.model('AuctionItem', auctionItemSchema);

// Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log("Received Token:", token); // Debugging log
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error("Token Verification Error:", err);
      return res.status(403).json({ message: 'Invalid Token' });
    }
      req.user = user;
    next();
  });
};

// Signup Route
app.post('/createAccount', async (req, res) => {  // Ensure '/signup' matches frontend
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }
  
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);  // Secure password storage
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Signup Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
// Signin Route
app.post('/Login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, username }, SECRET_KEY, { expiresIn: '1h' });
    console.log("Generated Token:", token); // Debugging log
    res.json({ message: 'Signin successful', token });
  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create Auction Item (Protected)
app.post('/auction', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { itemName, description, startingBid, closingTime } = req.body;
    if (!itemName || !description || !startingBid || !closingTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const imageUrl = req.file ? `http://localhost:5001/uploads/${req.file.filename}` : '';


    const newItem = new AuctionItem({
      itemName,
      description,
      currentBid: startingBid,
      highestBidder: '',
      closingTime,
      imageUrl,
    });
    await newItem.save();
    res.status(201).json({ message: 'Auction item created', item: newItem });
  } catch (error) {
    console.error('Auction Post Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all auction items
app.get('/auctions', async (req, res) => {
  try {
    const auctions = await AuctionItem.find();
    res.json(auctions.map(item => ({
      ...item._doc,
      imageUrl: item.imageUrl || ''  // ✅ Ensures imageUrl is always present
    })));
  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Get a single auction item by ID
app.get('/auctions/:id', async (req, res) => {
  try {
    const auctionItem = await AuctionItem.findById(req.params.id);
    if (!auctionItem) return res.status(404).json({ message: 'Auction not found' });
    res.json(auctionItem);
  } catch (error) {
    console.error('Fetching Auction Item Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Bidding on an item (Protected)
app.post('/bid/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const bid = Number(req.body.bid); // Ensure bid is a number

    if (!bid || isNaN(bid)) {
      return res.status(400).json({ message: 'Invalid bid amount' });
    }

    const item = await AuctionItem.findById(id);
    if (!item) return res.status(404).json({ message: 'Auction item not found' });

    // Check if auction is closed
    if (item.isClosed || new Date() > new Date(item.closingTime)) {
      item.isClosed = true;
      await item.save();
      return res.json({ message: 'Auction closed', winner: item.highestBidder || 'No bids' });
    }

    // Bid must be higher than current bid
    if (bid > item.currentBid) {
      item.currentBid = bid;
      item.highestBidder = req.user?.username || req.body.username || 'Anonymous';
      await item.save();
      return res.json({ message: 'Bid successful', item });
    } else {
      return res.status(400).json({ message: 'Bid too low' });
    }
  } catch (error) {
    console.error('Bidding Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//deleted with authentication
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Double-check by fetching all users
    const allUsers = await User.find();
    console.log('Remaining Users:', allUsers);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete an auction item by ID
app.delete('/auctions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAuction = await AuctionItem.findByIdAndDelete(id);

    if (!deletedAuction) {
      return res.status(404).json({ message: 'Auction item not found' });
    }

    res.json({ message: 'Auction deleted successfully', deletedAuction });
  } catch (error) {
    console.error('Auction Deletion Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(5001, () => {
  console.log('Server is running on port 5001');
});