import React from 'react';
import {TextInput, TextStyle, View} from 'react-native';
import {theme} from '../../../../theme';
import {Typography} from '../../../../components/Typography';
import {styles} from '../../styles/TransactionFormScreen.styles';

interface Props {
  amountContainerRef: React.RefObject<View | null>;
  displayAmount: string;
  isExpenseInput: boolean;
  onLayout: () => void;
  onFocus: () => void;
}

export const AmountSection: React.FC<Props> = ({
  amountContainerRef,
  displayAmount,
  isExpenseInput,
  onLayout,
  onFocus,
}) => {
  return (
    <View ref={amountContainerRef} style={styles.amountContainer} onLayout={onLayout}>
      <TextInput
        style={[
          styles.amountInput as TextStyle,
          {color: isExpenseInput ? theme.colors.error : theme.colors.success},
        ]}
        value={displayAmount}
        onChangeText={() => {}}
        editable
        showSoftInputOnFocus={false}
        contextMenuHidden
        caretHidden
        placeholder="$0.00"
        placeholderTextColor={theme.colors.textMuted}
        onFocus={onFocus}
      />
      <Typography variant="caption" color="textMuted" style={styles.amountLabel}>
        press +/- to toggle between expense and income
      </Typography>
    </View>
  );
};
