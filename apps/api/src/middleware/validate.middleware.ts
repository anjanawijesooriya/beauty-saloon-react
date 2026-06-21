import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      })
    }
    next(err)
  }
}
