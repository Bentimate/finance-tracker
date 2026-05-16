import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../../../../theme';
import {Typography} from '../../../../components/Typography';
import {styles} from '../../styles/TransactionFormScreen.styles';

interface SelectedDisplay {
  label: string;
  color: string;
  icon: string | null;
}

interface Props {
  selectedDisplay: SelectedDisplay | null;
  onPress: () => void;
}

export const CategorySection: React.FC<Props> = ({selectedDisplay, onPress}) => {
  return (
    <View style={styles.section}>
      <Typography variant="label" color="textSecondary" style={styles.fieldLabel}>
        CATEGORY
      </Typography>
      <TouchableOpacity style={styles.categorySelector} onPress={onPress}>
        {selectedDisplay ? (
          <>
            {selectedDisplay.icon ? (
              <MaterialIcon
                name={selectedDisplay.icon}
                size={18}
                color={selectedDisplay.color}
                style={styles.categoryIcon}
              />
            ) : (
              <View style={[styles.categoryDot, {backgroundColor: selectedDisplay.color}]} />
            )}
            <Typography variant="body">{selectedDisplay.label}</Typography>
          </>
        ) : (
          <Typography variant="body" color="textMuted">
            Select Category
          </Typography>
        )}
      </TouchableOpacity>
    </View>
  );
};
