module.exports = function (app, model) {

    var config   = app.get('config'),
        mongoose = app.get('mongoose');
        db       = app.get('db');

    var Schema = mongoose.Schema;

    var FavoriteSchema = new Schema({

        user: {
            type    : Schema.Types.ObjectId,
            ref     : 'User',
            required: true
        },

        meal: {
            type    : Schema.Types.ObjectId,
            ref     : 'Meal',
            required: true
        },

        created: {
            type    : Date,
            default : Date.now
        }
    });

    return db.model('Favorite', FavoriteSchema);
}
