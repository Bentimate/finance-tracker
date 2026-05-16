import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Input} from '../../components/Input';
import {Screen} from '../../components/Screen';
import {Typography} from '../../components/Typography';
import IconPickerModal from '../../components/IconPickerModal';
import {ColorPicker} from './components/ColorPicker';
import {ParentPickerModal} from './components/form/ParentPickerModal';
import {CategoryFormFooter} from './components/form/CategoryFormFooter';
import {theme} from '../../theme';
import {styles} from './styles/CategoryFormScreen.styles';
import {useCategoryFormViewModel} from './viewmodel/useCategoryFormViewModel';

const CategoryFormScreen: React.FC = () => {
  const vm = useCategoryFormViewModel();

  return (
    <Screen
      withKeyboardAvoidingView
      scrollable
      contentStyle={styles.content}
      edges={[]}
      footer={
        <CategoryFormFooter
          isEdit={vm.isEdit}
          loading={vm.loading}
          onArchive={() => void vm.handleArchive()}
          onSave={() => void vm.handleSave()}
        />
      }>
      <Input
        label="Category Name"
        value={vm.name}
        onChangeText={vm.setName}
        placeholder="e.g. Groceries"
        error={vm.nameError}
        autoFocus={!vm.isEdit}
      />

      <View style={styles.field}>
        <Typography variant="label" color="textSecondary" style={styles.fieldLabel}>
          ICON (OPTIONAL)
        </Typography>
        <TouchableOpacity
          style={styles.selectorRow}
          onPress={() => vm.setIconPickerVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Choose icon">
          {vm.icon ? (
            <View style={styles.selectorRowInner}>
              <MaterialIcon name={vm.icon} size={24} color={vm.color} />
              <Typography variant="body">{vm.icon}</Typography>
            </View>
          ) : (
            <Typography variant="body" color="textMuted">
              Tap to choose an icon...
            </Typography>
          )}
          <MaterialIcon name="chevron-right" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.field}>
        <Typography variant="label" color="textSecondary" style={styles.fieldLabel}>
          PARENT CATEGORY (OPTIONAL)
        </Typography>

        {vm.isEdit && vm.hasChildren ? (
          <View style={[styles.selectorRow, styles.selectorRowDisabled]}>
            <Typography variant="body" color="textMuted">
              {vm.selectedParent ? vm.selectedParent.name : 'None (top-level)'}
            </Typography>
            <Typography variant="caption" color="textMuted">
              Has subcategories
            </Typography>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.selectorRow}
            onPress={() => vm.setParentPickerVisible(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Choose parent category">
            {vm.selectedParent ? (
              <View style={styles.selectorRowInner}>
                <View style={[styles.colorDot, {backgroundColor: vm.selectedParent.color}]} />
                <Typography variant="body">{vm.selectedParent.name}</Typography>
              </View>
            ) : (
              <Typography variant="body" color="textMuted">
                None (top-level category)
              </Typography>
            )}
            <MaterialIcon name="chevron-right" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <IconPickerModal
        visible={vm.isIconPickerVisible}
        selectedIcon={vm.icon}
        onSelect={vm.setIcon}
        onClose={() => vm.setIconPickerVisible(false)}
      />

      <ParentPickerModal
        visible={vm.isParentPickerVisible}
        categories={vm.selectableParents}
        selectedId={vm.parentId}
        onSelect={id => {
          vm.setParentId(id);
          vm.setParentPickerVisible(false);
        }}
        onClose={() => vm.setParentPickerVisible(false)}
      />

      <ColorPicker selectedColor={vm.color} onColorSelect={vm.setColor} />
    </Screen>
  );
};

export default CategoryFormScreen;
