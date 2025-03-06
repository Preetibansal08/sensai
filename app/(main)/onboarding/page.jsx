import { getUserOnboardingStatus } from '@/actions/user';
import { industries } from '@/data/industries';
import OnboardingForm from "./_components/onboarding-form";
import { redirect } from 'next/navigation';

import React from 'react'

const OnboardingPage = async () => {
    //check if user is already onboarding

    const {isOnboarded} = await getUserOnboardingStatus();

    if(isOnboarded){
        redirect("/dashboard");
    }

  return (
    <main>
        <OnboardingForm industries={industries}/>
    </main>
  )
}

export default OnboardingPage;