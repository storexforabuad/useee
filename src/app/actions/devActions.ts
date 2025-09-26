"use server";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/db";

export const getStoreCaption = async (storeId: string): Promise<string | null> => {
  const storeRef = doc(db, "stores", storeId);
  const storeSnap = await getDoc(storeRef);

  if (storeSnap.exists()) {
    return storeSnap.data().promoCaption || null;
  }

  return null;
};

export const updateStoreCaption = async (storeId: string, caption: string): Promise<void> => {
  const storeRef = doc(db, "stores", storeId);
  await updateDoc(storeRef, {
    promoCaption: caption,
  });
};
