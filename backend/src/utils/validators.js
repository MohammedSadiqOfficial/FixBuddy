import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        if (Object.hasOwn(parsed, 'body')) req.body = parsed.body;
        if (Object.hasOwn(parsed, 'query')) req.query = parsed.query;
        if (Object.hasOwn(parsed, 'params')) req.params = parsed.params;
        next();
    } catch (err) {
        next(err); // Passed to error handler which handles ZodError
    }
};

// Common validations
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const objectIdRegex = /^[a-f\d]{24}$/i;
const objectId = (message) => z.string().regex(objectIdRegex, message);
const optionalObjectId = (message) =>
    z.preprocess((val) => (val === "" || val === null || typeof val === "undefined") ? undefined : val, objectId(message).optional());

export const schemas = {
    userSignup: z.object({
        body: z.object({
            name: z.string().min(2, "Name must be at least 2 characters"),
            phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
            email: z.string().email("Invalid email"),
            location: z.string().optional(),
        })
    }),
    captainSignup: z.object({
        body: z.object({
            name: z.string().min(2, "Name must be at least 2 characters"),
            phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
            email: z.string().email("Invalid email"),
            password: z.string().min(6, "Password must be at least 6 characters").optional(),
            skills: z.array(z.string()).optional().default([]),
            hourlyRate: z.number().optional()
        })
    }),
    loginRequest: z.object({
        body: z.object({
            email: z.string().email("Invalid email address"),
        })
    }),
    verifyOtp: z.object({
        body: z.object({
            email: z.string().email("Invalid email address"),
            otp: z.coerce.string().length(6, "OTP must be 6 digits")
        })
    }),
    createServiceRequest: z.object({
        body: z.object({
            title: z.string().min(3, "Title must be at least 3 characters").optional(),
            serviceType: z.string().optional(),
            description: z.string().min(10, "Description must be at least 10 characters"),
            location: z.string().optional(),
            captainId: optionalObjectId("Invalid captain ID"),
            images: z.preprocess((val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val.filter(img => typeof img === 'string');
                if (typeof val === 'string') return [val];
                return [];
            }, z.array(z.string()).optional().default([]))
        })
    }),
    updateServiceRequest: z.object({
        body: z.object({
            title: z.string().min(3, "Title must be at least 3 characters").optional(),
            serviceType: z.string().optional(),
            description: z.string().min(10, "Description must be at least 10 characters").optional(),
            location: z.string().optional()
        })
    }),
    statusUpdate: z.object({
        body: z.object({
            status: z.enum(["PENDING", "ACCEPTED", "ONGOING", "COMPLETED", "CANCELLED"])
        })
    }),
    addReview: z.object({
        body: z.object({
            captainId: objectId("Invalid captain ID"),
            rating: z.coerce.number().min(1).max(5),
            comment: z.string().optional()
        })
    })
};
