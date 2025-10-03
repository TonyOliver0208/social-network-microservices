const Joi = require("joi");

const validateCreatePost = (data) => {
  const schema = Joi.object({
    content: Joi.string().min(3).max(5000).required(),
    mediaIds: Joi.array(),
  });

  return schema.validate(data);
};

const sanitizeInput = (data) => {
  return {
    ...data,
    content: data.content.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    ),
  };
};

module.exports = { validateCreatePost, sanitizeInput };
