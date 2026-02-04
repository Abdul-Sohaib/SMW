import { useState, useEffect } from 'react';
import { Warrior, FlaggedWarrior } from '../models/types';
import { WarriorController } from '../controllers/WarriorController';

export function useWarriors(showFlagged: boolean = false) {
  const [warriors, setWarriors] = useState<Warrior[]>([]);
  const [flaggedWarriors, setFlaggedWarriors] = useState<FlaggedWarrior[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const controller = new WarriorController();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (showFlagged) {
          const data = await controller.getFlaggedWarriors();
          setFlaggedWarriors(data);
        } else {
          const data = await controller.getAllWarriors();
          setWarriors(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [controller, showFlagged]);

  const clearFlag = async (warriorId: number) => {
    try {
      await controller.clearFlag(warriorId);
      setFlaggedWarriors(prev => prev.filter(w => w.id !== warriorId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear flag');
    }
  };

  const suspendWarrior = async (warriorId: number) => {
    try {
      await controller.suspendWarrior(warriorId);
      // Update the warrior status in the list
      setWarriors(prev => 
        prev.map(w => w.id === warriorId ? { ...w, status: 'inactive' } : w)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend warrior');
    }
  };

  return {
    warriors,
    flaggedWarriors,
    loading,
    error,
    clearFlag,
    suspendWarrior,
  };
}