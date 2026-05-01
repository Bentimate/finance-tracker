import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Typography} from '../../../components/Typography';
import {styles} from '../styles/TransactionListScreen.styles';

export type ViewMode = 'today' | 'week' | 'month';

interface ViewModeTabsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const TABS: {key: ViewMode; label: string}[] = [
  {key: 'today', label: 'Today'},
  {key: 'week', label: 'Week'},
  {key: 'month', label: 'Month'},
];

export const ViewModeTabs: React.FC<ViewModeTabsProps> = ({viewMode, onViewModeChange}) => {
  return (
    <View style={styles.tabRow}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, viewMode === tab.key && styles.tabActive]}
          onPress={() => onViewModeChange(tab.key)}
          activeOpacity={0.7}>
          <Typography
            variant="label"
            color={viewMode === tab.key ? 'primary' : 'textMuted'}>
            {tab.label}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );
};
