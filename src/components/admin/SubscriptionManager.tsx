'use client';

import { useState, useEffect } from 'react';
import { StoreMeta } from '../../types/store';
import { updateStoreMeta } from '../../lib/db';
import { Timestamp } from 'firebase/firestore';
import { Switch } from '../../components/ui/switch'; // Assuming you have a ShadCN/UI switch
import { Button } from '../../components/ui/button'; // Assuming you have a ShadCN/UI button
import { Label } from '../../components/ui/label';

interface SubscriptionManagerProps {
  storeMeta: StoreMeta;
  onUpdate: () => void; // Callback to refresh data on parent
}

// Helper to format Firestore Timestamp to yyyy-MM-dd for input[type=date]
const formatDateForInput = (timestamp: Timestamp | undefined) => {
  if (!timestamp) return '';
  return timestamp.toDate().toISOString().split('T')[0];
};

const SubscriptionManager = ({ storeMeta, onUpdate }: SubscriptionManagerProps) => {
  const [isActive, setIsActive] = useState(storeMeta.isSubscriptionActive);
  const [endDate, setEndDate] = useState(formatDateForInput(storeMeta.subscriptionEndDate));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsActive(storeMeta.isSubscriptionActive);
    setEndDate(formatDateForInput(storeMeta.subscriptionEndDate));
  }, [storeMeta]);

  const handleSaveChanges = async () => {
    if (!storeMeta.id) return;
    setIsSaving(true);
    try {
      const newEndDate = endDate ? Timestamp.fromDate(new Date(endDate)) : null;

      let dataToUpdate: Partial<StoreMeta> = {
        isSubscriptionActive: isActive,
        subscriptionEndDate: newEndDate || undefined, // a null value would remove it
      };

      // If subscription is being deactivated, lock the account
      if (storeMeta.isSubscriptionActive && !isActive) {
        dataToUpdate.subscriptionStatus = 'locked';
      }

      await updateStoreMeta(storeMeta.id, dataToUpdate);
      alert('Subscription updated successfully!');
      onUpdate(); // Trigger data refresh in parent
    } catch (error) {
      console.error('Failed to update subscription:', error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">Subscription Control</h3>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <Label htmlFor="subscription-switch" className="font-medium text-gray-700 dark:text-gray-300">
                    Subscription Active
                </Label>
                <Switch
                    id="subscription-switch"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="data-[state=checked]:bg-green-500"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="end-date" className="font-medium text-gray-700 dark:text-gray-300">
                    Subscription End Date
                </Label>
                <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full">
                {isSaving ? 'Saving...' : 'Save Subscription Changes'}
            </Button>
        </div>
    </div>
  );
};

export default SubscriptionManager;
