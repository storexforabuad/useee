
"use client";

import { FC } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { upsertUser } from "@/app/actions/onboardingActions";
import { useModalStore } from "@/lib/modalStore";
import Modal from "@/components/admin/modals/Modal";

const SignInModal: FC = () => {
  const { isSignInModalOpen, closeSignInModal } = useModalStore();

  const handleGoogleSignIn = async () => {
    const googleProvider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        await upsertUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      }
      closeSignInModal();
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      // You can add a toast notification here to inform the user
    }
  };

  return (
    <Modal
      isOpen={isSignInModalOpen}
      onClose={closeSignInModal}
      title="Join Bizcon"
    >
      <div className="p-6 text-center">
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Sign in to continue your journey in the #1 marketplace for Northern Nigeria.
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 381.4 512 244 512 111.8 512 0 400.2 0 261.8S111.8 11.6 244 11.6c67.3 0 121.3 24.8 165.7 66.5l-63.3 61.9C318.4 111.5 283.5 97 244 97c-84.9 0-154.3 68.6-154.3 153.4s69.4 153.4 154.3 153.4c97.2 0 133.3-66.9 137-101.9H244v-75.1h236.4c2.5 12.8 3.6 26.3 3.6 40.5z"
            ></path>
          </svg>
          Sign in with Google
        </button>
      </div>
    </Modal>
  );
};

export default SignInModal;
