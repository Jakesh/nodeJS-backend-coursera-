const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const authenticate = require('./authenticate');
const config = require('./config');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter = require("./routes/dishRouter");
const promoRouter = require("./routes/promoRouter");
const leaderRouter = require("./routes/leaderRouter");
const uploadRouter = require("./routes/uploadRouter");
const favouriteRouter = require("./routes/favoritesRouter");
const commentRouter = require('./routes/commentRouter');
const Dishes = require("./models/dishes");

//MongoDB Connection. Always use new url parser.
const url = config.mongoUrl;
const connect = mongoose.connect(url, { useNewUrlParser: true });

connect.then((db) =>
{
	console.log("Connected to the MongoDB server");
}, (err) =>
{
	console.log(err);
});

var app = express();

// view engine setup
app.all('*', function(req, res, next){
	if(req.secure){
	  return next()
	};
	res.redirect('https://'+ req.hostname+':'+ app.get('secPort')+ req.url)
  });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser("123-456-789"));
/*app.use(session({
	name: "session-id",
	secret: "12345-67890-09876-54321",
	saveUninitialized: false,
	resave: false,
	store: new FileStore()
}));*/

//Passport Authentication
app.use(passport.initialize());
// app.use(passport.session());

//ROUTES. Index and Users route can be accessed before authentication part.
app.use('/', indexRouter);
app.use('/users', usersRouter);

//User authorization middleware
/*function auth(req,res,next)
{
	console.log(req.session);

	if(!req.user)
	{
	var err = new Error("You are not authenticated!");
	err.status = 403;
	return next(err);
	}

	else
	{
		next();
	}
	
}*/

// app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

//ROUTES. These routes can be accessed after the authentication part.
app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);
app.use("/imageUpload",uploadRouter);
app.use("/favorites",favouriteRouter);
app.use('/comments', commentRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
