import { z } from "zod";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => {
      
        const path =
          issue.path.length > 1
            ? issue.path.slice(1).join(".")
            : issue.path.join(".");
        return `${path}: ${issue.message}`;
      })
      .join(", ");
    return next(new AppError(errorMessages, HTTP_STATUS.BAD_REQUEST));
  }

  next();
};
