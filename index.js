const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

console.log(process.env.USER_NAME);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster2.siyj0jl.mongodb.net/?retryWrites=true&w=majority`;

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
      // Connect the client to the server	(optional starting in v4.7)
    //   await client.connect();
      // Send a ping to confirm a successful connection
      const db = client.db("jobPortal");
      const jobsCollection = db.collection("jobs");
      // Creating index on two fields
      const indexKeys = { title: 1, category: 1 }; // Replace field1 and field2 with your actual field names
      const indexOptions = { name: "titleCategory" }; // Replace index_name with the desired index name
      const result = await jobsCollection.createIndex(indexKeys, indexOptions);
      console.log(result);
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
      app.get("/allJobs", async (req, res) => {
        const jobs = await jobsCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        res.send(jobs);
      });
      app.get("/singleJob/:id", async (req, res) => {
        console.log(req.params.id);
        const jobs = await jobsCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(jobs);
      });
  
      app.get("/myJobs/:email", async (req, res) => {
        console.log(req.params.id);
        const jobs = await jobsCollection
          .find({
            postedBy: req.params.email,
          })
          .toArray();
        res.send(jobs);
      });
  
      app.get("/allJobsByCategory/:category", async (req, res) => {
        console.log(req.params.id);
        const jobs = await jobsCollection
          .find({
            status: req.params.category,
          })
          .toArray();
        res.send(jobs);
      });
  
      app.post("/post-job", async (req, res) => {
        const body = req.body;
        body.createdAt = new Date();
        console.log(body);
        const result = await jobsCollection.insertOne(body);
        if (result?.insertedId) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send({
            message: "can not insert try again leter",
            status: false,
          });
        }
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
  
  
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
