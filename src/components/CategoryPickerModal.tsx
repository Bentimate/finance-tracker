import React from 'react';
import {ScrollView} from 'react-native';

import {BottomSheet} from './BottomSheet';
import {ParentCategory} from '../types';
import {useCategoryPickerViewModel} from './viewmodel/useCategoryPickerViewModel';
import {PickerHeader} from './category-picker/PickerHeader';
import {ParentRow} from './category-picker/ParentRow';
import {ChildRow, OthersRow} from './category-picker/ChildRows';

interface Props {
  visible: boolean;
  onClose: () => void;
  categories: ParentCategory[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number) => void;
}

export const CategoryPickerModal: React.FC<Props> = ({
  visible,
  onClose,
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const viewModel = useCategoryPickerViewModel({
    visible,
    onClose,
    onSelectCategory,
  });

  return (
    <BottomSheet visible={visible} onClose={viewModel.handleClose} maxHeight={480}>
      <PickerHeader
        step={viewModel.step}
        pendingParent={viewModel.pendingParent}
        onBack={viewModel.handleBack}
        onClose={viewModel.handleClose}
      />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {viewModel.step === 'parent'
          ? categories.map(parent => (
              <ParentRow
                key={parent.id}
                parent={parent}
                isSelected={selectedCategoryId === parent.id}
                onPress={() => viewModel.handleParentPress(parent)}
              />
            ))
          : viewModel.pendingParent && (
              <>
                {viewModel.pendingParent.children.map(child => (
                  <ChildRow
                    key={child.id}
                    child={child}
                    isSelected={selectedCategoryId === child.id}
                    onPress={() => viewModel.handleChildPress(child)}
                  />
                ))}
                <OthersRow
                  parent={viewModel.pendingParent}
                  isSelected={selectedCategoryId === viewModel.pendingParent.id}
                  onPress={() => viewModel.handleChildPress('others')}
                />
              </>
            )}
      </ScrollView>
    </BottomSheet>
  );
};
