import {StyleSheet, Dimensions} from 'react-native';
import {theme} from '../../../theme';

const {width} = Dimensions.get('window');
const COLUMN_WIDTH = width / 7;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  monthContainer: {
    width: width,
  },
  weekdayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  weekdayCell: {
    width: COLUMN_WIDTH,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.3,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.border,
    padding: 2,
    backgroundColor: theme.colors.surface,
  },
  dayCellInactive: {
    backgroundColor: '#f3f4f6',
  },
  dayNumber: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  todayIndicator: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  flowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  flowText: {
    fontSize: 10, // Max size
    textAlign: 'center',
    fontWeight: '600',
  },
});
