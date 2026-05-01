import React from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Typography} from './Typography';
import {Category} from '../types';
import {theme} from '../theme';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number) => void;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  onClose,
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Typography variant="h3">Select Category</Typography>
            <TouchableOpacity onPress={onClose}>
              <Typography color="primary">Done</Typography>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.categoryList}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  selectedCategoryId === item.id && styles.categoryOptionSelected,
                ]}
                onPress={() => {
                  onSelectCategory(item.id);
                }}>
                <View style={[styles.categoryDot, {backgroundColor: item.color}]} />
                <Typography
                  variant="body"
                  weight={selectedCategoryId === item.id ? 'bold' : 'regular'}>
                  {item.name}
                </Typography>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryList: {
    padding: theme.spacing.md,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  categoryOptionSelected: {
    backgroundColor: theme.colors.border,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
  },
});
