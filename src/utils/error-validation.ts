import Joi from '@hapi/joi';

export const errorValidation = (value: any, schema: Joi.Schema, ) => {
  const { error } = schema.validate({ 
    ...value,
  }, { abortEarly: false });
  if (error) {
    const errorMsg =  error.details.map((e: any) => {
      return {
        key : e.context.key,
        msg: e.message
      };
    }).reduce((acc: any, curr: any) => {  
      acc[curr.key] = curr.msg;
      return acc;
    }, {});
    throw({ code: 422, message: 'Data validation error', errorMessages: errorMsg });
  }
}