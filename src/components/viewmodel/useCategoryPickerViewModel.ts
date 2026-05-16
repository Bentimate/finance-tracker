import {useCallback, useEffect, useState} from 'react';
import {ParentCategory, Category} from '../../types';

export type CategoryPickerStep = 'parent' | 'child';

export interface CategoryPickerViewModel {
  step: CategoryPickerStep;
  pendingParent: ParentCategory | null;
  handleClose: () => void;
  handleParentPress: (parent: ParentCategory) => void;
  handleChildPress: (child: Category | 'others') => void;
  handleBack: () => void;
}

interface UseCategoryPickerViewModelInput {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (id: number) => void;
}

export function useCategoryPickerViewModel(input: UseCategoryPickerViewModelInput): CategoryPickerViewModel {
  const [step, setStep] = useState<CategoryPickerStep>('parent');
  const [pendingParent, setPendingParent] = useState<ParentCategory | null>(null);

  const reset = useCallback(() => {
    setStep('parent');
    setPendingParent(null);
  }, []);

  useEffect(() => {
    if (input.visible) {
      reset();
    }
  }, [input.visible, reset]);

  const handleClose = useCallback(() => {
    reset();
    input.onClose();
  }, [input, reset]);

  const handleParentPress = useCallback(
    (parent: ParentCategory) => {
      if ((parent.children ?? []).length === 0) {
        input.onSelectCategory(parent.id);
        handleClose();
        return;
      }

      setPendingParent(parent);
      setStep('child');
    },
    [input, handleClose],
  );

  const handleChildPress = useCallback(
    (child: Category | 'others') => {
      if (!pendingParent) {
        return;
      }

      const id = child === 'others' ? pendingParent.id : child.id;
      input.onSelectCategory(id);
      handleClose();
    },
    [pendingParent, input, handleClose],
  );

  const handleBack = useCallback(() => {
    reset();
  }, [reset]);

  return {
    step,
    pendingParent,
    handleClose,
    handleParentPress,
    handleChildPress,
    handleBack,
  };
}
