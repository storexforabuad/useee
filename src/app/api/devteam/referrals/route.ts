'use server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collectionGroup, getDocs } from 'firebase/firestore';

interface Referral {
  id: string;
  businessName: string;
  businessNumber: string;
  storeId: string;
  createdAt: any;
}

// GET all referrals for the dev team, grouped by store
export async function GET(req: NextRequest) {
  try {
    const referralsQuery = collectionGroup(db, 'referrals');
    const querySnapshot = await getDocs(referralsQuery);

    const referralsByStore: { [key: string]: Referral[] } = {};

    querySnapshot.docs.forEach(doc => {
      const referral = doc.data() as Omit<Referral, 'id' | 'storeId'>;
      const storeId = doc.ref.parent.parent?.id;

      if (storeId) {
        if (!referralsByStore[storeId]) {
          referralsByStore[storeId] = [];
        }
        referralsByStore[storeId].push({
          id: doc.id,
          storeId: storeId,
          ...referral
        });
      }
    });

    return NextResponse.json(referralsByStore, { status: 200 });

  } catch (error) {
    console.error('Error fetching all referrals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
