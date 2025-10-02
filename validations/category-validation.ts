import Joi from "joi";

const addCategoryValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  type: Joi.string().required().trim(),
});

const editCategoryValidationSchema = Joi.object({
  name: Joi.string().trim(),
  type: Joi.string().trim(),
});

export { addCategoryValidationSchema, editCategoryValidationSchema };
