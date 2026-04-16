import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection String
const uri = process.env.MONGODB_URI || "mongodb+srv://testuser:testpassword123@cluster0.vulsn3z.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function start() {
  try {
    await client.connect();
    console.log("🟢 Connected to MongoDB Database");
    
    // Select DB and Collection
    const db = client.db("photo-sync");
    const users = db.collection("users");

    // Registration Endpoint
    app.post('/api/register', async (req, res) => {
      const { email, phone, pin, secretQuestion, secretAnswer } = req.body;
      
      const existing = await users.findOne({ $or: [{ email }, { phone }] });
      if (existing) {
        return res.status(400).json({ success: false, error: 'User with this email or phone already exists' });
      }

      const newUser = { 
        email, 
        phone, 
        pin, 
        secretQuestion, 
        secretAnswer,
        id: Date.now().toString() 
      };
      
      await users.insertOne(newUser);
      
      // Don't send MongoDB internal _id field back
      const { _id, ...safeUser } = newUser as any;
      res.json({ success: true, user: safeUser });
    });

    // Login Endpoint
    app.post('/api/login', async (req, res) => {
      const { email, pin } = req.body;
      const user = await users.findOne({ email, pin });
      
      if (user) {
         const { _id, ...safeUser } = user as any;
         res.json({ success: true, user: safeUser });
      } else {
         res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
    });

    // Get Secret Question Endpoint
    app.post('/api/get-question', async (req, res) => {
      const { email } = req.body;
      const user = await users.findOne({ email });
      if (user) {
        res.json({ success: true, question: user.secretQuestion });
      } else {
        res.json({ success: false });
      }
    });

    // Reset Password Endpoint
    app.post('/api/reset-password', async (req, res) => {
      const { email, answer, newPin } = req.body;
      // Use case-insensitive regex for the answer
      const user = await users.findOne({ 
        email, 
        secretAnswer: { $regex: new RegExp(`^${answer}$`, 'i') } 
      });

      if (user) {
        await users.updateOne({ email }, { $set: { pin: newPin } });
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: 'Incorrect backup secret answer' });
      }
    });

    // Serve Frontend statically for the single-deployment
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Single-Deployment Server running on port ${PORT}`));

  } catch (error) {
    console.error("🔴 Failed to initialize database:", error);
  }
}

start();
