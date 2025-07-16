import Joi from "joi";

const blogValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
});

export default blogValidationSchema;
