import Joi from "joi";

const addCategoryValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().trim(),
});

const editCategoryValidationSchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().trim(),
});

export { addCategoryValidationSchema, editCategoryValidationSchema };
