// This loader has been disabled as part of the account package removal
// It previously processed imports from the account package, which has been removed
module.exports = function (source, map) {
    // Return the source unchanged
    return this.callback(null, source, map);
};
