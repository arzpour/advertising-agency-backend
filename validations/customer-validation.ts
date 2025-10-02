import Joi from "joi";

const addCustomerValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  icon: Joi.string().required().trim(),
});

const editCustomerValidationSchema = Joi.object({
  name: Joi.string().trim(),
  icon: Joi.string().trim(),
});

export { addCustomerValidationSchema, editCustomerValidationSchema };
