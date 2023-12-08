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
    const biddingCollection = client
      .db("jub-hub")
      .collection("biddingCollection");

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

    // employer specific delete job
    app.delete("/api/v1/deleteJob/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const deleteJob = await categoriesCollection.deleteOne(query);
      res.send(deleteJob);
    });

    // employer specific update job
    app.put("/api/v1/updateJob/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateJobInfo = req.body;
      console.log(updateJobInfo);
      const updated = {
        $set: {
          employer_email: updateJobInfo.employer_email,
          job_title: updateJobInfo.job_title,
          deadline: updateJobInfo.deadline,
          category: updateJobInfo.category,
          min_price: updateJobInfo.min_price,
          max_price: updateJobInfo.max_price,
          description: updateJobInfo.description,
        },
      };
      const result = await categoriesCollection.updateOne(
        filter,
        updated,
        options
      );
      res.send(result);
    });

    // buyer bidding info send database
    app.post("/api/v1/buyer/biddingJob", async (req, res) => {
      const biddingInfo = req.body;
      const result = await biddingCollection.insertOne(biddingInfo);
      res.send(result);
    });

    // find specific buyerBidding job
    app.get("/api/v1/buyer/myBids", async (req, res) => {
      const buyerEmail = req.query.email;
      const query = { buyer_email: buyerEmail };
      const result = await biddingCollection.find(query).toArray();
      res.send(result);
    });
    // find specific employer bid request job
    app.get("/api/v1/employer/bidRequests", async (req, res) => {
      const employerEmail = req.query.email;
      const query = { employer_email: employerEmail };
      const result = await biddingCollection.find(query).toArray();
      res.send(result);
    });

    // bidding job status update
    app.patch("/api/v1/biddingJob/UpdateStatus/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateStatus = req.body;
      // console.log(updateStatus.status);
      const updated = {
        $set: {
          status: updateStatus.status,
        },
      };
      const result =await biddingCollection.updateOne(filter, updated);
      res.send(result);
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
