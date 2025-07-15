import Joi from "joi";

export const projectValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().trim(),
  category: Joi.string().required(),
});
