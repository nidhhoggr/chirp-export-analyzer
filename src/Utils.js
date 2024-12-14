const _ = require("lodash");

module.exports = {
  isNumber: function isNumber(value) {
    return /^-?\d*(\.\d+)?$/.test(value);
  },
  findKeyByValue: function findKeyByValue(obj, value) {
    return _.findKey(obj, (val) => _.isEqual(val, value));
  }
}
