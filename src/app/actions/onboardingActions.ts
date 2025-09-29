'use server';

import { db } from '@/lib/db';
import { WriteBatch, collection, getDocs, writeBatch, doc, updateDoc } from 'firebase/firestore';

export async function resetAllOnboardingStatuses() {
  try {
    const storesCollectionRef = collection(db, 'stores');
    const querySnapshot = await getDocs(storesCollectionRef);

    if (querySnapshot.empty) {
      return { success: true, message: 'No stores found to reset.' };
    }

    const batch: WriteBatch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { hasCompletedOnboarding: false });
    });

    await batch.commit();

    return { success: true, message: `Reset onboarding status for ${querySnapshot.size} stores.` };
  } catch (error) {
    console.error('Error resetting onboarding statuses:', error);
    return { success: false, message: 'An error occurred while resetting onboarding statuses.' };
  }
}

export async function markOnboardingAsCompleted(storeId: string) {
  try {
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      hasCompletedOnboarding: true,
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking onboarding as completed:", error);
    return { success: false, message: "Failed to update onboarding status." };
  }
}
