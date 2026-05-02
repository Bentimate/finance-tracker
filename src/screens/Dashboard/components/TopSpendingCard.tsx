import React from 'react';
import {View, Text} from 'react-native';
import {CategorySpend} from '../../../types';
import {formatCurrency} from '../../../utils/formatCurrency';
import {styles} from './TopSpendingCard.styles';
import {Card} from '../../../components/Card';

interface Props {
  categorySpend: CategorySpend[];
  /** Cap the list. Defaults to 5. */
  limit?: number;
}

const TopSpendingCard: React.FC<Props> = ({categorySpend, limit = 5}) => {
  const top = categorySpend.slice(0, limit);
  const maxTotal = top[0]?.total ?? 1;

  return (
    <Card>
      <Text style={styles.sectionLabel}>Top Spending</Text>

      {top.length === 0 ? (
        <Text style={styles.empty}>No expenses this month</Text>
      ) : (
        <View style={styles.list}>
          {top.map((cat, index) => {
            const widthPercent = (cat.total / maxTotal) * 100;
            return (
              <View key={cat.id} style={styles.row}>
                {/* Rank + dot */}
                <Text style={styles.rank}>{index + 1}</Text>
                <View style={[styles.dot, {backgroundColor: cat.color}]} />

                {/* Name + bar */}
                <View style={styles.nameBarWrapper}>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {cat.name}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${widthPercent}%`,
                          backgroundColor: cat.color,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Amount */}
                <Text style={styles.amount}>{formatCurrency(cat.total)}</Text>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
};

export default TopSpendingCard;
