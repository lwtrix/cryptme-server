import BadRequestError from './bad-request-error.js';
import NotAuthorizedError from './not-authorized-error.js';
import NotFoundError from './not-found-error.js';
import RequestValidationError from './request-validation-error.js';

const errorHandler = (err, req, res, next) => {
  if (err instanceof RequestValidationError) {
    const formatErrors = err.errors.map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    return res.status(400).send({ errors: formatErrors });
  }

  if (err instanceof BadRequestError) {
    return res.status(400).send({ errors: [{ message: err.message }] });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).send({ errors: [{ message: err.message }] });
  }

  if (err instanceof NotAuthorizedError) {
    return res.status(401).send({ errors: [{ message: err.message }] });
  }

  console.log(err);

  return res
    .status(500)
    .send({ errors: [{ message: 'Something went wrong..' }] });
};

export default errorHandler;
