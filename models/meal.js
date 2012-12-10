module.exports = function (app, model) {

    var config   = app.get('config'),
        mongoose = app.get('mongoose');
        db       = app.get('db');

    var Schema = mongoose.Schema;

    var MealSchema = new Schema({

        title: {
            type    : String,
            required: true
        },

        amount: {
            type   : Number,
            min    : config.meal.amount.min,
            max    : config.meal.amount.max,
            default: config.meal.amount.default
        },

        votes: {
            type   : Number,
            min    : config.meal.votes.min,
            default: config.meal.votes.default
        },

        created: {
            type   : Date,
            default: Date.now
        },

        updated: { 
            type   : Date, 
            default: Date.now 
        },

        image: {
            data: Buffer,
            contentType: String
        },

        deleted: {
            type: Boolean,
            default: false
        }
    });

    var MealModel = db.model('Meal', MealSchema);

    MealModel.schema.path('title').validate(function (value, respond) {
        respond(typeof value == 'string' && value !== '');
    }, 'Invalid title');

    return MealModel;
}
