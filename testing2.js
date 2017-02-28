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
				message: allMessages,
				comments: result,
				user: req.session.user
			}
			res.send(specificPost)
		})
	})
})