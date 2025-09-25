import Joi from "joi";

const addServiceValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().trim(),
});

const editServiceValidationSchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().trim(),
});

export { addServiceValidationSchema, editServiceValidationSchema };
