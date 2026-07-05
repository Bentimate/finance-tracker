import {Typography} from './Typography'
import {StyleProp, TouchableOpacity, ViewStyle} from 'react-native';
import {styles} from './styles/PlusButton.styles'

interface PlusButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  label?: string;
}

export const PlusButton: React.FC<PlusButtonProps> = ({onPress, style, label = '+'}) => {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Typography style={styles.fabText}>{label}</Typography>
    </TouchableOpacity>
  );
};
