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

// table users
var User = sequelize.define('user', {
	username: Sequelize.STRING,
	password: Sequelize.STRING,
	email: Sequelize.STRING
})

// table messages
var Message = sequelize.define('message', {
	title: Sequelize.STRING,
	content: Sequelize.STRING(500),
})

// table comments
var Comment = sequelize.define('comment', {
	content: Sequelize.STRING
})

//In Message table the attribute userID is now created:
User.hasMany(Message);
//In Comment table the attribute userID is now created
User.hasMany(Comment);
//In Comment table the attribute messageID is now created:
Message.hasMany(Comment);


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

// renders corresponding showPosts.pug file -- needs testing
app.get ('/allposts', (request, response) => {
	Message.findAll({order:[['createdAt', 'DESC']]})
	.then(function(result){
		response.render('showPosts', {messages: result});
	})
});

// post a new message -- needs testing
app.post('/allposts', (request, response) => {
	Message.create({
		title: request.body.title,
		content: request.body.content,
		userId: request.session.user
	})
	.then(function(){
		response.redirect('allposts')
	})
})

// create app.post for the login page. This is because the client has to fill in something on that page




sequelize
	.sync({force:true})
	.then(function(){
		User.create({
			username: "Hajar",
			password: "notsafe",
			email: "hajarthebest@gmail.com"
		})
	})
	.then(function(){
		Message.create({
			title: "We are the best programmers!",
			content: "Nobody is better than us! Maybe Jessy, but nobody else.",
			userId: 1
		})
	})
	.then(function(){
		User.create({
			username: "Jessy",
			password: "notsafe",
			email: "jessythebest@gmail.com"
		})
	})
	.then(function(){
		Comment.create({
			content: "Thanks :)",
			messageId: 1,
			userId: 2
		})
	})
	.then(function(){
		User.create({
			username: "Melvin",
			password: "notsafe",
			email: "melvinthebest@gmail.com"
		})
	})
	.then(function(){
		Comment.create({
			content: "lol",
			messageId: 1,
			userId: 3
		})
	})
	.then(function(){

		app.listen(3000, () => {

			console.log('server has started');

		});

	})
