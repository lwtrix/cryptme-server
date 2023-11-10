class RequestValidationError extends Error {
  constructor(errors) {
    super()

    this.errors = errors
  }
}

export default RequestValidationError