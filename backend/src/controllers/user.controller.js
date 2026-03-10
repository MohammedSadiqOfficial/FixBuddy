import { PrismaClient } from '@prisma/client';
import { sendSMS } from '../utils/sms.js';

const prisma = new PrismaClient();

export const getCaptains = async (req, res, next) => {
    try {
        const { skills, minRating, maxRate, latitude, longitude, radius = 10 } = req.query;

        const filters = {
            isActive: true,
            isVerified: true,
        };

        if (skills) {
            filters.skills = { hasSome: skills.split(',') };
        }

        if (maxRate) {
            filters.hourlyRate = { lte: parseFloat(maxRate) };
        }

        const captains = await prisma.captain.findMany({
            where: filters,
            include: {
                reviews: true
            }
        });

        let result = captains.map(c => {
            const avgRating = c.reviews.length > 0
                ? c.reviews.reduce((acc, r) => acc + r.rating, 0) / c.reviews.length
                : 0;

            let distance = null;
            if (latitude && longitude && c.latitude && c.longitude) {
                // Basic Haversine or simple distance
                distance = Math.sqrt(
                    Math.pow(parseFloat(latitude) - c.latitude, 2) +
                    Math.pow(parseFloat(longitude) - c.longitude, 2)
                ) * 111;
            }

            return { ...c, avgRating, distance, reviewCount: c.reviews.length };
        });

        if (minRating) {
            result = result.filter(c => c.avgRating >= parseFloat(minRating));
        }

        if (latitude && longitude && radius) {
            result = result.filter(c => c.distance === null || c.distance <= parseFloat(radius));
        }

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getCaptainById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const captain = await prisma.captain.findUnique({
            where: { id },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!captain) {
            return res.status(404).json({ success: false, message: 'Captain not found' });
        }

        const avgRating = captain.reviews.length > 0
            ? captain.reviews.reduce((acc, r) => acc + r.rating, 0) / captain.reviews.length
            : 0;

        res.status(200).json({
            success: true,
            data: {
                ...captain,
                avgRating,
                reviewCount: captain.reviews.length
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getUserServiceRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const requests = await prisma.serviceRequest.findMany({
            where: { userId },
            include: { captain: { select: { id: true, name: true, skills: true, profileImage: true, latitude: true, longitude: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

export const createServiceRequest = async (req, res, next) => {
    try {
        const { title, description, serviceType, location, captainId } = req.body;
        const userId = req.user.id;

        // Image URLs from previous middleware if any
        let imageUrls = req.body.images || [];
        if (!Array.isArray(imageUrls)) {
            imageUrls = [imageUrls];
        }

        // Clean image URLs to ensure only strings are passed to Prisma
        const cleanImages = imageUrls.filter(img => typeof img === 'string' && img.trim() !== "");

        const request = await prisma.serviceRequest.create({
            data: {
                userId,
                captainId: (captainId && captainId !== "") ? captainId : null,
                title: title || serviceType || 'Service Request',
                description,
                location,
                images: { set: cleanImages },
                status: 'PENDING'
            }
        });

        res.status(201).json({ success: true, data: request });

        // --- SMS Notification to Captain ---
        if (captainId && captainId !== "") {
            try {
                const captain = await prisma.captain.findUnique({ where: { id: captainId } });
                if (captain && captain.phoneNumber) {
                    const message = `Hello ${captain.name}! A new service request "${title || serviceType}" has been assigned to you. Check your dashboard for details.`;
                    await sendSMS(captain.phoneNumber, message);
                }
            } catch (smsError) {
                console.error('[SMS] Captain notification failed:', smsError.message);
            }
        }
    } catch (error) {
        next(error);
    }
};

export const getServiceRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const request = await prisma.serviceRequest.findUnique({
            where: { id },
            include: { user: true, captain: true, messages: true }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
};

export const createReview = async (req, res, next) => {
    try {
        const { captainId, rating, comment } = req.body;
        const userId = req.user.id;

        // Check for completed service
        const completedService = await prisma.serviceRequest.findFirst({
            where: { userId, captainId, status: 'COMPLETED' }
        });

        if (!completedService) {
            return res.status(400).json({ success: false, message: 'You can only review captains after a completed service.' });
        }

        const review = await prisma.review.create({
            data: {
                userId,
                captainId,
                rating: parseInt(rating),
                comment
            }
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
};

export const updateServiceRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, serviceType, location } = req.body;
        const userId = req.user.id;

        const request = await prisma.serviceRequest.findUnique({
            where: { id }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Cannot update a request that is no longer pending' });
        }

        const updatedRequest = await prisma.serviceRequest.update({
            where: { id },
            data: {
                title: title || serviceType || request.title,
                description: description || request.description,
                location: location || request.location
            }
        });

        res.status(200).json({ success: true, data: updatedRequest });
    } catch (error) {
        next(error);
    }
};

export const deleteServiceRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const request = await prisma.serviceRequest.findUnique({
            where: { id }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this request' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Cannot delete a request that is no longer pending' });
        }

        await prisma.serviceRequest.delete({
            where: { id }
        });

        res.status(200).json({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                location: true,
                profileImage: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { name, email, location, profileImage } = req.body;
        const userId = req.user.id;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                location,
                profileImage
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                location: true,
                profileImage: true,
                createdAt: true
            }
        });

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
};
