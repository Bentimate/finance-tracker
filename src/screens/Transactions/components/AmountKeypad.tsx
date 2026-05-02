import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Typography} from '../../../components/Typography';
import {BottomSheet} from '../../../components/BottomSheet';
import {styles} from '../styles/TransactionFormScreen.styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {theme} from '../../../theme';

interface AmountKeypadProps {
  visible: boolean;
  value: string;
  isExpense: boolean;
  topOffset: number; // Y coordinate of the original input
  onClose: () => void;
  onAppendDigit: (digit: string) => void;
  onAppendDecimal: () => void;
  onToggleSign: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onDone: () => void;
}

export const AmountKeypad: React.FC<AmountKeypadProps> = ({
  visible,
  value,
  isExpense,
  topOffset,
  onClose,
  onAppendDigit,
  onAppendDecimal,
  onToggleSign,
  onBackspace,
  onClear,
  onDone,
}) => {
  const insets = useSafeAreaInsets();

  const renderReplica = () => (
    <View
      style={{
        position: 'absolute',
        top: topOffset,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingVertical: 8,
        zIndex: 1000,
      }}
      pointerEvents="none">
      <Typography
        variant="h1"
        style={{
          fontSize: 48,
          lineHeight: 60,
          fontWeight: '700',
          color: isExpense ? `#f72f02` : '#0fed07',
          textAlign: 'center',
          includeFontPadding: false,
        }}>
        {value || '$0.00'}
      </Typography>
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      topContent={renderReplica()}
    >
      <View style={[styles.keypadContainer, {paddingHorizontal: 16, paddingTop: 16, paddingBottom: Math.max(insets.bottom, 16)}]}>
        <View style={styles.keypadGrid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
            <TouchableOpacity
              key={digit}
              style={styles.keypadKey}
              activeOpacity={0.6}
              onPress={() => onAppendDigit(digit)}>
              <Typography variant="h3" style={styles.keypadKeyText}>{digit}</Typography>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.keypadKey} activeOpacity={0.6} onPress={onToggleSign}>
            <Typography variant="h3" style={styles.keypadKeyText}>+/-</Typography>
          </TouchableOpacity>

          <TouchableOpacity style={styles.keypadKey} activeOpacity={0.6} onPress={() => onAppendDigit('0')}>
            <Typography variant="h3" style={styles.keypadKeyText}>0</Typography>
          </TouchableOpacity>

          <TouchableOpacity style={styles.keypadKey} activeOpacity={0.6} onPress={onAppendDecimal}>
            <Typography variant="h3" style={styles.keypadKeyText}>.</Typography>
          </TouchableOpacity>
        </View>

        {/* Action row */}
        <View style={styles.keypadActionsRow}>
          <TouchableOpacity style={styles.keypadActionKey} activeOpacity={0.6} onPress={onClear}>
            <Typography variant="label" style={styles.keypadActionText}>Clear</Typography>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keypadActionKey} activeOpacity={0.6} onPress={onBackspace}>
            <Typography variant="label" style={styles.keypadActionText}>⌫</Typography>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.keypadActionKey, {backgroundColor: theme.colors.primary}]} activeOpacity={0.6} onPress={onDone}>
            <Typography variant="label" style={{color: theme.colors.surface}}>Done</Typography>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};
