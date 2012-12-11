var request = require('request'),
    vows    = require('vows'),
    assert  = require('assert');

var testDomain = 'https://127.0.0.1:3000';

var crypto = require('crypto');
var shasum = crypto.createHash('sha1');

shasum.update('test');

var testNow      = (new Date()).getTime();
var testTomorrow = testNow + (24 * 60 * 60 * 1000);

var testUserID   = '';
var testUsername = Math.ceil(Math.random() * 1000) + '@' + Math.ceil(Math.random() * 1000) + '.com';
var testPassword = 'test';
var testPasswordCheck = shasum.digest('hex');

var testMealID      = '';
var testMealTimeID  = '';

var testOrderID     = '';

var testOrderCount = null;
var testMealCount = null;

var suite = vows.describe('API');

suite.addBatch({

    "meal controller => ": {
        "GET request to /meal/count": {

            topic: function () {
                request({
                    uri     : testDomain + '/meal/count',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond valid object": function (err, res, body) {
                var res = JSON.parse(body);
                assert.isNumber(res.count);

                testMealCount = res.count;
            },
        },
    },

    "order controller => ": {
        "GET request to /order/count": {

            topic: function () {
                request({
                    uri     : testDomain + '/order/count',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond valid object": function (err, res, body) {
                var res = JSON.parse(body);
                assert.isNumber(res.count);

                testOrderCount = res.count;
            },

        },
    },

}).addBatch({

    "user controller => ": {
        "GET request to /user/add": {

            topic: function () {
                request({
                    uri     : testDomain + '/user/add',
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
        "POST request to /meal/add": {

            topic: function () {
                request({
                    uri     : testDomain + '/meal/add',
                    method  : 'POST',
                    body    : {
                        title: 'Some meal title',
                        amount: 1
                    },
                    json: true
                }, this.callback);
            },

            "should respond with 201": function (err, res) {
                assert.equal(res.statusCode, 201);
            },

            "should respond valid title and amount": function (err, res, body) {

                testMealID = body._id;

                assert.equal(body.amount, 1);
                assert.equal(body.title, 'Some meal title');
            }
        },
    },

    "mealtimes controller => ": {
        "GET request to /mealtimes/list": {

            topic: function () {
                request({
                    uri     : testDomain + '/mealtimes/list',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond a valid array": function (err, res, body) {
                var res = JSON.parse(body);
                assert.isArray(res);
            },
    
            "should respond with more than zero objects": function (err, res, body) {
                var res = JSON.parse(body);
                assert.greater(res.length, 0);

                testMealTimeID = res[0]._id;
            }
        }
    },

}).addBatch({

    "order controller => ": {
        "POST request to /order/add": {

            topic: function () {
                request({
                    uri     : testDomain + '/order/add',
                    method  : 'POST',
                    body    : {
                        meal     : testMealID,
                        mealtime : testMealTimeID,
                        user     : testUserID,
                    },
                    json: true
                }, this.callback);
            },

            "should respond with 201": function (err, res) {
                assert.equal(res.statusCode, 201);
            },

             "should respond valid user, mealtimeID and mealID": function (err, res, body) {

                testOrderID = body.order._id;

                assert.equal(body.meal._id, testMealID);
                assert.equal(body.order.user, testUserID);
                assert.equal(body.order.meal, testMealID);
                assert.equal(body.order.mealtime, testMealTimeID);
            }
        }
    },


}).addBatch({

    "meal controller => ": {
        "GET request to /meal/vote/up/#id": {

            topic: function () {
                request({
                    uri     : testDomain + '/meal/vote/up/' + testMealID,
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should with default votes count": function (err, res, body) {
                var res = JSON.parse(body);
                assert.equal(res.votes, 2);
            }
        },
    },

}).addBatch({

    "meal controller => ": {
        "GET request to /meal/list": {

            topic: function () {
                request({
                    uri     : testDomain + '/meal/list',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond a valid array": function (err, res, body) {
                var res = JSON.parse(body);
                assert.isArray(res.items);
                assert.isNumber(res.max);
            },
        },
    },

    "order controller => ": {

        "GET request to /order/list": {

            topic: function () {
                request({
                    uri     : testDomain + '/order/list',
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond a valid array": function (err, res, body) {
                var res = JSON.parse(body);
                assert.isArray(res);
            }

        },

        "GET request to /order/list_by_user": {

            topic: function () {
                request({
                    uri     : testDomain + '/order/list_by_user',
                    method  : 'GET',
                    qs      : {
                        user      : testUserID,
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
                var res = JSON.parse(body);
                assert.isArray(res);
            }
        }
    },

    "user controller => ": {

        "GET request to /user/get_by_username": {

            topic: function () {
                request({
                    uri     : testDomain + '/user/get_by_username',
                    method  : 'GET',
                    qs      : {
                        username: testUsername
                    }
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond a valid username": function (err, res, body) {
                var res = JSON.parse(body);
                
                assert.equal(res.username, testUsername);
            }
        },

    },

}).addBatch({

    "meal controller => ": {
        "GET request to /meal/vote/down/#id": {

            topic: function () {
                request({
                    uri     : testDomain + '/meal/vote/down/' + testMealID,
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond the same id": function (err, res, body) {
                var res = JSON.parse(body);
                assert.equal(res.votes, 1);
            }
        }
    }

}).addBatch({ // teardown

    "order controller => ": {
        "GET request to /order/delete/#id": {

            topic: function () {
                request({
                    uri     : testDomain + '/order/delete/' + testOrderID,
                    method  : 'GET'
                }, this.callback);
            },

            "should respond with 200": function (err, res) {
                assert.equal(res.statusCode, 200);
            },

            "should respond the same id": function (err, res, body) {
                var res = JSON.parse(body);
                assert.equal(res._id, testOrderID);
            }
        }
    },

}).addBatch({

    "meal controller => ": {
        "GET request to /meal/delete/#id": {

            topic: function () {
                request({
                    uri     : testDomain + '/meal/delete/' + testMealID,
                    method  : 'GET'
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
        "GET request to /user/delete": {

            topic: function () {
                request({
                    uri     : testDomain + '/user/delete/' + testUserID,
                    method  : 'GET'
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
    }

}).addBatch({

    "meal controller => ": {
        "GET request to /meal/count": {

            topic: function () {
                request({
                    uri     : testDomain + '/meal/count',
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
        "GET request to /order/count": {

            topic: function () {
                request({
                    uri     : testDomain + '/order/count',
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
})

.export(module);