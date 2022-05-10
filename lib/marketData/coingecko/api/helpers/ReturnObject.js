/**
 * @typedef {Object} ReturnObject
 * @description - Return object for requests in the class. Helper for reference.
 * @param {boolean} success - Whether the response status code returned a successful code (>200 && <300)
 * @param {string} message - The response status message
 * @param {number} code - The response status code
 * @param {object|*} data - The body data in json format from the request
 * @property {boolean} success - Whether the response status code returned a successful code (>200 && <300)
 * @property {string} message - The response status message
 * @property {number} code - The response status code
 * @property {object|*} data - The body data in json format from the request
 */
const ReturnObject = (success, message, code, data) => {
  return { success, message, code, data };
};

//

export default ReturnObject;
