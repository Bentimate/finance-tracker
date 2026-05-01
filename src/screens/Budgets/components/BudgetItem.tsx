import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {BudgetProgress} from '../../../types';
import {Typography} from '../../../components/Typography';
import {formatCurrency} from '../../../utils/formatCurrency';
import {theme} from '../../../theme';
import {styles} from '../styles/BudgetListScreen.styles';

interface BudgetItemProps {
  item: BudgetProgress;
  onPress: (categoryId: number) => void;
}

export const BudgetItem: React.FC<BudgetItemProps> = ({item, onPress}) => {
  const isOver = item.percentage > 100;
  const progressColor = isOver
    ? theme.colors.error
    : item.percentage > 80
      ? theme.colors.warning
      : theme.colors.primary;

  return (
    <TouchableOpacity
      style={styles.budgetItem}
      onPress={() => onPress(item.category_id)}
      activeOpacity={0.7}
    >
      <View style={styles.budgetTop}>
        <View>
          <View style={styles.categoryInfo}>
            <View style={[styles.categoryDot, {backgroundColor: item.category_color}]} />
            <Typography variant="body" weight="bold">{item.category_name}</Typography>
          </View>
          <Typography variant="caption" color="textMuted" style={{marginTop: 2}}>
            {item.period.toUpperCase()}
          </Typography>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Typography variant="body" weight="bold">
            {formatCurrency(item.spent)}
            <Typography variant="caption" color="textMuted"> / {formatCurrency(item.budget_amount)}</Typography>
          </Typography>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.min(item.percentage, 100)}%`,
              backgroundColor: progressColor
            }
          ]}
        />
      </View>

      <View style={styles.budgetFooter}>
        <Typography variant="caption" color="textMuted">
          {isOver
            ? `${formatCurrency(Math.abs(item.remaining))} over budget`
            : `${formatCurrency(item.remaining)} remaining`}
        </Typography>
        <Typography variant="caption" color={isOver ? 'error' : 'textMuted'}>
          {Math.round(item.percentage)}%
        </Typography>
      </View>
    </TouchableOpacity>
  );
};
