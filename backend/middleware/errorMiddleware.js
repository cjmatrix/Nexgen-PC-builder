const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Mongoose Bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new Error(message);
    err.statusCode = 404;
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new Error(message);
    err.statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    err = new Error(message);
    err.statusCode = 400;
  }

 
 
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
};

export default errorMiddleware;
