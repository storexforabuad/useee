
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { StoreMeta } from '../../../types/store';
import { getStoreMeta, updateStoreMeta } from '../../../lib/db'; // Assuming db functions are in this path
import { ONBOARDING_WINDOW_HOURS, SUBSCRIPTION_WARNING_DAYS, TRIAL_DURATION_DAYS } from '../../../config/business';
import { Timestamp, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Component Imports
import AdminSkeleton from '../AdminSkeleton';
import LockedScreen from '../LockedScreen';
import AdminDashboard from './AdminDashboard'; // The main dashboard component

const calculateDaysRemaining = (endDate: Timestamp | undefined) => {
    if (!endDate) return Infinity;
    const now = new Date().getTime();
    const end = endDate.toDate().getTime();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
};

export default function Gatekeeper() {
    const params = useParams();
    const storeId = Array.isArray(params.storeId) ? params.storeId[0] : params.storeId;

    const [viewState, setViewState] = useState<'loading' | 'locked' | 'dashboard'>('loading');
    const [lockedReason, setLockedReason] = useState<'expired' | 'locked'>('locked');
    const [storeMeta, setStoreMeta] = useState<StoreMeta | null>(null);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [onboardingDismissed, setOnboardingDismissed] = useState(false);

    const checkAccess = useCallback(async () => {
        if (!storeId) return;

        const meta = await getStoreMeta(storeId);
        if (!meta) {
            setLockedReason('locked');
            setViewState('locked');
            return;
        }
        setStoreMeta(meta);

        if (meta.isSubscriptionActive) {
            const remaining = calculateDaysRemaining(meta.subscriptionEndDate);
            if (remaining <= SUBSCRIPTION_WARNING_DAYS) {
                setDaysRemaining(remaining);
            }
            setIsOnboarding(false);
            setViewState('dashboard');
            return;
        }

        if (meta.subscriptionStatus === 'trial') {
            const remaining = calculateDaysRemaining(meta.subscriptionEndDate);
            if (remaining > 0) {
                if (remaining <= SUBSCRIPTION_WARNING_DAYS) setDaysRemaining(remaining);
                setIsOnboarding(false);
                setViewState('dashboard');
            } else {
                await updateStoreMeta(storeId, { subscriptionStatus: 'locked' });
                setLockedReason('expired');
                setViewState('locked');
            }
            return;
        }

        if (meta.subscriptionStatus === 'prospect') {
            const elapsedHours = (Date.now() - meta.createdAt.toDate().getTime()) / (1000 * 60 * 60);
            if (elapsedHours < ONBOARDING_WINDOW_HOURS) {
                setIsOnboarding(true);
                setViewState('dashboard');
            } else {
                await updateStoreMeta(storeId, { subscriptionStatus: 'locked' });
                setLockedReason('locked');
                setViewState('locked');
            }
            return;
        }

        setLockedReason(meta.subscriptionStatus === 'grace_period' ? 'expired' : 'locked');
        setViewState('locked');

    }, [storeId]);

    useEffect(() => {
        checkAccess();
    }, [checkAccess]);

    // Real-time listener for store metadata changes
    useEffect(() => {
        if (!storeId) return;

        const storeRef = doc(db, 'stores', storeId);
        const unsubscribe = onSnapshot(storeRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const updatedMeta: StoreMeta = {
                    id: doc.id,
                    name: data.name || '',
                    isSubscriptionActive: data.isSubscriptionActive || false,
                    createdAt: data.createdAt || Timestamp.now(),
                    subscriptionStatus: data.subscriptionStatus || 'prospect',
                    onboardingTasks: data.onboardingTasks || {
                        productUploads: 0,
                        views: 0,
                        hasCreatedCategory: false
                    },
                    ...data
                } as StoreMeta;

                setStoreMeta(updatedMeta);

                // Recalculate onboarding status if needed
                // Only re-enable onboarding if it hasn't been manually dismissed
                if (updatedMeta.subscriptionStatus === 'prospect') {
                    const elapsedHours = (Date.now() - updatedMeta.createdAt.toDate().getTime()) / (1000 * 60 * 60);
                    if (elapsedHours < ONBOARDING_WINDOW_HOURS && !onboardingDismissed) {
                        setIsOnboarding(true);
                    }
                } else if (updatedMeta.subscriptionStatus === 'trial' || updatedMeta.isSubscriptionActive) {
                    setIsOnboarding(false);
                    setOnboardingDismissed(false); // Reset when status changes to non-prospect
                }
            }
        }, (error) => {
            console.error('Error listening to store metadata changes:', error);
        });

        return () => unsubscribe();
    }, [storeId]);

    const handleCompleteOnboarding = async () => {
        if (!storeId) return;
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DURATION_DAYS);
        await updateStoreMeta(storeId, {
            subscriptionStatus: 'trial',
            subscriptionEndDate: Timestamp.fromDate(trialEndDate)
        });
        checkAccess();
    };


    if (viewState === 'loading') {
        return <AdminSkeleton screen="home" />;
    }

    if (viewState === 'locked') {
        return <LockedScreen status={lockedReason} />;
    }

    if (viewState === 'dashboard' && storeMeta) {
        return (
            <AdminDashboard
              storeId={storeId}
              storeMeta={storeMeta}
              daysRemaining={daysRemaining}
              isOnboarding={isOnboarding}
              onOnboardingComplete={handleCompleteOnboarding}
              onDismissOnboarding={() => {
                setIsOnboarding(false);
                setOnboardingDismissed(true);
              }}
            />
        );
    }

    return <AdminSkeleton screen="home" />;
}
