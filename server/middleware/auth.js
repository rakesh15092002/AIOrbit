// Middleware to check userId and whether the user has a Premium plan

import { clerkClient } from "@clerk/express";

// Exporting middleware function
export const auth = async (req, res, next) => {
    try {
        // 1. Get user info and subscription check function from Clerk
        const { userId, has } = await req.auth();

        // 2. Check if the user has a premium plan
        const hasPremiumPlan = await has({ plan: 'premium' });

        // 3. Fetch full user details using Clerk
        const user = await clerkClient.users.getUser(userId);

        // 4. If the user does NOT have a premium plan but has some free usage left
        if (!hasPremiumPlan && user.privateMetadata.free_usage) {
            // Attach free_usage to the request object so the next middleware/controller can use it
            req.free_usage = user.privateMetadata.free_usage;
        } 
        else {
            // Otherwise, set free_usage = 0 in Clerk's private metadata
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0
                }
            });

            // Also attach free_usage = 0 in request object
            req.free_usage = 0;
        }

        // 5. Attach user's plan type to request object
        req.plan = hasPremiumPlan ? 'premium' : 'free';

        // 6. Move to the next middleware/route handler
        next();

    } catch (error) {
        // 7. If something goes wrong, return an error response
        res.json({ success: false, message: error.message });
    }
};
