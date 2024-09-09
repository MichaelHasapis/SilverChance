//this is the method we call for the login

async function login() {
    const username = document.getElementById('username').value; //gets the value of the field of username on our login form
    const password = document.getElementById('password').value; // gets the value of the field of password on our login form 
    const loginMessage = document.getElementById('loginMessage'); //get the login message item

    if(!username.trim()){// if the username is empty
      document.getElementById('username').reportValidity(); //prevents the function to continue and displays a please fill in message
      return;
    }else if(!password.trim()){//if the password is empty 
      document.getElementById('password').reportValidity();  //prevents the function to continue and displays a please fill in message
      return;
    }

    const url = 'http://localhost:3000/login'; //the url of our we want to hit with fetch
    try {
      const response = await fetch(url, { 
        method: 'POST',//we specify which http method we want to use 
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ username, password }), // the data we want to pass to the service
      });

      const data = await response.json(); //here we save the data that our server has return

      if (response.ok) { // if the request has been fulfilled successfully
        console.log('Login successful!');
        sessionStorage.setItem('username',username); // we save the username to our session storage
        sessionStorage.setItem('sessionId',data.sessionId); // we save the sessionid to our session storage
        loginMessage.textContent = 'Hello '+ username +' you have successfully logged in!';
        loginMessage.style.backgroundColor = 'darkpink';
        loginMessage.style.border = '2px inset #8a2264';
        loginMessage.style.textAlign = 'center';
        loginMessage.style.display = 'block';
        getS();

      } else if (response.status===404) { // the user does not exist in our database
        alert("There is no user with that username");
      }else if(response.status===401){ // the password was not correct
        alert("Incorrect password please try again");
      }
    } catch (error) { //catches any other error during the login 
      console.error('Error during login:', error);
    }
}

function logout(){ // method to log out
  if(sessionStorage.getItem('username')!==null){
    sessionStorage.clear(); // we delete the user and the session id from our session storage
    loginMessage.style.display = 'none';
    alert("You have successfully logged out");
    location.reload()
  }
  
}

async function addFavorite(rentalId,rentalTitle,description,cost,imageUrl,username,sessionId,page = false) {  // our method for adding a rental to a users favourite list
  if (sessionId===null) { // if the user has not been verified
    alert("You have not been verfied please log in");
    console.error('Not verified');
  }else{
    const url = 'http://localhost:3000/addFavourite'; //the url of the service 
    const requestData = {
      method: 'POST', // the http method we want to use
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ // data that we pass to the service
        rentalId,
        rentalTitle,
        description,
        cost,
        imageUrl,
        username,
        sessionId,
      }),
    };

    try {
      const response = await fetch(url, requestData); // we save the response of the server

      if (response.ok) { // if our request was fulfilled successfully
        const responseData = await response.json(); 
        alert(responseData.message); // we notify the user that has either added or removed the ad from his list
        console.log('Favorite added successfully:', responseData);
        if(page) {
          location.reload();
        }
      } else {
        const errorData = await response.json();  
        alert(errorData.error); // we notify the user that there was an error with adding or removing the add
        console.error('Failed to add favorite:', errorData.error);
      }
    } catch (error) { 
      console.error('Error during fetch:', error);
    }
  }  
}

async function getFavourite(username,sessionId){ // our method for getting the list of favourite ads of a user
  
  if (sessionId===null) { // if the user is not verified
    alert("You have not been verfied please log in"); //we inform him to log in
    console.error('Not verified');
  }else{
    const url = 'http://localhost:3000/favouriteRetrieval';  //the url of the service 
    const requestData = {
      method: 'POST', // the http method we want to use
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ // the data we want to pass on our service
        username,
        sessionId,
      }),
    };
    try{
      const response = await fetch(url,requestData); // the response of our request
      const data = await response.json(); 
      if(response.ok){ // if the request has been fulfilled successfully
        console.log(data); 
        return data; // we return the data
      }else{
        alert("There has been a problem with retrieving the data"); // we inform the user that there was an error with retrieving the data
      }
    }catch(error){
      console.log(error);
    }
  }
}





// PX1

function findex() { // The function which is called with onload on index body tag

  fetch("https://wiki-ads.onrender.com/categories") // fetch in wikiads
      .then(response => response.json()) // The return data

      .then(categories => { // Manupulate the data
              const template = document.getElementById('sc').innerHTML; // Gets the handlebars template
              const cate = Handlebars.compile(template); // Compile the handlerbars template

              const showc = (category) => { // The fetch to get the subcategories in each category
                  return fetch(`https://wiki-ads.onrender.com/categories/${category.id}/subcategories`)
                      .then(response => response.json())
                      .then(subcategories => {

                          category.img_url = "https://wiki-ads.onrender.com/" + category.img_url // Make the link whole
                          const html = cate({categories: [{...category, subcategories}]}); // We put in index body the categories list and each subcategory

                          return html;
                      })
              }
              return Promise.all(categories.map(showc));
      })
      .then(bd => {
          document.querySelector(".categories").innerHTML = bd.join('');
      })

      .catch(error => { // If something goes wrong
          console.error('Fetch error:', error); // error
      });

}




