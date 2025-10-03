import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/db';

// A simple slugify and random string generator for referral codes
const generateReferralCode = (name: string) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const randomString = Math.random().toString(36).substring(2, 7);
  return `${slug}-${randomString}`;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return new NextResponse(JSON.stringify({ message: "Email is required" }), { status: 400 });
    }

    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Customer exists, log them in
      const customerDoc = snapshot.docs[0];
      const customerData = {
        id: customerDoc.id,
        ...customerDoc.data()
      };
      return new NextResponse(JSON.stringify(customerData), { status: 200 });
    } else {
      // Customer does not exist
      if (name) {
        // This is a signup attempt
        const referralCode = generateReferralCode(name);
        const newCustomer = {
          name,
          email: email.toLowerCase(),
          referralCode,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(customersRef, newCustomer);
        
        // Construct the response object, ensuring all fields are present
        const responseCustomer = {
            id: docRef.id,
            name: newCustomer.name,
            email: newCustomer.email,
            referralCode: newCustomer.referralCode,
        }

        return new NextResponse(JSON.stringify(responseCustomer), { status: 201 });
      } else {
        // This is a login attempt for a non-existent user, prompt for signup
        return new NextResponse(JSON.stringify({ requiresSignup: true }), { status: 404 });
      }
    }
  } catch (error) {
    console.error("Auth API Error:", error);
    // It's better to not expose raw error messages to the client
    if (error instanceof Error) {
        console.error(error.message);
    }
    return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
