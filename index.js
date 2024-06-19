const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

console.log(process.env.USER_NAME);

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://jobPortal:4pypMhq06BSXt5uy@cluster2.siyj0jl.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const JobCollection = client
      .db("JobPosts")
      .collection("jobPostCollections");

    app.get("/jobs", async (req, res) => {
      try {
        const result = await JobCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch jobs" });
      }
    });

    app.post("/jobs", async (req, res) => {
      try {
        const newItem = req.body;
        const result = await JobCollection.insertOne(newItem);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to create job post" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error(err);
  }
  // Do not close the client here as it will end the connection.
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
