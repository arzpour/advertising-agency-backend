import Joi from "joi";

const blogValidationSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
});

export default blogValidationSchema;
