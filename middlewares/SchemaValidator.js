const _ = require("lodash");
const Joi = require("joi");
const Schemas = require("../schemas");

module.exports = (useJoiError = false) => {
  const _useJoiError = _.isBoolean(useJoiError) && useJoiError;

  const _supportedMethods = ["post", "put"];

  const _validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  return (req, res, next) => {
    const route = req.route.path;
    const method = req.method.toLowerCase();

    if (_.includes(_supportedMethods, method) && _.has(Schemas, route)) {
      const _schema = _.get(Schemas, route);

      if (_schema) {
        const { error, value } = _schema.validate(req.body, _validationOptions);

        if (error) {
          const JoiError = {
            status: "failed",
            error: {
              original: error._object,

              details: _.map(error.details, ({ message, type }) => ({
                message: message.replace(/['"]/g, ""),
                type,
              })),
            },
          };

          const CustomError = {
            status: "failed",
            error: "Invalid request data. Please review request and try again.",
          };

          res.status(422).json(_useJoiError ? JoiError : CustomError);
        } else {
          req.body = value;
          next();
        }
      }
    }
  };
  next();
};
