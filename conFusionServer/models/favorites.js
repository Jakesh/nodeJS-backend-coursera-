const mongoose = require('mongoose'),  
    Schema = mongoose.Schema,

    favoriteSchema = new Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        dishes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'
        }]
    }, {
        timestamps: true
    });

let Favorites = mongoose.model('favorite', favoriteSchema);

module.exports = Favorites;