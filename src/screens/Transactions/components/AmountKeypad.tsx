import React from 'react';
import {View, TouchableOpacity, Modal} from 'react-native';
import {Typography} from '../../../components/Typography';
import {styles} from '../styles/TransactionFormScreen.styles';

interface AmountKeypadProps {
  visible: boolean;
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
  onClose,
  onAppendDigit,
  onAppendDecimal,
  onToggleSign,
  onBackspace,
  onClear,
  onDone,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.amountKeypadModalBackdrop}>
        <TouchableOpacity
          style={styles.amountKeypadBackdropPressable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.amountKeypadSheet}>
          <View style={styles.keypadContainer}>
            <View style={styles.keypadGrid}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={styles.keypadKey}
                  onPress={() => onAppendDigit(digit)}>
                  <Typography variant="h3" style={styles.keypadKeyText}>
                    {digit}
                  </Typography>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.keypadKey} onPress={onToggleSign}>
                <Typography variant="h3" style={styles.keypadKeyText}>
                  +/-
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.keypadKey} onPress={() => onAppendDigit('0')}>
                <Typography variant="h3" style={styles.keypadKeyText}>
                  0
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.keypadKey} onPress={onAppendDecimal}>
                <Typography variant="h3" style={styles.keypadKeyText}>
                  .
                </Typography>
              </TouchableOpacity>
            </View>

            <View style={styles.keypadActionsRow}>
              <TouchableOpacity style={styles.keypadActionKey} onPress={onClear}>
                <Typography variant="label" style={styles.keypadActionText}>
                  Clear
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keypadActionKey} onPress={onBackspace}>
                <Typography variant="label" style={styles.keypadActionText}>
                  Backspace
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.keypadActionKey, styles.keypadDoneKey]}
                onPress={onDone}>
                <Typography variant="label" style={styles.keypadDoneText}>
                  Done
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
