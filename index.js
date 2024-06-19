require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

const { MongoClient, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster2.siyj0jl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("jobPortal");
    const jobsCollection = db.collection("jobs");

    // Ensure indexes are created
    await jobsCollection.createIndex(
      { title: 1, category: 1 },
      { name: "titleCategory" }
    );

    // Define your API endpoints
    app.get("/allJobs", async (req, res) => {
      const jobs = await jobsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.send(jobs);
    });

    app.get("/singleJob/:id", async (req, res) => {
      const job = await jobsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(job);
    });

    app.get("/myJobs/:email", async (req, res) => {
      const jobs = await jobsCollection
        .find({ postedBy: req.params.email })
        .toArray();
      res.send(jobs);
    });

    app.get("/allJobsByCategory/:category", async (req, res) => {
      const jobs = await jobsCollection
        .find({ status: req.params.category })
        .toArray();
      res.send(jobs);
    });

    app.post("/post-job", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await jobsCollection.insertOne(body);
      res.status(200).send(result);
    });

    app.get("/getJobsByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await jobsCollection
        .find({
          $or: [
            { title: { $regex: text, $options: "i" } },
            { category: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    // Close MongoDB client on application exit
    process.on("SIGINT", () => {
      client.close().then(() => {
        console.log("MongoDB connection closed");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