function fcat() { // The function which is called with onload on category body tag

  const url = new URL (window.location.href) // We get the url
  const searchParams = url.searchParams; // We seperate the address from the parameters
  var id = searchParams.get("id"); // Gets the id value

  fetch("https://wiki-ads.onrender.com/subcategories") // The fetch to get all the subcategories
  .then(response => response.json()) // The return data
  .then(sc => { // Manupulate the data
      const template = document.getElementById('s').innerHTML; // Gets the handlebars template
      const cate = Handlebars.compile(template); // Compile the handlerbars template

      const filteredSc = sc.filter(s => s.category_id === parseInt(id)); // We filter the subcategories to have only the onces which is sub from the picked category

      document.querySelector('.rad').innerHTML += cate({ss: filteredSc}); // Put the ratio buttons

  })
  .catch(error => {
      console.error('Fetch error:', error); // error
  });


  fetch("https://wiki-ads.onrender.com/ads?category=" + id) // The fetch to get the ads
      .then(response => response.json()) // The return data
      .then(ads => {

          Handlebars.registerHelper('0', array => { // We have create a helper
            return Array.isArray(array) ? "https://wiki-ads.onrender.com/" + array[0] : ''; // The helper sees the 0 before the images and returns the first image of the list with the whole link
          });
          
          allAds = ads; // Create a list with all the ads of the category
          showAds(allAds); // Calls the function which puts the ads in the html
      })

      .catch(error => {
          console.error('Fetch error:', error); // error
      });

}


function showAds(filteredAds) { // The function to load the ads in the html
  const template = document.getElementById('c').innerHTML; // Gets the handlebars template
  const cate = Handlebars.compile(template); // Compile the handlerbars template

  if(filteredAds.length === 0){ // If no ads exist for the spesific sub/category
    document.querySelector('.adsHandle').innerHTML = '<h1>NO ADS FOUND</h1>' // Puts this message in the page
  }else{
    document.querySelector('.adsHandle').innerHTML = cate({ad: filteredAds}); // Loads the selected ads in the page
  }
}

function selectSubcat(id) { // The function which is called everytime a subcategory filter ratio button is clicked
  if(id === 0){ // If the id = 0 then is the default value to show all the subcategories or the user has select all
    filteredAds = allAds; // Return all ads
  }else{
    filteredAds = allAds.filter(s => s.subcategory_id === parseInt(id)); // Return the ads from a specific subcategory
  }

  showAds(filteredAds); // Calls the showAds to load the ads in the html page with the selected ads
}



function getS() { // Loads the username and the sessionId in the url from the category to adfavorite page
  const template = document.getElementById('ff').innerHTML; // Gets the handlebars template
  const cate = Handlebars.compile(template); // Compile the handlerbars template
  document.querySelector('.favs').innerHTML = cate({un: sessionStorage.getItem('username'), sid: sessionStorage.getItem('sessionId')}); // Puts an a tag with the url
}

function fsubcat() { // The function which is called with onload on subcategory body tag

  const url = new URL (window.location.href)
  const searchParams = url.searchParams;
  var id = searchParams.get("id");

  fetch("https://wiki-ads.onrender.com/ads?subcategory=" + id)
      .then(response => response.json())
      .then(ads => {
          const template = document.getElementById('subc').innerHTML;
          const cate = Handlebars.compile(template);

          for(a of ads) { // Loops all the ads
              var tab = []
              
              var f = a.features
              var tr = f.replace(/[^;]/g, "").length // tr is the how many properties(rows) the table will have
              var ftrs = []

              for(var i = 0; i <= tr; i++){
                  if(i === tr){ // For the last item which has not a semicolon
                      ftrs.push(f);
                  }else{
                      ftrs.push(f.slice(0, f.indexOf(";"))); // Push every key with his value
                  }
                  f = f.substr(f.indexOf(";") + 2) // The +2 is for the semicolon and the space after
              }
              
              for(f of ftrs){ // Now loops the list which every item is a pair of key and value exept the boolean onces
                  if(f.includes(":") != 0){ // If is a key value type
                      var ob = { // Creates an object with a key and a value in different variables 
                          k: f.substr(0, f.indexOf(":")), // The key
                          v: f.substr(f.indexOf(":") + 1), // The value
                      };
                  }else{ // If its a boolean type
                      var ob = {
                          k: f.substr(0), // from the start until the end
                          v: "NAI", // We have choose to have as value NAI for the 2nd column of the table
                      };
                  }
                  tab.push(ob);
              }
              a.tb = [tab];
          }

          document.getElementById('adsContainer').innerHTML += cate({ad: ads}); // Loads everything in the page
      })

      .catch(error => {
          console.error('Fetch error:', error); // error
      });

}



async function ffav() { // The function which is called with onload in the body tag in the favorites page, the function is async because we call the getFavorite function which need to return the data
  const url = new URL (window.location.href)
  const search = url.search;
  var un = search.slice(search.indexOf("username=") + 9, search.indexOf("&")) // Gets the username from the url
  var sid = search.slice(search.indexOf("&") + 11) // Gets the sessionId from the url

  // console.log(un)
  // console.log(sid)

  const template = document.getElementById('fads').innerHTML; // Gets the handlebars template
  const cate = Handlebars.compile(template); // Compile the handlerbars template


  var fads = await getFavourite(un,sid); // We use the await to wait for the data from the getFavorite because the function is async

  // console.log(fads);

  Handlebars.registerHelper('0', array => { // We have create a helper
      return Array.isArray(array) ? "https://wiki-ads.onrender.com/" + array[0] : ''; // The helper sees the 0 before the images and returns the first image of the list with the whole link
  });

  document.querySelector('.carR').innerHTML += cate({ad:fads}); // Loads everything



}

function getUnSi() { // We use this funtion in the onlick when we add/remove items from our favorites to get the username and sessionId
  const url = new URL (window.location.href)
  const search = url.search;
  var un = search.slice(search.indexOf("username=") + 9, search.indexOf("&"))
  var sid = search.slice(search.indexOf("&") + 11)

  return [un, sid] // We return a list and we get the items with getUnSi()[0] and getUnSi()[1]
}


