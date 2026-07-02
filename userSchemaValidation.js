import joi from "joi";

const userSchema = joi.object({
  fullName: joi.string().required().min(3).messages({
    "string.empty": "fullName must not be empty",
    "string.min": "fullName must have at least 3 character",
    "any.required": "fullName is required",
  }),
  username: joi.string().required().min(3).messages({
    "string.empty": "username must not be empty",
    "string.min": "username must have at least 3 character",
    "any.required": "username is required",
  }),
  email: joi.string().required().email().messages({
    "string.empty": "email must not be empty",
    "string.email": "email must be a valid email address",
    "any.required": "email is required",
  }),
  password: joi.string().required().min(6).messages({
    "string.empty": "password must not be empty",
    "string.min": "password must have at least 6 character",
    "any.required": "password is required",
  }),
});

export const userSchemaValidate = (body) => {
  const {error} = userSchema.validate(body);
  return error?.details[0].message; 
};
