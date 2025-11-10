// const Joi = require('joi');

// const datasetEvaluationSchema = Joi.object({
//   title: Joi.string().max(255).required(),
//   evaluator: Joi.string().max(255).required(),
//   affiliation: Joi.string().max(255).allow('', null),
//   data_processing_level: Joi.string().valid('primary data', 'data product').required(),
//   data_type: Joi.string().max(255).required(),
//   evaluation_id: Joi.number().integer().valid(0, 1).required(),
//   evaluation_type: Joi.string().valid('general data quality', 'use case specific').required(),
//   creation_date: Joi.date().iso().default(() => new Date())

// });


// module.exports = datasetEvaluationSchema;
const Joi = require("joi");

const datasetSchema = Joi.object({
  title: Joi.string().required(),
  evaluator: Joi.string().allow(""),
  affiliation: Joi.string().allow(""),
  data_processing_level: Joi.string().valid("primary data", "data product").required(),
  data_type: Joi.string().required(),
  evaluation_id: Joi.number().valid(0, 1).required(),
  evaluation_type: Joi.string().valid("general data quality", "use case specific").required(),
});

const useCaseSchema = Joi.object({
  use_case_description: Joi.string().required(),
  requirements: Joi.string().allow(""),
  optimum_data_collection: Joi.date().allow(null),
  optimum_spatial_resolution: Joi.string().allow(""),
  aoi_input_method: Joi.string().allow(""),
  other_requirements: Joi.string().allow(""),
});

module.exports = { datasetSchema, useCaseSchema };
