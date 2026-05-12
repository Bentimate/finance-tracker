import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Menu} from 'react-native-paper';
import {PieChart} from 'react-native-gifted-charts';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {CategorySpend} from '../../../types';
import {
  ParentCategoryOption,
  DateRange,
  analyticsRepository,
} from '../../../repositories/analyticsRepository';
import {formatCurrencyCompact} from '../../../utils/formatCurrency';
import {styles, menuItemStyle, menuContentStyle} from './CategoryDonutCard.styles';
import {theme} from '../../../theme';
import {Card} from '../../../components/Card';

const OTHERS_COLOR = '#94a3b8';
const FALLBACK_COLOR = theme.colors.textMuted;

interface Props {
  donutSpend: CategorySpend[];
  donutParents: ParentCategoryOption[];
  range: DateRange;
}

const CategoryDonutCard: React.FC<Props> = ({
  donutSpend,
  donutParents,
  range,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [selectedParent, setSelectedParent] = useState<ParentCategoryOption | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [drillSpend, setDrillSpend] = useState<CategorySpend[] | null>(null);
  const [drillLoading, setDrillLoading] = useState(false);

  // Reset drill-down when the date range changes
  useEffect(() => {
    setSelectedParent(null);
    setDrillSpend(null);
    setFocusedIndex(null);
  }, [range.startDate, range.endDate]);

  const fetchDrillSpend = useCallback(
    async (parent: ParentCategoryOption) => {
      setDrillLoading(true);
      try {
        const {children, othersTotal} =
          await analyticsRepository.getChildCategorySpend(parent.id, range);
        const slices: CategorySpend[] = [...children];
        if (othersTotal > 0) {
          slices.push({id: -1, name: 'Others', color: OTHERS_COLOR, total: othersTotal});
        }
        setDrillSpend(slices);
      } finally {
        setDrillLoading(false);
      }
    },
    [range],
  );

  const selectParent = useCallback(
    async (parent: ParentCategoryOption | null) => {
      setMenuVisible(false);
      setFocusedIndex(null);
      setSelectedParent(parent);
      if (!parent) {
        setDrillSpend(null);
      } else {
        await fetchDrillSpend(parent);
      }
    },
    [fetchDrillSpend],
  );

  const activeSpend = selectedParent ? (drillSpend ?? []) : donutSpend;
  const totalExpense = activeSpend.reduce((sum, c) => sum + c.total, 0);
  const focused = focusedIndex !== null ? activeSpend[focusedIndex] : null;
  const isEmpty = activeSpend.length === 0 && !drillLoading;

  const pieData = activeSpend.map((cat, i) => ({
    value: cat.total,
    color: cat.color ?? FALLBACK_COLOR,
    focused: focusedIndex === i,
    onPress: () => setFocusedIndex(prev => (prev === i ? null : i)),
  }));

  // Pill trigger — passed as the anchor to Menu
  const pillAnchor = donutParents.length > 0 ? (
    <TouchableOpacity
      style={styles.pill}
      onPress={() => setMenuVisible(true)}
      activeOpacity={0.7}>
      <Text style={styles.pillText} numberOfLines={1}>
        {selectedParent ? selectedParent.name : 'All Categories'}
      </Text>
      <MaterialIcon
        name={menuVisible ? 'chevron-up' : 'chevron-down'}
        size={14}
        color={theme.colors.primary}
      />
    </TouchableOpacity>
  ) : null;

  return (
    <Card>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>Spending by Category</Text>

        {donutParents.length > 0 && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={pillAnchor}
            contentStyle={menuContentStyle}>

            {/* "All Categories" option */}
            <Menu.Item
              onPress={() => selectParent(null)}
              title="All Categories"
              titleStyle={[
                menuItemStyle.title,
                !selectedParent && menuItemStyle.titleActive,
              ]}
              style={[
                menuItemStyle.item,
                !selectedParent && menuItemStyle.itemActive,
              ]}
            />

            {donutParents.map(p => (
              <Menu.Item
                key={p.id}
                onPress={() => selectParent(p)}
                title={p.name}
                titleStyle={[
                  menuItemStyle.title,
                  selectedParent?.id === p.id && menuItemStyle.titleActive,
                ]}
                style={[
                  menuItemStyle.item,
                  selectedParent?.id === p.id && menuItemStyle.itemActive,
                ]}
                leadingIcon={() =>
                  p.icon ? (
                    <MaterialIcon
                      name={p.icon}
                      size={18}
                      color={selectedParent?.id === p.id ? theme.colors.primary : p.color}
                    />
                  ) : (
                    <View style={[styles.menuDot, {backgroundColor: p.color}]} />
                  )
                }
              />
            ))}
          </Menu>
        )}
      </View>

      {/* Body */}
      {isEmpty && (
        <Text style={styles.empty}>No expenses this month</Text>
      )}

      {drillLoading && (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      )}

      {!isEmpty && !drillLoading && (
        <View style={styles.chartRow}>
          <PieChart
            data={pieData}
            donut
            radius={80}
            innerRadius={52}
            isAnimated
            animationDuration={600}
            focusOnPress
            toggleFocusOnPress
            centerLabelComponent={() => (
              <View style={styles.donutCenter}>
                <Text style={styles.donutAmount}>
                  {formatCurrencyCompact(focused ? focused.total : totalExpense)}
                </Text>
                <Text style={styles.donutCaption}>
                  {focused ? focused.name : 'total'}
                </Text>
              </View>
            )}
          />

          <View style={styles.legend}>
            {activeSpend.map((cat, i) => {
              const pct = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
              const isFocused = focusedIndex === i;
              return (
                <View
                  key={cat.id}
                  style={[styles.legendRow, isFocused && styles.legendRowFocused]}>
                  <View
                    style={[
                      styles.legendDot,
                      {backgroundColor: cat.color ?? FALLBACK_COLOR},
                    ]}
                  />
                  <Text style={styles.legendName} numberOfLines={1}>
                    {cat.name}
                  </Text>
                  <Text style={styles.legendPct}>{pct.toFixed(0)}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </Card>
  );
};

export default CategoryDonutCard;