const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// spT1IkIY7rTbOkzp job-hub
// middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const uri =
  "mongodb+srv://job-hub:spT1IkIY7rTbOkzp@cluster0.5prtsfh.mongodb.net/?retryWrites=true&w=majority";

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
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    // collection
    const categoriesCollection = client
      .db("jub-hub")
      .collection("categoriesCollection");

    // job data post
    app.post("/api/v1/employer/postJob", async (req, res) => {
      const jobPost = req.body;
      const result = await categoriesCollection.insertOne(jobPost);
      res.send(result);
    });

    // get  category by job and all job
    app.get("/api/v1/categories/:categoryName?", async (req, res) => {
      const categoryName = req.params.categoryName;
      // const query = { category: categoryName };
      let query = {};
      if (categoryName) {
        query.category = categoryName;
      }
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });

    // get specific job detail
    app.get("/api/v1/jobDetails/:job_id", async (req, res) => {
      const id = req.params.job_id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await categoriesCollection.findOne(query);
      res.send(result);
    });

    // get specific employer post job
    app.get("/api/v1/employer/showPostedJob", async (req, res) => {
      const email = req.query.email;
      const query = { employer_email: email };
      // console.log(query, email);
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });

    // employer delete post 
    app.delete("/api/v1/deleteJob/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const deleteJob = await categoriesCollection.deleteOne(query);
      res.send(deleteJob);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("job hub server is running --!");
});

app.listen(port, () => {
  console.log(`job hub running port ${port}`);
});
