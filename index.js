const express= require('express');
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
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
    const usersCollection = database.collection("users");
    const cartCollection = database.collection("cart");
    const orderCollection = database.collection("order");

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
    });
    // Add users in DBcollection
    app.post("/users", async (req, res) => {
      const user = req.body;

      const result = await usersCollection.insertOne(user);

      res.json(result);
    });
    // Add products to cart
    app.post("/cart", async (req, res) => {
      const product = req.body;
      const result = await cartCollection.insertOne(product);

      res.json(result);
    });

    // Get product from cart
    app.get("/cart", async (req, res) => {
      let query = {};
      const email = req.query.email;

      if (email) {
        query = { email: email };
      }
      const result = await cartCollection.find(query).toArray();

      res.json(result);
    });

    // Detele an item from the cart
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cartCollection.deleteOne(query);

      res.json(result);
    });
    // Post order in DB
    app.post("/orders", async (req, res) => {
      orderDetails = req.body;
      const result = await orderCollection.insertOne(orderDetails);
      res.json(result);
    });
    // Delete products from cart
    app.delete("/cart", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartCollection.deleteMany(query);
      res.json(result);
    });
    // Check admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    //GET my orders from DB
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const myOrders = await orderCollection.find(query).toArray();
      res.json(myOrders);
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