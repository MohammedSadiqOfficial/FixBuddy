import { PrismaClient } from '@prisma/client';
import { deleteFromCloudinary } from '../utils/cloudinary.js';
import { sendSMS } from '../utils/sms.js';

const prisma = new PrismaClient();

export const getProfile = async (req, res, next) => {
    try {
        const captainId = req.user.id;
        const captain = await prisma.captain.findUnique({ where: { id: captainId } });
        if (!captain) {
            return res.status(404).json({ success: false, message: 'Captain not found' });
        }
        res.status(200).json({ success: true, data: captain });
    } catch (error) {
        next(error);
    }
};

export const getRequests = async (req, res, next) => {
    try {
        const captainId = req.user.id;
        const requests = await prisma.serviceRequest.findMany({
            where: {
                OR: [
                    {
                        status: 'PENDING',
                        captainId: null
                    },
                    {
                        captainId,
                        status: { in: ['PENDING', 'ACCEPTED', 'ONGOING'] }
                    }
                ]
            },
            include: { user: true }
        });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

export const getServiceRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const captainId = req.user.id;

        const request = await prisma.serviceRequest.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Only allow viewing if it's pending OR if this captain is assigned
        if (request.status !== 'PENDING' && request.captainId !== captainId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
};

export const updateRequestStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // PENDING, ACCEPTED, ONGOING, COMPLETED, CANCELLED
        const captainId = req.user.id;

        const request = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!request || (request.captainId && request.captainId !== captainId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized or request not found' });
        }

        // If CANCELLED (rejected), clean up images and delete the request entirely
        if (status === 'CANCELLED') {
            if (request.images && request.images.length > 0) {
                for (const imageUrl of request.images) {
                    try {
                        const parts = imageUrl.split('/');
                        const lastPart = parts[parts.length - 1];
                        const publicId = lastPart.split('.')[0];
                        const folder = parts[parts.length - 2];
                        await deleteFromCloudinary(`${folder}/${publicId}`);
                    } catch (err) {
                        console.error('Failed to delete image during cancellation:', imageUrl, err);
                    }
                }
            }
            await prisma.serviceRequest.delete({ where: { id } });
            return res.status(200).json({ success: true, message: 'Request rejected and removed' });
        }

        const updateData = {
            status,
            captainId: request.captainId || captainId
        };

        if (status === 'ONGOING') {
            updateData.startedAt = new Date();
        }

        if (status === 'COMPLETED') {
            const captain = await prisma.captain.findUnique({ where: { id: request.captainId || captainId } });
            const startTime = request.startedAt || request.createdAt;
            const durationMs = new Date() - new Date(startTime);
            const durationHours = Math.max(0.5, durationMs / (1000 * 60 * 60)); // Min 30 mins for billing
            const calculatedAmount = Math.round(durationHours * (captain.hourlyRate || 20)); // Default $20 if not set
            updateData.amount = calculatedAmount;
        }

        const updatedRequest = await prisma.serviceRequest.update({
            where: { id },
            data: updateData
        });

        // Update captain's total earnings if job is completed
        if (status === 'COMPLETED') {
            await prisma.captain.update({
                where: { id: updatedRequest.captainId },
                data: {
                    totalEarnings: {
                        increment: updatedRequest.amount || 0
                    }
                }
            });
        }

        // --- SMS Notifications ---
        try {
            const user = await prisma.user.findUnique({ where: { id: request.userId } });
            if (user && user.phoneNumber) {
                let message = '';
                if (status === 'ACCEPTED') {
                    message = `Great news! Captain ${req.user.name} has accepted your request: "${request.title}".`;
                } else if (status === 'ONGOING') {
                    message = `Captain ${req.user.name} has started working on your request: "${request.title}".`;
                } else if (status === 'COMPLETED') {
                    message = `Success! Your service request "${request.title}" has been marked as COMPLETED by ${req.user.name}. Total: $${updatedRequest.amount}.`;
                }

                if (message) {
                    await sendSMS(user.phoneNumber, message);
                }
            }
        } catch (smsError) {
            console.error('[SMS] Notification failed:', smsError.message);
        }

        // After the task is complete remove the images sent by the user for work
        if (status === 'COMPLETED' && updatedRequest.images && updatedRequest.images.length > 0) {
            for (const imageUrl of updatedRequest.images) {
                try {
                    const parts = imageUrl.split('/');
                    const lastPart = parts[parts.length - 1];
                    const publicId = lastPart.split('.')[0];
                    const folder = parts[parts.length - 2];
                    await deleteFromCloudinary(`${folder}/${publicId}`);
                } catch (err) {
                    console.error('Failed to delete image from Cloudinary:', imageUrl, err);
                }
            }
            // Clear images from DB
            await prisma.serviceRequest.update({
                where: { id },
                data: { images: { set: [] } }
            });
        }

        res.status(200).json({ success: true, data: updatedRequest });
    } catch (error) {
        next(error);
    }
};

