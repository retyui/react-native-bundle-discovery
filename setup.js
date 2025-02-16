const prepare = require("./prepare");
const queryHelpers = require("./queryHelpers");

module.exports = function setup({
  defineObjectMarker,
  addQueryHelpers,
  setPrepare,
}) {
  // extend queries with custom methods
  addQueryHelpers(queryHelpers);
  setPrepare(prepare);
};
