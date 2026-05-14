import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching all Service Requests (without joining user)...');
    
    // Fetch all service requests, but don't include user to avoid the error
    const serviceRequests = await prisma.serviceRequest.findMany();
    console.log(`Found ${serviceRequests.length} total service requests.`);
    
    const orphanedIds = [];
    
    for (const req of serviceRequests) {
        // Try to fetch the user separately
        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });
        
        if (!user) {
            console.log(`Orphaned Service Request found: ID ${req.id}, Missing User ID: ${req.userId}`);
            orphanedIds.push(req.id);
        }
    }
    
    if (orphanedIds.length > 0) {
        console.log(`\nDeleting ${orphanedIds.length} orphaned service requests...`);
        const result = await prisma.serviceRequest.deleteMany({
            where: {
                id: { in: orphanedIds }
            }
        });
        console.log(`Deleted ${result.count} records.`);
    } else {
        console.log('No orphaned service requests found. The issue might be somewhere else.');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
