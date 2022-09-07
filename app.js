let express = require("express"),
	methodOverride = require("method-override"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	expressSanitizer = require("express-sanitizer"),
	dotenv = require('dotenv'),
	app = express();
//App Config
dotenv.config()
mongoose
	.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("Mongo Connected"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
//below body parser
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Mongoose Config
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	lastModified: { type: Date, default: () => Date.now() }
});
var Blog = mongoose.model("Blog", blogSchema);

//Restful Blog app
app.get("/", function (req, res) {
	res.redirect("/blogs");
});
//index
app.get("/blogs", function (req, res) {
	Blog.find({}, function (err, blogs) {
		if (err) {
			console.log("Error");
		} else {
			res.render("index", { blogs: blogs });
		}
	});
});
//new
app.get("/blogs/new", function (req, res) {
	res.render("new");
});

//create
app.post("/blogs", function (req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function (err, newblog) {
		if (err) {
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

//show
app.get("/blogs/:id", function (req, res) {
	Blog.findById(req.params.id, function (err, foundBlog) {
		if (err) {
			res.send("Erroe");
		} else {
			res.render("show", { blog: foundBlog });
		}
	});
});

//edit
app.get("/blogs/:id/edit", function (req, res) {
	Blog.findById(req.params.id, function (err, foundBlog) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.render("edit", { blog: foundBlog });
		}
	})
});

//update
app.put("/blogs/:id", function (req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	})
});

//destroy
app.delete("/blogs/:id", function (req, res) {
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function (err) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	})
});

app.listen(process.env.PORT, function () {
	console.log("Blog App has Started");
});


