const mongoose = require('mongoose');
const uri = "your uri"

// Connect to your MongoDB database
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Fetch all collection names from the MongoDB database
async function getAllCollectionNames() {
  const collections = await mongoose.connection.db.listCollections().toArray();
  return collections.map(collection => collection.name);
}

// Your API endpoint function to create the dynamic JSON response
async function getCombinedData(req, res) {
  try {
    const collectionNames = await getAllCollectionNames();

    // Fetch data from all collections dynamically
    const data = {};
    await Promise.all(collectionNames.map(async (collectionName) => {
      const Collection = mongoose.model(collectionName, new mongoose.Schema({}));
      const collectionData = await Collection.find().exec();
      data[collectionName] = collectionData;
    }));

    // Respond with the JSON data
    res.json(data);
  } catch (err) {
    // Handle any errors that occur during the process
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Example Express.js setup to create an API endpoint for the dynamic JSON response
const express = require('express');
const app = express();
const port = 5000;

// Define your API endpoint
app.get('/combined-data', getCombinedData);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});