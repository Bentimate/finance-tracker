import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../../../../theme';
import {Typography} from '../../../../components/Typography';
import {styles} from '../../styles/TransactionFormScreen.styles';

interface Props {
  date: Date;
  onPress: () => void;
}

export const DateSection: React.FC<Props> = ({date, onPress}) => {
  return (
    <View style={styles.section}>
      <Typography variant="label" color="textSecondary" style={styles.fieldLabel}>
        DATE
      </Typography>
      <TouchableOpacity
        style={styles.dateSelector}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Select transaction date">
        <Typography variant="body" style={styles.dateValue}>
          {date.toLocaleDateString()}
        </Typography>
        <View style={styles.dateHintContainer}>
          <MaterialIcon name="calendar-month" size={24} color={theme.colors.textMuted} />
        </View>
      </TouchableOpacity>
    </View>
  );
};
