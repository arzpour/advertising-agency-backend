import Joi from "joi";

const editOrdersValidationSchema = Joi.object({
  orders: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        order: Joi.number().required(),
      })
    )
    .required(),
});

export default editOrdersValidationSchema;
