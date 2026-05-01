import React from 'react';
import {View, TouchableOpacity, Modal} from 'react-native';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {Typography} from '../../../components/Typography';
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
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
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
        </View>
      </View>
    </Modal>
  );
};
