module.exports = function (app, model) {

    var config   = app.get('config'),
        mongoose = app.get('mongoose');
        db       = app.get('db');

    var Schema = mongoose.Schema;
    
    var UserSchema = new Schema({

        username: {
            type    : String,
            required: true,
            unique  : true
        },

        password: {
            type    : String,
            required: true
        }

    });

    var UserModel = db.model('User', UserSchema);

    return UserModel;
}
