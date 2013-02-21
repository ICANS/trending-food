var config  = require('../config'),
    request = require('request'),
    vows    = require('vows'),
    assert  = require('assert');

var testDomain = config.url;

var crypto = require('crypto');
var shasum = crypto.createHash('sha1');

shasum.update('test');

var testNow      = (new Date()).getTime();
var testTomorrow = testNow + (24 * 60 * 60 * 1000);

var testMealtimeIdString = 'B1';
var testMealtimeTitle    = '12:30';

var testUserID   = '';
var testUsername = Math.ceil(Math.random() * 1000) + '@' + Math.ceil(Math.random() * 1000) + '.com';
var testPassword = 'test';
var testPasswordCheck = shasum.digest('hex');

var testMealID      = '';
var testMealtimeID  = '';
var testOrderID     = '';

var testMealCount = null;
var testOrderCount = null;
var testMealCount = null;
var testMealtimeCount = null;

var suite = vows.describe('API');

suite.addBatch({

    "meal controller => ": {
        "GET request to /meals/count": {

            topic: function () {
                request({
                    uri     : testDomain + '/meals/count',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond valid object": function (err, res, body) {
                var out = JSON.parse(body);
                assert.isNumber(out.count);

                testMealCount = out.count;
            },
        },
    },

    "order controller => ": {
        "GET request to /orders/count": {

            topic: function () {
                request({
                    uri     : testDomain + '/orders/count',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond valid object": function (err, res, body) {
                var out = JSON.parse(body);
                assert.isNumber(out.count);

                testOrderCount = out.count;
            },

        },
    },

    "mealtime controller => ": {
        "GET request to /mealtimes/count": {

            topic: function () {
                request({
                    uri     : testDomain + '/mealtimes/count',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond valid object": function (err, res, body) {
                var out = JSON.parse(body);
                assert.isNumber(out.count);

                testMealtimeCount = out.count;
            },

        },
    },

}).addBatch({

    "mealtime controller => ": {
        "POST request to /mealtimes/": {

            topic: function () {
                request({
                    uri     : testDomain + '/mealtimes/',
                    method  : 'POST',
                    body    : {
                        id   : testMealtimeIdString,
                        title: testMealtimeTitle
                    },
                    json: true
                }, this.callback);
            },

            "should respond with 201": function (err, res) {
                assert.equal(res.statusCode, 201);
            },

            "should respond valid object": function (err, res, body) {
                testMealtimeID = body._id;

                assert.isObject(body);
                assert.isString(body.id);
                assert.isString(body.title);
            },

        },
    },


    "user controller => ": {
        "POST request to /users/": {

            topic: function () {
                request({
                    uri     : testDomain + '/users/',
                    method  : 'POST',
                    body    : {
                        username: testUsername,
                        password: testPassword
                    },
                    json: true
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 201);
            },

            "should apply the user id to testUserID": function (err, res, body) {
                testUserID = body._id;
            },

            "should respond a valid username": function (err, res, body) {
                assert.equal(body.username, testUsername);
            },

            "should respond a valid password": function (err, res, body) {
                assert.equal(body.password, testPasswordCheck);
            }
        }
    },

    "meal controller => ": {
        "POST request to /meals/": {

            topic: function () {
                request({
                    uri     : testDomain + '/meals/',
                    method  : 'POST',
                    body    : {
                        title: 'test meal',
                        amount: 12,
                        category: 'test category'
                    },
                    json: true
                }, this.callback);
            },

            "should respond with 201": function (err, res) {
                assert.equal(res.statusCode, 201);
            },

            "should respond valid title and amount": function (err, res, body) {

                testMealID = body._id;

                assert.equal(body.amount, 12);
                assert.equal(body.title, 'test meal');
                assert.equal(body.category, 'test category');
            }
        },
    },

}).addBatch({

    "mealtime controller => ": {
        "GET request to /mealtimes/": {

            topic: function () {
                request({
                    uri     : testDomain + '/mealtimes/',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond a valid array": function (err, res, body) {
                var out = JSON.parse(body);
                assert.isArray(out);
            },

            "should respond with more than zero objects": function (err, res, body) {
                var out = JSON.parse(body);
                assert.greater(out.length, 0);
            }
        }
    },

    "order controller => ": {
        "POST request to /orders/": {

            topic: function () {
                request({
                    uri     : testDomain + '/orders/',
                    method  : 'POST',
                    body    : {
                        meal     : testMealID,
                        mealtime : testMealtimeID,
                        user     : testUserID,
                    },
                    json: true
                }, this.callback);
            },

            "should respond with 201": function (err, res) {
                assert.equal(res.statusCode, 201);
            },

             "should respond valid userID, mealtimeID and mealID": function (err, res, body) {

                testOrderID = body.order._id;

                assert.equal(body.meal._id, testMealID);
                assert.equal(body.order.user, testUserID);
                assert.equal(body.order.mealtime, testMealtimeID);
            }
        }
    },


}).addBatch({

    "meal controller => ": {
        "GET request to /meals/#id/voteup": {

            topic: function () {
                request({
                    uri     : testDomain + '/meals/' + testMealID + '/voteup' ,
                    method  : 'POST'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should with default votes count": function (err, res, body) {
                var out = JSON.parse(body);
                assert.equal(out.votes, 2);
            }
        },
    },

}).addBatch({

    "meal controller => ": {
        "GET request to /meals/": {

            topic: function () {
                request({
                    uri     : testDomain + '/meals/',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond a valid array": function (err, res, body) {
                var out = JSON.parse(body);
                assert.isArray(out.items);
                assert.isNumber(out.max);
            },
        },
    },

    "order controller => ": {

        "GET request to /orders/": {

            topic: function () {
                request({
                    uri     : testDomain + '/orders/',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond a valid array": function (err, res, body) {
                var out = JSON.parse(body);
                assert.isArray(out);
            }

        },

        "GET request to /users/#id/orders/": {

            topic: function () {
                request({
                    uri     : testDomain + '/users/' + testUserID + '/orders/',
                    method  : 'GET',
                    qs      : {
                        dateStart : testNow,
                        dateEnd   : testTomorrow
                    }
                }, this.callback);
            },

            "should have a older date then testNow": function (err, res) {
                assert.greater(res.created, testNow);
                assert.lesser(res.created, testTomorrow);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond a valid array": function (err, res, body) {
                var out = JSON.parse(body);
                assert.isArray(out);
            }
        }
    },

    "user controller => ": {

        "GET request to /users/#username": {

            topic: function () {
                request({
                    uri     : testDomain + '/users/' + testUsername,
                    method  : 'GET',
                    qs      : {
                    }
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond a valid username": function (err, res, body) {
                var out = JSON.parse(body);
                assert.equal(out.username, testUsername);
            }
        },

    },

}).addBatch({

    "meal controller => ": {
        "GET request to /meals/#id/votedown": {

            topic: function () {
                request({
                    uri     : testDomain + '/meals/' + testMealID +'/votedown',
                    method  : 'POST'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond the same id": function (err, res, body) {
                var out = JSON.parse(body);
                assert.equal(out.votes, 1);
            }
        }
    }

}).addBatch({ // teardown

    "order controller => ": {
        "POST request to /orders/#id/delete": {

            topic: function () {
                request({
                    uri     : testDomain + '/orders/' + testOrderID + '/delete',
                    method  : 'POST'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond the same id": function (err, res, body) {
                var out = JSON.parse(body);
                assert.equal(out._id, testOrderID);
            }
        }
    },

}).addBatch({

    "meal controller => ": {
        "POST request to /meals/#id/delete": {

            topic: function () {
                request({
                    uri     : testDomain + '/meals/' + testMealID + '/delete',
                    method  : 'POST'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond the same id": function (err, res, body) {
                var res = JSON.parse(body);
                assert.equal(res._id, testMealID);
            }
        }
    },

    "user controller => ": {
        "POST request to /users/#id/delete": {

            topic: function () {
                request({
                    uri     : testDomain + '/users/' + testUserID + '/delete',
                    method  : 'POST'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond the same id": function (err, res, body) {
                var res = JSON.parse(body);

                assert.equal(res._id, testUserID);
            }
        }
    },

    "mealtime controller => ": {
        "POST request to /mealtimes/#id/delete": {

            topic: function () {
                request({
                    uri     : testDomain + '/mealtimes/' + testMealtimeID + '/delete',
                    method  : 'POST'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond the same id": function (err, res, body) {
                var res = JSON.parse(body);
                assert.equal(res._id, testMealtimeID);
            }
        }
    },


}).addBatch({

    "meal controller => ": {
        "GET request to /meals/count": {

            topic: function () {
                request({
                    uri     : testDomain + '/meals/count',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond origin count": function (err, res, body) {
                var res = JSON.parse(body);
                assert.equal(res.count, testMealCount);
            }
        },
    },

    "order controller => ": {
        "GET request to /orders/count": {

            topic: function () {
                request({
                    uri     : testDomain + '/orders/count',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond origin count": function (err, res, body) {
                var res = JSON.parse(body);
                assert.equal(res.count, testOrderCount);
            }

        },
    },

    "mealtime controller => ": {
        "GET request to /mealtimes/count": {

            topic: function () {
                request({
                    uri     : testDomain + '/mealtimes/count',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond origin count": function (err, res, body) {
                var res = JSON.parse(body);
                assert.equal(res.count, testMealtimeCount);
            }

        },
    },


})

.export(module);