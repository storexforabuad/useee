'use server'
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/db';

export async function incrementOrderCount(storeId: string, count: number) {
  const storeRef = doc(db, 'stores', storeId);
  await updateDoc(storeRef, {
    totalOrders: increment(count),
  });
}