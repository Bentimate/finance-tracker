import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Typography} from '../../../../components/Typography';
import {styles} from '../DashboardDateFilter.styles';

import {DateMode} from './types';

interface Props {
  selectedMode: DateMode;
  onToggle: (mode: DateMode) => void;
}

export const ModeToggle: React.FC<Props> = ({selectedMode, onToggle}) => {
  return (
    <View style={styles.modeToggle}>
      {(['single', 'range'] as DateMode[]).map(mode => (
        <TouchableOpacity
          key={mode}
          style={[styles.modeButton, selectedMode === mode && styles.modeButtonActive]}
          onPress={() => onToggle(mode)}
          activeOpacity={0.7}>
          <Typography variant="caption" weight="medium" color={selectedMode === mode ? 'primary' : 'textMuted'}>
            {mode === 'single' ? 'Month' : 'Range'}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );
};
