class BadRequestError extends Error {
  constructor(message) {
    super()

    this.message = message
  }
}

export default BadRequestError