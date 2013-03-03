exports.handleError = handleError = function (error) {
    console.trace(error);
};

exports.parseJSON = function (json) {
    try {
        return JSON.parse(json);
    } catch(err) {
        handleError(err);
        return {};
    }
};