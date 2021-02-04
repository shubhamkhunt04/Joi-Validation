// load Joi module
const Joi = require("joi");

const personID = Joi.string().guid({ version: "uuidv4" });

const name = Joi.string()
  .regex(/^[A-Z]+$/)
  .uppercase();

const ageSchema = Joi.alternatives().try(
  Joi.number().integer().greater(6).required(),
  Joi.string()
    .replace(/^([7-9]|[1-9]\d+)(y|yr|yrs)?$/i, "$1")
    .required()
);

const personDataSchema = Joi.object()
  .keys({
    id: personID.required(),
    firstname: name,
    lastname: name,
    fullname: Joi.string()
      .regex(/^[A-Z]+ [A-Z]+$/i)
      .uppercase(),
    type: Joi.string().valid("STUDENT", "TEACHER").uppercase().required(),

    age: Joi.when("type", {
      is: "STUDENT",
      then: ageSchema.required(),
      otherwise: ageSchema,
    }),
  })
  .xor("firstname", "fullname")
  .and("firstname", "lastname")
  .without("fullname", ["firstname", "lastname"]);

// ...

const authDataSchema = Joi.object({
  teacherId: personID.required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(7).required().strict(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().strict(),
});

// ...

const feesDataSchema = Joi.object({
  studentId: personID.required(),
  amount: Joi.number().positive().greater(1).precision(2).required(),
  cardNumber: Joi.string().creditCard().required(),
  completedAt: Joi.date().timestamp().required(),
});

// ...

// export the schemas
module.exports = {
  "/people": personDataSchema,
  "/auth/edit": authDataSchema,
  "/fees/pay": feesDataSchema,
};
