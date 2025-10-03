
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;

async function isCodeUnique(code: string): Promise<boolean> {
  const q = query(collection(db, "users"), where("referralCode", "==", code));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

export async function generateUniqueReferralCode(): Promise<string> {
  let code = "";
  let isUnique = false;

  while (!isUnique) {
    code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
    isUnique = await isCodeUnique(code);
  }

  return code;
}
