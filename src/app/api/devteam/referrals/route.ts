'use server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collectionGroup, getDocs } from 'firebase/firestore';

interface Referral {
  id: string;
  businessName: string;
  businessNumber: string;
  storeId: string;
  createdAt: { seconds: number; nanoseconds: number; };
}

// GET all referrals for the dev team, grouped by store
export async function GET(_req: NextRequest) {
  try {
    const referralsQuery = collectionGroup(db, 'referrals');
    const querySnapshot = await getDocs(referralsQuery);

    const referralsByStore: { [key: string]: Referral[] } = {};

    querySnapshot.docs.forEach(doc => {
      const referralData = doc.data();
      const storeId = doc.ref.parent.parent?.id;

      if (storeId) {
        if (!referralsByStore[storeId]) {
          referralsByStore[storeId] = [];
        }

        // Safely handle the timestamp
        const createdAt = (referralData.createdAt && referralData.createdAt.seconds !== undefined)
          ? { seconds: referralData.createdAt.seconds, nanoseconds: referralData.createdAt.nanoseconds }
          : { seconds: 0, nanoseconds: 0 };

        const referral: Referral = {
          id: doc.id,
          storeId: storeId,
          businessName: referralData.businessName,
          businessNumber: referralData.businessNumber,
          createdAt: createdAt,
        };
        
        referralsByStore[storeId].push(referral);
      }
    });

    return NextResponse.json(referralsByStore, { status: 200 });

  } catch (error) {
    console.error('Error fetching all referrals:', error);
    if (error instanceof Error && error.message.includes('requires an index')) {
        return NextResponse.json(
            { 
                error: 'Firestore index required', 
                message: 'A Firestore index is required to complete this query. Please create the index in your Firebase console.' 
            }, 
            { status: 500 }
        );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
