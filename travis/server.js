'use strict';

const fs = require('fs');
const express = require('express');
const pg = require('pg');
const PORT = process.env.PORT || 8081;
const app = express();

// DONE! TODO: Install and require the NPM package pg and assign it to a variable called pg.


// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString (connection string, containing protocol and port, etc.) is composed of additional information including user and password.
// const conString = 'postgres://USER:PASSWORD@HOST:PORT/DBNAME';
// For example...
const conString = 'postgres://travis:1234@localhost:3000/kilovolt'

// Mac:
// const conString = 'postgres://localhost:5432/kilovolt';

// Done TODO: Pass the conString into the Client constructor so that the new database interface instance has the information it needs

const client = new pg.Client(conString);
console.log('client =' + client);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app can parse the request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));



// REVIEW: Routes for requesting HTML resources
app.get('/new-article', (request, response) => {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to this route? Be sure to take into account how the request was initiated, how it was handled, and how the response was delivered. Which method of article.js, if any, is interacting with this particular piece of `server.js`? What part of CRUD, if any, is being enacted/managed by this particular piece of code?

  //RESPONSE: The corresponding numbers from the diagram in order are #2 which pertains to the app.get then #6 retrieves the file from the public directory and the #5 pertains to the response.sendFile. The route reads from from the public directory and then updates the view.  
  response.sendFile('new.html', { root: './public' });
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  //DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to this route? Be sure to take into account how the request was initiated, how it was handled, and how the response was delivered. Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  console.log('app.get happened')
  //RESPONSE: The numbers that apply to this are #1 #2 #3 #4 #5.  The user navigates to the aricles page #1, which automatically send a request to the server #2, the server queries the database #3,  which returns the results of the queries #4 and then the server returns the results to the browser #5. C.R.U.D steps being used her are Reads from database.   Presumably the client side result is an update of new.html but does not happen here.
  
  // let SQL = 'SELECT * FROM articles';
  client.query('')
  .then(function (result) {
    response.send(result.rows);
    console.log('.then happened');
    })
    .catch(function (err) {
      console.error(err);
    });
})

app.post('/articles', (request, response) => {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to this route? Be sure to take into account how the request was initiated, how it was handled, and how the response was delivered. Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //RESPONSE: The user submits an article #1, browser send a request to the server #2, who passses the request to the database which updates the table of articles #3.  C.R.U.D model steps being used are Reading, Creating, Updating.
  let SQL = `
    INSERT INTO articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
  `;

  let values = [
    request.body.title,
    request.body.author,
    request.body.authorUrl,
    request.body.category,
    request.body.publishedOn,
    request.body.body
  ]

  client.query(SQL, values)
    .then(function () {
      response.send('insert complete')
    })
    .catch(function (err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to this route? Be sure to take into account how the request was initiated, how it was handled, and how the response was delivered. Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?

  //RESPONSE: The user submits an updated article #1, browser send a request to the server #2, who passses the request to the database which overwrites the old article with the updated article #3.  C.R.U.D model steps being used are Reading, Creating, Updating and Deleting 

  let SQL = `
    UPDATE articles SET title =$1, author=$2, author_url=$3, category=$4, publishedOn=$5, body=$6
    VALUES ($1, $2, $3, $4, $5, $6);
    `;

  let values = [
    request.body.title,
    request.body.author,
    request.body.authorUrl,
    request.body.category,
    request.body.publishedOn,
    request.body.body
  ]

  client.query(SQL, values)
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to this route? Be sure to take into account how the request was initiated, how it was handled, and how the response was delivered. Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?

  // RESPONSE: #1 user deletes certain article, the users browser sends a request to the server #2, the server send a query to the database #3 which deletes the article.  C.R.U.D is being used to Delete data

  let SQL = `DELETE FROM articles WHERE article_id=$1;`;
  let values = [request.params.id];

  client.query(SQL, values)
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  //DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to this route? Be sure to take into account how the request was initiated, how it was handled, and how the response was delivered. Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //RESPONSE:#1 user deletes all articles, the users browser sends a request to the server #2, the server send a query to the database #3 which deletes all the articles.  C.R.U.D is being used to Delete data.

  let SQL = 'DROP TABLE';
  client.query(SQL)
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// DONE COMMENT: What is this function invocation doing?
// RESPONSE: This function is loading the database of articles.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to this route? Be sure to take into account how the request was initiated, how it was handled, and how the response was delivered. Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //RESPONSE: The user navigate to the index.html which triggers this function invocation #1, the page requests articles from the server #2, the server queries the database #3, the database sends the results back to the server #4, the server sends the results back to the browser #5, which presumably uses that data to update the page.  C.R.U.D is used to Read and Update.

  let SQL = 'SELECT COUNT(*) FROM articles';
  client.query(SQL)
    .then(result => {
      // REVIEW: result.rows is an array of objects that PostgreSQL returns as a response to a query.
      // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
      // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if (!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            let SQL = `
              INSERT INTO articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `;
            let values = [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body];
            client.query(SQL, values);
          })
        })
      }
    })
}

function loadDB() {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to this route? Be sure to take into account how the request was initiated, how it was handled, and how the response was delivered. Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //RESPONSE: User did something to trigger the loadDB invocation #1, whatever the user did causes a request to be sent to the server#2, the server queries the database which sends the results back #3 / #4, seeing no data in the database the server then queries the static public directory #6, and then send the results back to the database #3 updating the table,  the newly created table is then sent from the database to the server #4, who then returns it to the user #5.  C.R.U.D for this is Reading getting a value of Null and Creating.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`)
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}