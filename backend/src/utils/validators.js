import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (err) {
        next(err); // Passed to error handler which handles ZodError
    }
};

// Common validations
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const schemas = {
    userSignup: z.object({
        body: z.object({
            name: z.string().min(2, "Name must be at least 2 characters"),
            phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
            email: z.string().email("Invalid email").optional(),
            location: z.string().optional(),
        })
    }),
    captainSignup: z.object({
        body: z.object({
            name: z.string().min(2, "Name must be at least 2 characters"),
            phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
            email: z.string().email("Invalid email").optional(),
            password: z.string().min(6, "Password must be at least 6 characters").optional(), // if using auth logic
            skills: z.array(z.string()).optional().default([]),
            hourlyRate: z.number().optional()
        })
    }),
    loginRequest: z.object({
        body: z.object({
            phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
        })
    }),
    verifyOtp: z.object({
        body: z.object({
            phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
            otp: z.string().length(6, "OTP must be 6 digits")
        })
    }),
    createServiceRequest: z.object({
        body: z.object({
            title: z.string().min(3, "Title must be at least 3 characters").optional(),
            serviceType: z.string().optional(),
            description: z.string().min(10, "Description must be at least 10 characters"),
            location: z.string().optional(),
            captainId: z.preprocess((val) => (val === "" || val === null) ? undefined : val, z.string().uuid("Invalid captain ID").optional()),
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
            captainId: z.string().uuid("Invalid captain ID"),
            rating: z.coerce.number().min(1).max(5),
            comment: z.string().optional()
        })
    })
};
