module.exports = function (app, model) {

    var config   = app.get('config'),
        mongoose = app.get('mongoose');
        db       = app.get('db');

    var Schema = mongoose.Schema;

    var OrderSchema = new Schema({

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

        mealtime: {
            type    : Schema.Types.ObjectId,
            ref     : 'Mealtime',
            required: true
        },

        created: {
            type    : Date,
            default : Date.now
        },

        updated: {
            type    : Date,
            default : Date.now
        },

        deleted: {
            type    : Boolean,
            default : false
        }
    });

    var OrderModel = db.model('Order', OrderSchema);

    return OrderModel;
}
