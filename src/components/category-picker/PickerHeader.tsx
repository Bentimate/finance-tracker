import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Typography} from '../Typography';
import {theme} from '../../theme';
import {styles} from '../styles/CategoryPickerModalRows.styles';
import {ParentCategory} from '../../types';

interface Props {
  step: 'parent' | 'child';
  pendingParent: ParentCategory | null;
  onBack: () => void;
  onClose: () => void;
}

export const PickerHeader: React.FC<Props> = ({step, pendingParent, onBack, onClose}) => {
  return (
    <View style={styles.header}>
      {step === 'child' ? (
        <TouchableOpacity onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <MaterialIcon name="arrow-left" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}

      <View style={styles.headerTitle}>
        {step === 'child' && pendingParent ? (
          <View style={styles.headerBreadcrumb}>
            {pendingParent.icon && (
              <MaterialIcon
                name={pendingParent.icon}
                size={16}
                color={pendingParent.color}
                style={styles.breadcrumbIcon}
              />
            )}
            <Typography variant="h3">{pendingParent.name}</Typography>
            <MaterialIcon name="chevron-right" size={16} color={theme.colors.textMuted} />
          </View>
        ) : (
          <Typography variant="h3">Category</Typography>
        )}
      </View>

      <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
        <MaterialIcon name="close" size={22} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};
