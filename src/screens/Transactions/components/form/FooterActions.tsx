import React from 'react';
import {View} from 'react-native';
import {theme} from '../../../../theme';
import {Button} from '../../../../components/Button';
import {styles} from '../../styles/TransactionFormScreen.styles';

interface Props {
  isEdit: boolean;
  loading: boolean;
  onDelete: () => void;
  onSave: () => void;
}

export const FooterActions: React.FC<Props> = ({isEdit, loading, onDelete, onSave}) => {
  return (
    <View style={styles.footer}>
      {isEdit && (
        <Button
          title="Delete"
          variant="outline"
          onPress={onDelete}
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />
      )}
      <Button title={isEdit ? 'Update' : 'Save Transaction'} onPress={onSave} loading={loading} style={styles.saveButton} />
    </View>
  );
};
