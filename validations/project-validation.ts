import Joi from "joi";

const projectValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().trim(),
  category: Joi.string().required(),
});

export default projectValidationSchema;
