const 	express = require('express'),
		
		app = express(),

		pg = require('pg'),

		bodyParser = require('body-parser'),

		cookieParser = require('cookie-parser'),

		session = require('express-session')


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
	response.render('index');
});

// renders corresponding login.pug file
app.get ('/login', (request, response) => {
	response.render('login');
});

//not sure if I have to put bodyparser here again
app.post('/login', function (req, res) {
	console.log(req.body.name)
    if(req.body.name.length === 0) {

        res.redirect('/?message=' + encodeURIComponent("Please fill out in your username."));

        return;

    }

    if(req.body.password.length === 0) {

       res.redirect('/?message=' + encodeURIComponent("Please fill out your password."));

       return;

   }

   sequelize.User.findOne({ //blogapplication should be the name of the database

    where: {

		username: req.body.username,

		password: req.body.password

    }

  })

  .then (function (user) {

    if (user !== null && req.body.password === user.password) {

      req.session.user = user;

      res.redirect('/profile'); //redirect to the allPosts or Profile 

    }

    else {

            res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));

        }

    }, function (error) {

        res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));

    });


	User.findOne({
		where: {
			username: req.body.username
		}
	}).then(function(user){
		console.log(user)
		if(req.body.password === user.password) {
			req.session.user = user;
			res.redirect('/profile')
		} else {
			res.redirect('/login/?message=' + encodeURIComponent("Invalid username or password."))
		}
	})
})

// renders corresponding signup.pug file
app.get ('/signup', (request, response) => {
	response.render('signup');
});

//posts request formulier naar database which is stored in sequelize.

app.post('signup', function(req, res){
	console.log('signup post request is working')  //testing purposes
	sequelize.User.create({ //changed to database name
		username: req.body.username,
		password: req.body.password,
		email: req.body.email
	})
	.then(()=>{
		res.redirect('/login'); 
	})
});

// renders corresponding addPost.pug file
app.get ('/addpost', (req, res) => {
	const userSession = req.session.user;
	res.render('addPost', {user:userSession});
});


app.post('/allposts', (req, res) => {
	// console.log('checking what is insinde sequelize.Post')
	// console.log (sequelize.Post)
	console.log(req.session.user)
	Message.create ({
		title: req.body.title,
		content: req.body.content,
		userId: req.session.user.id

	})

	.then(function(){
		res.redirect('/allPosts');
	});
});

/* app.post('/addpost', (req, res) => {
	let userTitleInput = req.body.title;
	let userMessageInput = req.body.message;
	let user = req.session.user;
	console.log(user);
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to create a post."));
	} 
	else {
		User.findById(user.id).then(function(user){
			user.createPost({
				title: req.body.titleInput,
				body: req.body.messageInput
			})
			.then(function(post) {
				console.log('redirecting to allPosts')
				res.redirect('allPosts');
			})
		})
		
	}
});*/

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


// logout --- this still needs work(pug file etc.), talk to lisa about it


app.get('/logout', function (req, res) {

  req.session.destroy(function (error) {

    if(error) {

        throw error;

    }

      res.redirect( '/?message=' + encodeURIComponent("Succesfully logged out.") );

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
