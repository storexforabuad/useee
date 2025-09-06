"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, /* signInWithPopup, GoogleAuthProvider */ } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SpinnerCircle } from "./Spinner";
import { toast } from "react-toastify";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /*
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/admin");
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Image src="/next.svg" alt="Logo" width={100} height={100} className="mb-8 dark:invert" />
      <h1 className="text-3xl font-bold mb-6 text-text-primary">Sign In</h1>

      <form onSubmit={handleEmailSignIn} className="w-full max-w-sm bg-card p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:shadow-outline bg-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary mb-3 leading-tight focus:outline-none focus:shadow-outline bg-input"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <SpinnerCircle /> : "Sign In with Email"}
          </button>
        </div>
        {/* Corrected JSX comment syntax
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center w-full"
            disabled={loading}
          >
            {loading ? <SpinnerCircle /> : "Sign In with Google"}
          </button>
        </div>
        */}
      </form>
    </div>
  );
};

export default SignIn;