export const toggleActive = async (req, res, next) => {
    try {
        const captainId = req.user.id;
        const captain = await prisma.captain.findUnique({ where: { id: captainId } });

        const updatedCaptain = await prisma.captain.update({
            where: { id: captainId },
            data: { isActive: !captain.isActive }
        });

        res.status(200).json({ success: true, data: { isActive: updatedCaptain.isActive } });
    } catch (error) {
        next(error);
    }
};

export const updateLocation = async (req, res, next) => {
    try {
        const captainId = req.user.id;
        const { latitude, longitude } = req.body;

        const updatedCaptain = await prisma.captain.update({
            where: { id: captainId },
            data: { latitude, longitude }
        });

        res.status(200).json({ success: true, data: { latitude, longitude } });
    } catch (error) {
        next(error);
    }
};

export const getMyReviews = async (req, res, next) => {
    try {
        const captainId = req.user.id;
        const reviews = await prisma.review.findMany({
            where: { captainId },
            include: { user: { select: { id: true, name: true, profileImage: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const avgRating = reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;
        res.status(200).json({ success: true, data: reviews, avgRating: parseFloat(avgRating.toFixed(1)) });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { name, email, phoneNumber, hourlyRate, description, availability, avatarUrl, workImages } = req.body;
        const captainId = req.user.id;

        // Fix for parsing FormData arrays
        let skills = req.body.skills || req.body['skills[]'];
        if (typeof skills === 'string') {
            skills = [skills];
        }

        const updateData = {
            name,
            email,
            phoneNumber,
            skills: { set: skills },
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
            description,
            isActive: availability === 'true' || availability === true
        };

        if (avatarUrl) {
            updateData.profileImage = avatarUrl;
        }

        if (workImages && Array.isArray(workImages)) {
            const existingCaptain = await prisma.captain.findUnique({ where: { id: captainId } });
            updateData.workImages = { set: [...(existingCaptain.workImages || []), ...workImages] };
        } else if (workImages && typeof workImages === 'string') {
            const existingCaptain = await prisma.captain.findUnique({ where: { id: captainId } });
            updateData.workImages = { set: [...(existingCaptain.workImages || []), workImages] };
        }

        const updatedCaptain = await prisma.captain.update({
            where: { id: captainId },
            data: updateData
        });

        res.status(200).json({ success: true, data: updatedCaptain });
    } catch (error) {
        next(error);
    }
};

export const getDashboardStats = async (req, res, next) => {
    try {
        const captainId = req.user.id;

        const [totalJobs, activeJobs, reviews] = await Promise.all([
            prisma.serviceRequest.count({
                where: { captainId, status: 'COMPLETED' }
            }),
            prisma.serviceRequest.count({
                where: {
                    captainId,
                    status: { in: ['ACCEPTED', 'ONGOING'] }
                }
            }),
            prisma.review.findMany({
                where: { captainId },
                select: { rating: true }
            })
        ]);

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
            : 0;

        const captain = await prisma.captain.findUnique({
            where: { id: captainId },
            select: { totalEarnings: true }
        });

        res.status(200).json({
            success: true,
            data: {
                totalJobs,
                activeJobs,
                totalReviews,
                avgRating: parseFloat(avgRating.toFixed(1)),
                totalEarnings: captain?.totalEarnings || 0
            }
        });
    } catch (error) {
        next(error);
    }
};
