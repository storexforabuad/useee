
'use server';

import { db } from '@/lib/db';
import { WriteBatch, collection, getDocs, writeBatch, doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { generateUniqueReferralCode } from '@/utils/referrals';

interface UserData {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

export async function upsertUser(userData: UserData) {
    const userRef = doc(db, 'users', userData.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // User is new, create a new document
        const referralCode = await generateUniqueReferralCode();
        await setDoc(userRef, {
            ...userData,
            referralCode,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
        });
    } else {
        // User exists, update last login time
        await updateDoc(userRef, {
            lastLoginAt: serverTimestamp(),
        });
    }

    const updatedUserSnap = await getDoc(userRef);
    return updatedUserSnap.data();
}


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
