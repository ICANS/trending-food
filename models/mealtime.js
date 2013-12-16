module.exports = function (app, model) {

    var config   = app.get('config'),
        mongoose = app.get('mongoose');
        db       = app.get('db');

    var Schema = mongoose.Schema;

    var MealtimeSchema = new Schema({

        id: {
            type    : String,
            required: true
        },

        title: {
            type    : String,
            required: true
        },

        date: {
            type    : Date,
            required: true
        },

        minutesBeforeLock : {
            type    : Number,
            default : config.mealtime.minutesBeforeLock.default
        }

    });

    var MealtimeModel = db.model('Mealtime', MealtimeSchema);

    return MealtimeModel;
}
