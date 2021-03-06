const 	express = require('express'),
		
		app = express(),

		pg = require('pg'),

		bodyParser = require('body-parser'),

		cookieParser = require('cookie-parser'),

		session = require('express-session'),
		bcrypt = require('bcrypt')


var Sequelize = require('sequelize');

// creating a new database called blogapplication
var sequelize = new Sequelize('postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/blogapplication'); 

app.use(express.static('static'));
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json()); 

//view engine setup
app.set('views', './views'); 
app.set('view engine', 'pug');

//session

app.use(session({
	secret: 'insert random secret in here',
	resave: true,
	saveUninitialized: false
}));


// als je dit runt dan maak die automatisch de tabel aan omdat je dit al gelinkt hebt in de var sequelize
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
	response.render('index', {user: request.session.user});
});

// renders corresponding login.pug file
app.get ('/login', (request, response) => {
	response.render('login', {user: request.session.user});
});

//not sure if I have to put bodyparser here again
app.post('/login', (req, res) => {
	console.log(req.body.username)
	if (req.body.username.length === 0){
		res.redirect('/login/?message=' + encodeURIComponent("Please fill out your username."))
	}
	if (req.body.password.length === 0){
		res.redirect('/login/?message=' + encodeURIComponent("Please fill out your password."))
	}

	User.findOne({
		where: {
			username: req.body.username
		}
	}).then(function(user){
		console.log(user)
		bcrypt.compare(req.body.password, user.password, function(err, result) {
			if(result === true) {
				req.session.user = user;
				res.redirect('/profile/'+user.username)
			} else {
				res.redirect('/login/?message=' + encodeURIComponent("Invalid username or password."))
			}
		})
	})
})

// renders corresponding signup.pug file
app.get ('/signup', (request, response) => {
	response.render('signup', {user: request.session.user});
});

//posts request formulier naar database which is stored in sequelize.

app.post('/signup', function(req, res){
	console.log('signup post request is working')  //testing purposes
	bcrypt.hash(req.body.password, 8, function(err, hash) {

		User.create({ //changed to database name
			username: req.body.username,
			password: hash,
			email: req.body.email
		})
	
	.then(()=>{
		res.redirect('/login'); 
	})
	})
});

// renders corresponding addPost.pug file
app.get ('/addpost', (req, res) => {
	res.render('addPost', {user:req.session.user});
});

app.post('/allposts', (req, res) => {
	// console.log('checking what is insinde sequelize.Post')
	// console.log (sequelize.Post)
	// console.log(req.session.user)
	Message.create ({
		title: req.body.title,
		content: req.body.content,
		userId: req.session.user.id
	})
	.then(function(){
		res.redirect('/allPosts');
	});
});

app.get('/post/:postId', (req, res) => {
	Message.findOne({
		where: {id: req.params.postId},
		include: [User, Comment]
	})
	.then((result)=>{
		var allMessages = result;
		Comment.findAll({
			include: [User, Message],
		})
		.then((result) => {
			var specificPost = {
				messages: allMessages,
				comments: result,
				user: req.session.user
			}
			console.log(allMessages.user.username)
			res.render('post', specificPost)
		})
	})
})


app.post('/postcomment/:postId', (req, res) =>{
	console.log(req.body.comment);
	console.log(req.session.user.id);
	console.log(req.params.postId) //2
	Comment.create({ //changed to database name
		content: req.body.comment,
		userId: req.session.user.id,
		messageId: parseInt(req.params.postId) 
	})
	.then(()=>{
		res.redirect('/post/' + req.params.postId); 
	})
})

// renders corresponding profile.pug file
app.get ('/profile/:userName', (request, response) => {
	User.findOne({
		where: {username: request.params.userName},
		include: [Message, Comment]
	})
	.then(function(user){
		console.log(user)
		if (user === null){
			response.redirect('/notexist')
		} 
		var userURL = user
		Message.findAll({
			order:[['id', 'DESC']], 
			include: [User, Comment],
			where: {userId: user.id}
		})
		.then(function(result){
			// console.log('now console logging the result')
			// console.log(result[0].comments[0].userId)
			var allMessages = result;
			Comment.findAll({include: [User, Message]})
			.then(function(result){
				response.render('profile', {profileOfUser: userURL, messages: allMessages, comments: result, user: request.session.user});
			})
		})
	})
});

app.get('/notexist', (req, res) =>{
	res.render('notexist')
})

// renders corresponding showPosts.pug file -- needs testing
app.get ('/allposts', (request, response) => {
	Message.findAll({order:[['createdAt', 'DESC']], include: [User, Comment]})
	.then(function(result){
		var allMessages = result;
		Comment.findAll({include: [User, Message]})
		.then(function(result){
			response.render('showPosts', {messages: allMessages, comments: result, user: request.session.user});
		})
	})
});


// logout --- this still needs work(pug file etc.), talk to lisa about it


app.get('/logout', function (req, res) {

  req.session.destroy(function (error) {

    if(error) {

        throw error;

    }
      res.render('logout');

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
			content: "You go girl",
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
