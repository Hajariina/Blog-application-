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

Message.belongsTo(User);
Comment.belongsTo(User);
Comment.belongsTo(Message);

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
	Message.findAll({order:[['createdAt', 'DESC']], include: [User, Comment]})
	.then(function(result){
		console.log('now console logging the result')
		console.log(result[0].comments[0].userId)
		return result
	})
	.then(function(result){
		var allMessages = result;
		Comment.findAll({include: [User, Message]})
		.then(function(result){
			response.render('profile', {messages: allMessages, comments: result});
		})
	})
});

// app.get('/profilePage', (req, res) => {
// 	console.log(req.query.id)
// 	Post.findOne({
// 		where: {id: req.query.id}
// 	}).then(post => {
// 		res.render('oneSpecificPost', post)
// 	})
	
// })

// User.findAll()
// .then(function(result) {
// 	for(var i = 0; i < result.length; i++) {
// 		console.log(result[i].username)
// 		var userName = result[i].username
// 		app.get('/profile/' + userName, (req, res) => {
// 			console.log("now consolelogging result[0].username: ")
// 			console.log(this.username)
// 			console.log(result)
// 			Message.findAll({
// 				order:[['createdAt', 'DESC']], 
// 				include: [User, Comment]
// 			})
// 			.then(function(result){
// 				var allMessages = result;
// 				// console.log("now consolelogging userName again: " + )
// 				Comment.findAll({include: [User, Message]})
// 				.then(function(result){
// 					res.render('profile', {messages: allMessages, comments: result});
// 				})
// 			})
// 		})
// 	}
// })

// renders corresponding showPosts.pug file -- needs testing
app.get ('/allposts', (request, response) => {
	Message.findAll({order:[['createdAt', 'DESC']], include: [User, Comment]})
	.then(function(result){
		var allMessages = result;
		Comment.findAll({include: [User, Message]})
		.then(function(result){
			response.render('showPosts', {messages: allMessages, comments: result});
		})
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
		return User.create({
			username: "Hajar",
			password: "notsafe",
			email: "hajarthebest@gmail.com"
		})
	})
	.then(function(person){
		return person.createMessage({
			title: "We are the best programmers!",
			content: "Nobody is better than us! Maybe Jessy, but nobody else.",
		})
	})
	.then(function(){
		return User.create({
			username: "Jessy",
			password: "notsafe",
			email: "jessythebest@gmail.com"
		})
	})
	.then(function(person){
		return person.createComment({
			content: "Thanks :)",
			messageId: 1
		})
	})
	.then(function(){
		return User.create({
			username: "Melvin",
			password: "notsafe",
			email: "melvinthebest@gmail.com"
		})
	})
	.then(function(person){
		return person.createComment({
			content: "lol",
			messageId: 1
		})
	})
	.then(function(){
		Message.create({
			title: "Crazy testing",
			content: "fja joiaf jawkrl0",
			userId: 2
		})
	})
	.then(function(){
		Comment.create({
			content: "lol",
			messageId: 2,
			userId: 1
		})
	})	
	.then(function(){
		Message.create({
			title: "Teaching is awesome",
			content: "I love it so much!",
			userId: 3
		})
	})
	.then(function(){
		Comment.create({
			content: "And we love having you as a teacher",
			messageId: 3,
			userId: 1
		})
	})
	.then(function(){

		app.listen(3000, () => {

			console.log('server has started');

		});

	})
