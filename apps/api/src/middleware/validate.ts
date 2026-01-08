import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

type ValidationSchema = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export function validate(schema: ValidationSchema): RequestHandler {
  return (req, _res, next) => {
    if (schema.body) {
      const body = schema.body.parse(req.body);
      req.validated = { ...req.validated, body };
    }
    if (schema.params) {
      const params = schema.params.parse(req.params);
      req.validated = { ...req.validated, params };
    }
    if (schema.query) {
      const query = schema.query.parse(req.query);
      req.validated = { ...req.validated, query };
    }
    next();
  };
}
