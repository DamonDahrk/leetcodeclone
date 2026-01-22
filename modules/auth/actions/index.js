"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, 
        error: "No authenticated user found" };
    }

    const { id, firstName, lastName, imageUrl, emailAddresses } = user;

    const newUser = await db.user.upsert({
  where: {
    clerkId: id,
  },
  update: {
    firstName: firstName || null,
    lastName: lastName || null,
    imageUrl: imageUrl || null,
    email: emailAddresses[0]?.emailAddress || "",
  },
  create: {
    clerkId: id,
    firstName: firstName || null,
    lastName: lastName || null,
    imageUrl: imageUrl || null,
    email: emailAddresses[0]?.emailAddress || "",
  },
});
return {
  success: true,
  user: newUser,
  message: "User onBoarded Successfully"
};
} catch (error) {
  console.error("❌ Error onboarding user:", error);
  return {
    success: false,
    error: "Failed to onboard user"
  };
}
};

export const currentUserRole = async () => {
  try {
    // Get the currently authenticated user from Clerk
    const user = await currentUser();

    // If no user is logged in, stop execution
    if (!user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Extract Clerk user ID
    // This ID is stored as `clerkId` in the database
    const { id } = user;

    // Fetch only the user's role from the database
    const userRole = await db.user.findUnique({
      where: {
        clerkId: id, // Match Clerk user with DB user
      },
      select: {
        role: true, // Only select the role field
      },
    });

    // Return the role (e.g., "ADMIN" or "USER")
    return userRole.role;

  } catch (error) {
    // Log the error for debugging
    console.error("❌ Error fetching user role:", error);

    // Return a safe error response
    return { success: false, error: "Failed to fetch user role" };
  }
};


