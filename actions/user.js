"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data){
 const {userId} = await auth();
 if(!userId) throw new Error("Unauthorized");

 const user = await db.user.findUnique({
    where:{
        clerkUserId:userId,
    },
 });

 if(!user) throw new Error("User not found");

 try{
    const result = await  db.$transaction(
        async (tx) =>{
             //find if industry exists

             let industryInsight = await tx.industryInsight.findUnique({
                where:{
                    industry: data.industry,
                },
             });

             //if industry doesn't exits, create it with default values - will replace it with ai later
             if(!industryInsight){
                // industryInsight = await tx.industryInsight.create({
                //     data:{
                //         industry: data.industry,
                //         salaryRanges: [],
                //         growthRate:0,
                //         demandLevel:"MEDIUM",
                //         topSkills: [],
                //         marketOutlook:"NEUTRAL",
                //         keyTrends:[],
                //         recommendedSkills:[],
                //         nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //1 week from now   
                //     },
                // })

                 const insights = await generateAIInsights(data.industry);

                 industryInsight = await db.industryInsight.create({
                  data: {
                    industry: data.industry,
                    ...insights,
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  },
                });

             }
             

             //update the user
             const updateUser = await tx.user.update({
                where:{
                   id:user.id,
                },
                data:{
                    industry: data.industry,
                    experience: data.experience,
                    bio: data.bio,
                    skills: data.skills,
                },
             });

             return {updateUser , industryInsight}
        },
        {
            timeout:10000, //default: 5000
        }
    );

    return {success: true , ...result };
 }catch (error){
    console.log("Error updating user and industry :" , error.message);
    throw new Error("failed to update profile" + error.message);
    
 }
}

export async function getUserOnboardingStatus() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  
    const user = await db.user.findUnique({
      where: { 
        clerkUserId: userId 
      },
    });
  
    if (!user) throw new Error("User not found");
  
    try {
      const user = await db.user.findUnique({
        where: {
          clerkUserId: userId,
        },
        select: {
          industry: true,
        },
      });
  
      return {
        isOnboarded: !!user?.industry,
      };
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      throw new Error("Failed to check onboarding status");
    }
  }




  