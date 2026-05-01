import {Typography} from './Typography'
import {TouchableOpacity} from 'react-native';
import {styles} from './styles/PlusButton.styles'

interface PlusButtonProps {
  onPress: () => void;
}

export const PlusButton: React.FC<PlusButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Typography style={styles.fabText}>+</Typography>
    </TouchableOpacity>
  );
};
