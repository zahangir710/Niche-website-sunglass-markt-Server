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
    const reviewCollection = database.collection("review");

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
    // GET the selected product from DB (to Review)
    app.get("/products/:name", async (req, res) => {
      const name = req.params.name;
      const query = { name: name };
      const product = await productCollection.findOne(query);
      res.json(product);
    });
    // POST review in DB
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
    // GET review in Home page
    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.json(result);
    });
    // Make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);

      res.json(result);
    });
    // Load proaducts in Manage product page
    app.get("/admin/products", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.json(result);
    });
    // Delete a product by admin
    app.delete("/admin/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });
    // manage orders (get all orders)
    app.get("/orders", async (req, res) => {
      const orders = await orderCollection.find().toArray();
      res.json(orders);
      console.log(orders);
    });
    // Update order status
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const updatedStatus = req.body;
      console.log("updated status", updatedStatus, updatedStatus.status);
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: { status: updatedStatus.status },
      };
      const result = await orderCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.json(result);
    });
    // Cancel a Pending order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log(result);
      res.json(result);
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