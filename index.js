const express= require('express');
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dyxrt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Sunglass_Markt");
    const productCollection = database.collection("products");

    // Add products to DB
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.json(result);
    });

    // GET products to client from home page
    app.get("/home/products", async (req, res) => {
      const result = await productCollection.find({}).limit(6).toArray();
      res.json(result);
    });
    // GET products to client from explore page
    app.get("/products", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.json(result);
      console.log(result);
    });
  } finally {
    // client.close();
  }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send("Server is running");
})

app.listen(port, ()=>{
    console.log("Listeninig to port :::", port);
})