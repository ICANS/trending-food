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
        }

    });

    var MealtimeModel = db.model('Mealtime', MealtimeSchema);

    return MealtimeModel;
}
