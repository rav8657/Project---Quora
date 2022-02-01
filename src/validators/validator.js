const mongoose = require("mongoose");

// Validation checking function
const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false; //it checks whether the value is null or undefined.
  if (typeof value === "string" && value.trim().length === 0) return false; //it checks whether the string contain only space or not
  return true;
};
const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};
const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0; // it checks, is there any key is available or not in request body
};

//only check empty string value.
const validString = function (value) {
  if (typeof value === "string" && value.trim().length === 0) return false; //it checks whether the string contain only space or not
  return true;
};

module.exports = {
  isValid,
  isValidRequestBody,
  isValidObjectId,
  validString
};
