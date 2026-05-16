import React from 'react';
import {View} from 'react-native';
import {Button} from '../../../../components/Button';
import {styles} from '../../styles/CategoryFormScreen.styles';

interface Props {
  isEdit: boolean;
  loading: boolean;
  onArchive: () => void;
  onSave: () => void;
}

export const CategoryFormFooter: React.FC<Props> = ({isEdit, loading, onArchive, onSave}) => {
  return (
    <View style={styles.footerRow}>
      {isEdit && (
        <Button
          title="Archive"
          variant="outline"
          onPress={onArchive}
          style={[styles.footerButtonBase, styles.archiveButton]}
          textStyle={styles.archiveButtonText}
        />
      )}
      <Button
        title={isEdit ? 'Update Category' : 'Create Category'}
        onPress={onSave}
        loading={loading}
        style={styles.footerButtonPrimary}
      />
    </View>
  );
};
