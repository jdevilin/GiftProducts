// Constructor
function ResponseValue(url,name) {
    // always initialize all instance properties
    this.url = url;
    this.name = name; // default value
}
// class methods
ResponseValue.prototype.fooBar = function() {

};
// export the class
module.exports = ResponseValue