const express = require('express'); // to use the express framework
const uuid = require('uuid'); // to use the uuid 
const MongoClient = require('mongodb').MongoClient; // to be able to use our database

const mongoURL = "mongodb+srv://Tester:TesterKey31120@webdev.crskge1.mongodb.net/?retryWrites=true&w=majority"; // the url for our database

const app = express();
const port = 3000; // the port of the server


app.use(express.json());

app.use((req, res, next) => {  // configure the cross origin resource string 
  res.header('Access-Control-Allow-Origin', '*'); // this header allows the cross origin request from our application
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); //this header allow the specified http methods for when we make a cross origin request
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // this header indicates which headers are permitted in the request


  if (req.method === 'OPTIONS') {// to handle the preflight requests
    res.status(200).end();
  } else {
    next();
  }
});


//For the Login Service
app.post('/login', async (req, res) => {
  const { username, password } = req.body; // get the username and password from the body of the request

  const client = new MongoClient(mongoURL); // open a client to our database

  try {

    await client.connect(); // connect the client
    const db = client.db('users'); //the database called users
    const usersCollection = db.collection('users'); //the collection called users

    const user = await usersCollection.findOne({ username }); //here we find the user which has the requested username

    if (user) { // if the user exusts

      if (user.password===password) { // we check the passwords if they match
        sessionId = uuid.v4(); // we use the uuid to generate a random session id
        await usersCollection.updateOne({ username },{$set:{lastsessionId:sessionId}}); // we save the session id to the database on the user
        console.log('Login successful!'); 
        res.status(200).json({ "sessionId": sessionId}); // we return a result of status 200 meaning the request has been fulfilled successfully
      } else {
        console.error('Invalid password'); 
        res.status(401).json({ error: 'Invalid password' }); // we return a status code of 401 meaning that the user has not been autorized and need to try again to login
      }
    } else {
      console.error('User not found'); 
      res.status(404).json({ error: 'User not found' }); // we return a 404 status that the user is not in the database
    }
  } catch (error) {
    console.error('Error during login:', error); 
    res.status(500).json({ error: 'Internal Server Error' }); // we return a status code of 500 because there was an error with our server
  } finally {
    await client.close();
  }
});

//For the Add to favourite service
app.post('/addFavourite', async (req, res) =>{
  const{rentalId,rentalTitle,description,cost,imageUrl,username,sessionId} = req.body; // the data from the request body
  const client = new MongoClient(mongoURL); // opening a client to our database
  try {

    await client.connect(); // connecting the client
    const db = client.db('users'); // the database users
    const usersCollection = db.collection('users');// the collection users

    const User = await usersCollection.findOne({ username }); // we find the user with the requested username
    if(User){
      if(User.lastsessionId===sessionId){ // if the session id that was passed in the request is the same with the last session id the user received when logged in 
        const existingAd = await usersCollection.findOne({username,'favoriteAds.rentalId': rentalId,}); // we search if the ad is in his list
        if(!existingAd){ // if its not 
          await usersCollection.updateOne({ username },{ $push: { favoriteAds: {rentalId,rentalTitle, description, cost, imageUrl}} }); // we add the information of the ad
          res.status(200).json({ success: true, message: 'Ad added to favorites successfully.' }); // we return a status code 200 informing the ad has been successfully added
        }else{
          await usersCollection.updateOne({username},{$pull:{favoriteAds:{rentalId}}});// we remove the ad 
          res.status(200).json({ success: true, message: 'Ad removed from favorites successfully.' }); // we return a status code 200 informing the ad has been successfully removed 
        }
      }else{
        res.status(403).message('The session id is not the same of the last login'); // we return a status code of 403 since the act is forbiddened form the unauthorized user
      }
    }else{
      req.status(401).message('The user cannot be found'); // we inform that there is no authorised user with that name
    }
  }finally{
    await client.close(); // we close the client
  }
});

//For the Favourite Retrieval Service
app.post('/favouriteRetrieval',async (req,res)=>{
  const {username,sessionId} = req.body; // the data of the request 
  const client = new MongoClient(mongoURL); // client on our database

  try{
    await client.connect(); // connect the client
    const db = client.db('users'); //the database users
    const usersCollection = db.collection('users'); // the collection users

    const User = await usersCollection.findOne({ username}); // we find the user

    if(User){ // if he exists
      if(User.lastsessionId===sessionId){ // we check the session id if it matches the one that was given to him the last time he logged in
        const favourites = User.favoriteAds; // the list with the favourite adds of the user
        res.status(200).json(favourites); //return a status code of 200 meaning a successful returning of the list
      }else{
        res.status(403).message('The session id is not the same of the last login'); // we inform that the service is forbiddened from the users since he hasnt been authorised
      }
    }else{
      res.status(401).message('The user cannot be found'); // there is no authorised user 
    }
  }finally{
    await client.close();
  }
});

app.listen(port, () => { // the server listens to the specified port
  console.log(`Server is running at http://localhost:${port}`);
});