'use server';

import { db } from '../../lib/db';
import { doc, updateDoc } from 'firebase/firestore';

export async function markOnboardingAsCompleted(storeId: string): Promise<{ success: boolean; error?: string }> {
  if (!storeId) {
    return { success: false, error: 'Store ID is required.' };
  }

  try {
    const storeDocRef = doc(db, `stores/${storeId}`);
    await updateDoc(storeDocRef, {
      hasCompletedOnboarding: true,
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking onboarding as completed:', error);
    // Narrowing the error type
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred.' };
  }
}
