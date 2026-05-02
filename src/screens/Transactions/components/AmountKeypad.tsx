import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Typography} from '../../../components/Typography';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface AmountKeypadProps {
  onAppendDigit: (digit: string) => void;
  onAppendDecimal: () => void;
  onToggleSign: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onDone: () => void;
}

export const AmountKeypad: React.FC<AmountKeypadProps> = ({
  onAppendDigit,
  onAppendDecimal,
  onToggleSign,
  onBackspace,
  onClear,
  onDone,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[keypadStyles.container, {paddingBottom: insets.bottom}]}>
      <View style={keypadStyles.grid}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
          <TouchableOpacity
            key={digit}
            style={keypadStyles.key}
            activeOpacity={0.6}
            onPress={() => onAppendDigit(digit)}>
            <Typography variant="h3" style={keypadStyles.keyText}>{digit}</Typography>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={keypadStyles.key} activeOpacity={0.6} onPress={onToggleSign}>
          <Typography variant="h3" style={keypadStyles.keyText}>+/-</Typography>
        </TouchableOpacity>

        <TouchableOpacity style={keypadStyles.key} activeOpacity={0.6} onPress={() => onAppendDigit('0')}>
          <Typography variant="h3" style={keypadStyles.keyText}>0</Typography>
        </TouchableOpacity>

        <TouchableOpacity style={keypadStyles.key} activeOpacity={0.6} onPress={onAppendDecimal}>
          <Typography variant="h3" style={keypadStyles.keyText}>.</Typography>
        </TouchableOpacity>
      </View>

      {/* Action row */}
      <View style={keypadStyles.actionsRow}>
        <TouchableOpacity style={keypadStyles.actionKey} activeOpacity={0.6} onPress={onClear}>
          <Typography variant="label" style={keypadStyles.actionText}>Clear</Typography>
        </TouchableOpacity>
        <TouchableOpacity style={keypadStyles.actionKey} activeOpacity={0.6} onPress={onBackspace}>
          <Typography variant="label" style={keypadStyles.actionText}>⌫</Typography>
        </TouchableOpacity>
        <TouchableOpacity style={[keypadStyles.actionKey, keypadStyles.doneKey]} activeOpacity={0.6} onPress={onDone}>
          <Typography variant="label" style={keypadStyles.doneText}>Done</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const keypadStyles = StyleSheet.create({
  container: {
    backgroundColor: '#D1D5DB', // native numpad gray
    paddingTop: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  key: {
    width: '32%', // 3 per row with gaps
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  keyText: {
    color: '#1C1C1E',
    fontWeight: '400',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  actionKey: {
    flex: 1,
    height: 48,
    backgroundColor: '#ADB5BD',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  actionText: {
    color: '#1C1C1E',
    fontWeight: '500',
  },
  doneKey: {
    backgroundColor: '#007AFF', // iOS-style confirm blue
  },
  doneText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});