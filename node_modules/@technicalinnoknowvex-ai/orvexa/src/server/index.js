const assistantController = require("./assistantController");
const publicWebsiteSearch = require("./publicWebsiteSearch");

module.exports = {
  ...assistantController,
  ...publicWebsiteSearch,
};
