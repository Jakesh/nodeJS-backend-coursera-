const 
    express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    Favorites = require('../models/favorites'),
    authenticate =require('../authenticate'),
    cors = require('./cors'), 
    favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());
favoritesRouter.route('/').options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => { 
    Favorites.findOne({user: req.user._id}).populate('user').populate('dishes').then((favorites) => {
        res.StatusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, 
    (err) => next(err)
    ).catch((err) => next(err));
}).post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}).then((favorites) => {
        if(favorites !== null) {
            for(let i = 0; i < req.body.length; i++) {
                if(favorites.dishes.indexOf(req.body[i]._id) < 0) {
                    favorites.dishes.push(req.body[i]._id);
                }
            }
            favorites.save().then((favorite) => {
                Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
                    res.StatusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            }, (err) => next(err));
        } else {
            Favorites.create({user: req.user._id}, (err, favorites) => {
                if (err) {
                    res.statusCode = 403;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err: err});
                }
                for(let i = 0; i < req.body.length; i++) {
                    favorites.dishes.push(req.body[i]._id);
                }
                favorites.save().then((favorite) => {
                    Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
                        res.StatusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                }, (err) => next(err));
            });
        }
    }, 
    (err) => next(err)
    ).catch((err) => next(err));
}).delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user._id}).then((resp) => { 
        res.StatusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, 
    (err) => next(err)
    ).catch((err) => next(err));
});

favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id}).then((favorites) => {
        if(!favorites)
        {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else
        {
            if(favorites.dishes.indexOf(req.params.dishId) < 0)
            {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else
            {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }
    }, (err) => next(err)).catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}).then((favorites) => {
        if(favorites === null) {
            Favorites.create({user: req.user._id}, (err, favorites) => {
                if (err) {
                    res.statusCode = 403;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err: err});
                }
                favorites.dishes.push(req.params.dishId);
                favorites.save().then((favorite) => {
                    Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
                        res.StatusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                }, (err) => next(err));
            }); 
        } else {
            if(favorites.dishes.indexOf(req.params.dishId) === -1) {
                favorites.dishes.push(req.params.dishId);
            }
            favorites.save().then((favorite) => {
                Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
                    res.StatusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            }, (err) => next(err));
        }
    });
}).delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}).then((favorite) => {
        if(favorite != null) {
            if(favorite.dishes.indexOf(req.params.dishId) !== -1) {
                favorite.dishes.splice(favorite.dishes.indexOf(req.params.dishId), 1);
                favorite.save().then((favorite) => {
                    Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
                        res.StatusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                }, (err) => next(err));
            }
        } else {
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({"res": "No dishes have been added to the list of favorites, yet."});
        }
    }, 
    (err) => next(err)
    ).catch((err) => next(err));
})

module.exports = favoritesRouter;