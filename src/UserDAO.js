const MongoClient = require('mongodb').MongoClient;

const mongoURL = "mongodb+srv://Tester:TesterKey31120@webdev.crskge1.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'users';

async function initializeUsers() {
  const client = new MongoClient(mongoURL);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    // Create a collection for users
    const usersCollection = db.collection('users');

    const usersToInsert = [
      {
        username: 'user1',
        password: "auniquepassword",
        lastsessionId: null,
        favoriteAds: [],
      },
      {
        username: 'user2',
        password: "anotheruniquepassword",
        lastsessionId: null,
        favoriteAds: [],
      },
      {
        username: 'tester',
        password: "password",
        lastsessionId: null,
        favoriteAds: [],
      },
    ];

    for (const user of usersToInsert) {
      const existingUser = await usersCollection.findOne({ username: user.username });

      if (!existingUser) {
        await usersCollection.insertOne(user);
        console.log(`User ${user.username} inserted successfully`);
      } else {
        console.log(`User ${user.username} already exists, skipping insertion`);
      }
    }

    console.log('Users initialization completed');
  } 
  catch(error){
    console.log('There was an error with the initialization');
    console.log(error);
  }
  finally {
    await client.close();
  }
}

initializeUsers();

