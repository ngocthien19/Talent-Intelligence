const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false })

    if (!error) {
      return next()
    }

    const { details } = error
    const message = details.map((detail) => detail.message).join(', ')

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    })
  }
}

export default validate