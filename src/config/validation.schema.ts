import Joi from 'joi'

export const validationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    // Required so the app can never silently boot with a guessable/default
    // signing secret (see src/auth/strategies/jwt.strategy.ts).
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRES_IN: Joi.string().default('1d'),
})