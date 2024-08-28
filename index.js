const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()
const Port = 3000;

const corsOptions = {
    origin: 'https://phone-store-5ff48.web.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, 
  };

app.use(express.json());
app.use(cors(corsOptions));


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t87ip2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        
     const phoneCollection = client.db("phone-store").collection("phones");
     const cartCollection = client.db("phone-store").collection("carts");
     const ReviewCollection = client.db("phone-store").collection("review");

    


     app.get('/phones', async(req , res)=>{
        const data = phoneCollection.find()
        const result = await data.toArray()
        res.send(result)
     })


     app.get('/sort/:id', async(req,res)=>{
        const id = req.params.id
        if(id == "LowToHigh"){
          const result = await phoneCollection.find().sort({price : 1}).toArray();
          res.send(result)
          return
        }
        if(id == "highToLow"){
          const result = await phoneCollection.find().sort({price : -1}).toArray();
          res.send(result)
          return
        }
     
    
      })

      app.post('/phones',async(req,res)=>{
        const data = req.body
        const result = await phoneCollection.insertOne(data)
        res.send(result)
      })

      app.post('/cart', async(req,res)=>{
        const data = req.body
        const result = await cartCollection.insertOne(data)
        res.send(result)
      })

      app.get('/cart', async(req,res)=>{
        const email =req.query.email;
        const query = {email : email}
        const cartData = cartCollection.find(query)
        const result = await cartData.toArray()
        res.send(result)
      })

      app.delete('/cart/:id', async(req,res)=>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await cartCollection.deleteOne(query)
        res.send(result)
      })

      app.get('/cart/:id', async(req,res)=>{
        const id = req.params.id;
        const query ={_id : new ObjectId(id)}
        const result = await cartCollection.findOne(query)
        res.send(result)
      })
      app.put('/cart/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const updatedCart = req.body;

        const cart = {
            $set: {
                name: updatedCart.name, 
                photo: updatedCart.photo,
                brand: updatedCart.brand,
                processor: updatedCart.processor,
                price: updatedCart.price,
                info: updatedCart.info,
                rating: updatedCart.rating,
            }
        }

        const result = await cartCollection.updateOne(filter, cart, options);
        res.send(result);
    })


    app.post('/review', async(req,res)=>{
      const data = req.body
      const result = await ReviewCollection.insertOne(data)
      res.send(result)
    })
   

    




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get("/", async (req, res) => {
    res.send({ message: "Welcome to our server" });
});

app.listen(Port, () => {
    console.log(`Server is running at ${Port}`);
});