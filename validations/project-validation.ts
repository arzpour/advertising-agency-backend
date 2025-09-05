import Joi from "joi";

export const editOrdersValidationSchema = Joi.object({
  orders: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        order: Joi.number().required(),
      })
    )
    .required(),
});

export const projectValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().trim(),
  category: Joi.string().required(),
});
