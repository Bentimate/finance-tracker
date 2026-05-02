import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {Typography} from '../../../components/Typography';
import {BottomSheet} from '../../../components/BottomSheet';
import {styles} from '../styles/TransactionFormScreen.styles';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  date: Date;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  date,
  onChange,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight={400}>
      <View style={styles.modalHeader}>
        <Typography variant="h3">Select Date</Typography>
        <TouchableOpacity onPress={onClose}>
          <Typography color="primary">Done</Typography>
        </TouchableOpacity>
      </View>
      <DateTimePicker
        value={date}
        mode="date"
        display="spinner"
        onChange={onChange}
      />
    </BottomSheet>
  );
};
