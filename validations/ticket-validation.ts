import Joi from "joi";

const ticketValidationSchema = Joi.object({
  phoneNumber: Joi.string().required(),
  message: Joi.string().required(),
  status: Joi.string().required(),
});

export default ticketValidationSchema;
