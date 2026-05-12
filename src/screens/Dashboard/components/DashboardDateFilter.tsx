import React, {useState, useMemo} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Menu} from 'react-native-paper';
import {Typography} from '../../../components/Typography';
import {theme} from '../../../theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DateMode = 'single' | 'range';

export interface SingleSelection {
  mode: 'single';
  year: number;
  month: number;
}

export interface RangeSelection {
  mode: 'range';
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

export type DateSelection = SingleSelection | RangeSelection;

interface Props {
  selection: DateSelection;
  earliestYear: number;
  onChange: (selection: DateSelection) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_LABELS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface MonthYearPickerProps {
  month: number;
  year: number;
  earliestYear: number;
  /** If set, no month/year combination after this can be selected */
  maxYear?: number;
  maxMonth?: number;
  /** If set, no month/year combination before this can be selected */
  minYear?: number;
  minMonth?: number;
  label?: string;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  month,
  year,
  earliestYear,
  maxYear = CURRENT_YEAR,
  maxMonth = CURRENT_MONTH,
  minYear,
  minMonth,
  label,
  onMonthChange,
  onYearChange,
}) => {
  const [monthMenuVisible, setMonthMenuVisible] = useState(false);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);

  const yearOptions = useMemo(() => {
    const options: number[] = [];
    for (let y = maxYear; y >= earliestYear; y--) {
      options.push(y);
    }
    return options;
  }, [earliestYear, maxYear]);

  const isMonthDisabled = (m: number) => {
    if (year === maxYear && m > maxMonth) return true;
    if (minYear !== undefined && minMonth !== undefined) {
      if (year === minYear && m < minMonth) return true;
    }
    return false;
  };

  return (
    <View style={styles.pickerGroup}>
      {label && (
        <Typography variant="caption" color="textMuted" style={styles.pickerLabel}>
          {label}
        </Typography>
      )}
      <View style={styles.pickerRow}>
        {/* Month */}
        <Menu
          visible={monthMenuVisible}
          onDismiss={() => setMonthMenuVisible(false)}
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setMonthMenuVisible(true)}
              activeOpacity={0.7}>
              <Typography variant="body" weight="medium">
                {MONTH_LABELS_FULL[month - 1]}
              </Typography>
              <Typography variant="caption" color="textMuted">{'  ▾'}</Typography>
            </TouchableOpacity>
          }>
          {MONTH_LABELS_FULL.map((lbl, i) => {
            const m = i + 1;
            const disabled = isMonthDisabled(m);
            return (
              <Menu.Item
                key={lbl}
                title={lbl}
                disabled={disabled}
                onPress={() => {
                  onMonthChange(m);
                  setMonthMenuVisible(false);
                }}
                titleStyle={[
                  styles.menuItemText,
                  month === m && styles.menuItemTextActive,
                  disabled && styles.menuItemTextDisabled,
                ]}
              />
            );
          })}
        </Menu>

        {/* Year */}
        <Menu
          visible={yearMenuVisible}
          onDismiss={() => setYearMenuVisible(false)}
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setYearMenuVisible(true)}
              activeOpacity={0.7}>
              <Typography variant="body" weight="medium">
                {year}
              </Typography>
              <Typography variant="caption" color="textMuted">{'  ▾'}</Typography>
            </TouchableOpacity>
          }>
          {yearOptions.map(y => (
            <Menu.Item
              key={y}
              title={String(y)}
              onPress={() => {
                onYearChange(y);
                setYearMenuVisible(false);
              }}
              titleStyle={[
                styles.menuItemText,
                year === y && styles.menuItemTextActive,
              ]}
            />
          ))}
        </Menu>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const DashboardDateFilter: React.FC<Props> = ({
  selection,
  earliestYear,
  onChange,
}) => {
  const handleModeToggle = (mode: DateMode) => {
    if (mode === selection.mode) return;

    if (mode === 'single') {
      // Collapse to the start month of the current range, or current month
      const year = selection.mode === 'range' ? selection.startYear : CURRENT_YEAR;
      const month = selection.mode === 'range' ? selection.startMonth : CURRENT_MONTH;
      onChange({mode: 'single', year, month});
    } else {
      // Expand single to a range: start = selected month, end = current month
      const startYear = selection.mode === 'single' ? selection.year : CURRENT_YEAR;
      const startMonth = selection.mode === 'single' ? selection.month : CURRENT_MONTH;
      onChange({
        mode: 'range',
        startYear,
        startMonth,
        endYear: CURRENT_YEAR,
        endMonth: CURRENT_MONTH,
      });
    }
  };

  const handleSingleChange = (field: 'year' | 'month', value: number) => {
    if (selection.mode !== 'single') return;
    onChange({...selection, [field]: value});
  };

  const handleRangeChange = (
    field: 'startYear' | 'startMonth' | 'endYear' | 'endMonth',
    value: number,
  ) => {
    if (selection.mode !== 'range') return;
    const next = {...selection, [field]: value};

    // Guard: end must not be before start
    const startTs = next.startYear * 12 + next.startMonth;
    const endTs = next.endYear * 12 + next.endMonth;
    if (endTs < startTs) {
      // Clamp end to start when start moves forward past end
      if (field === 'startYear' || field === 'startMonth') {
        next.endYear = next.startYear;
        next.endMonth = next.startMonth;
      } else {
        // End moved before start — clamp end back to start
        next.endYear = next.startYear;
        next.endMonth = next.startMonth;
      }
    }

    onChange(next);
  };

  return (
    <View style={styles.container}>
      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        {(['single', 'range'] as DateMode[]).map(mode => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeButton,
              selection.mode === mode && styles.modeButtonActive,
            ]}
            onPress={() => handleModeToggle(mode)}
            activeOpacity={0.7}>
            <Typography
              variant="caption"
              weight="medium"
              color={selection.mode === mode ? 'primary' : 'textMuted'}>
              {mode === 'single' ? 'Month' : 'Range'}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pickers */}
      {selection.mode === 'single' ? (
        <MonthYearPicker
          month={selection.month}
          year={selection.year}
          earliestYear={earliestYear}
          onMonthChange={m => handleSingleChange('month', m)}
          onYearChange={y => handleSingleChange('year', y)}
        />
      ) : (
        <View style={styles.rangeRow}>
          <MonthYearPicker
            month={selection.startMonth}
            year={selection.startYear}
            earliestYear={earliestYear}
            maxYear={selection.endYear}
            maxMonth={selection.endMonth}
            label="FROM"
            onMonthChange={m => handleRangeChange('startMonth', m)}
            onYearChange={y => handleRangeChange('startYear', y)}
          />
          <Typography variant="body" color="textMuted" style={styles.rangeSeparator}>
            →
          </Typography>
          <MonthYearPicker
            month={selection.endMonth}
            year={selection.endYear}
            earliestYear={earliestYear}
            minYear={selection.startYear}
            minMonth={selection.startMonth}
            label="TO"
            onMonthChange={m => handleRangeChange('endMonth', m)}
            onYearChange={y => handleRangeChange('endYear', y)}
          />
        </View>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  modeToggle: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  modeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  modeButtonActive: {
    backgroundColor: `${theme.colors.primary}14`,
  },
  pickerGroup: {
    gap: 2,
  },
  pickerLabel: {
    letterSpacing: 0.6,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rangeSeparator: {
    marginTop: theme.spacing.md, // align with picker rows which have a label above
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  menuContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  menuItemText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  menuItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  menuItemTextDisabled: {
    color: theme.colors.textMuted,
  },
});
