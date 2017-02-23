const 	express = require('express'),
		
		app = express(),

		pg = require('pg'),

		pug = require('pug'),

		bodyParser = require('body-parser'),

		cookieParser = require('cookie-parser'),

		session = require('express-session')


var Sequelize = require('sequelize');

// creating a new database called blogapplication
var sequelize = new Sequelize('postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/blogapplication'); 

app.use(express.static('static'));

app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json()); 

app.set('views', './views'); 
app.set('view engine', 'pug');

// als je dit runt dan maak die automatisch de tabel aan omdat je dit al gelinkt hebt in de var sequelize

// var Message = sequelize.define('nameOfTable', {

// 	title: Sequelize.STRING,

// 	body: Sequelize.STRING

// }); 


// renders corresponding index.pug file
app.get ('/', (request, response) => {
	response.render('index');
});

// renders corresponding login.pug file
app.get ('/login', (request, response) => {
	response.render('login');
});

// renders corresponding signup.pug file
app.get ('/signup', (request, response) => {
	response.render('signup');
});

// renders corresponding addPost.pug file
app.get ('/addpost', (request, response) => {
	response.render('addPost');
});

// renders corresponding profile.pug file
app.get ('/profile', (request, response) => {
	response.render('profile');
});

// renders corresponding showPosts.pug file
app.get ('/allposts', (request, response) => {
	response.render('showPosts');
});

// create app.post for the login page. This is because the client has to fill in something on that page




sequelize
	.sync()

	.then(function(){

		app.listen(3000, () => {

			console.log('server has started');

		});

	})
