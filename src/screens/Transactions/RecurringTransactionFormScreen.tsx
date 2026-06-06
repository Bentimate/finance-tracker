import React from 'react';
import {ScrollView, View} from 'react-native';

import {Button} from '../../components/Button';
import {CategoryPickerModal} from '../../components/CategoryPickerModal';
import {Input} from '../../components/Input';
import {Screen} from '../../components/Screen';
import {AmountKeypad} from './components/AmountKeypad';
import {DatePickerModal} from './components/DatePickerModal';
import {AmountSection} from './components/form/AmountSection';
import {CategorySection} from './components/form/CategorySection';
import {DateSection} from './components/form/DateSection';
import {RecurrenceFrequencySection} from './components/form/RecurrenceFrequencySection';
import {styles as transactionStyles} from './styles/TransactionFormScreen.styles';
import {useRecurringTransactionFormViewModel} from './viewmodel/useRecurringTransactionFormViewModel';

const RecurringTransactionFormScreen: React.FC = () => {
  const vm = useRecurringTransactionFormViewModel();

  return (
    <Screen
      edges={[]}
      overlays={
        <AmountKeypad
          visible={vm.isAmountKeypadVisible}
          value={vm.displayAmount}
          isExpense={vm.isExpenseInput}
          topOffset={vm.amountLayout?.y ? vm.amountLayout.y + 6 : 0}
          onClose={vm.closeAmountKeypad}
          onAppendDigit={vm.appendDigit}
          onAppendDecimal={vm.appendDecimal}
          onToggleSign={vm.toggleSign}
          onBackspace={vm.backspace}
          onClear={vm.clearAmount}
          onDone={vm.closeAmountKeypad}
        />
      }>
      <ScrollView
        style={transactionStyles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={vm.isAmountKeypadVisible ? transactionStyles.contentWithKeypad : undefined}>
        <AmountSection
          amountContainerRef={vm.amountContainerRef}
          displayAmount={vm.displayAmount}
          isExpenseInput={vm.isExpenseInput}
          onLayout={vm.onAmountContainerLayout}
          onFocus={vm.onAmountFocus}
        />

        <CategorySection
          selectedDisplay={vm.selectedDisplay}
          onPress={() => {
            vm.closeAmountKeypad();
            vm.setCategoryModalVisible(true);
          }}
        />

        <Input
          label="NOTES"
          value={vm.note}
          onChangeText={vm.setNote}
          placeholder="What will this be for?"
          multiline
          onFocus={vm.closeAmountKeypad}
        />

        <DateSection
          label="NEXT OCCURRENCE"
          date={vm.nextOccurrence}
          onPress={vm.openNextOccurrencePicker}
        />

        <RecurrenceFrequencySection
          frequency={vm.frequency}
          weeklyDay={vm.weeklyDay}
          monthlyDay={vm.monthlyDay}
          yearlyDate={vm.yearlyDate}
          onFrequencyChange={vm.setFrequency}
          onWeeklyDayChange={vm.setWeeklyDay}
          onMonthlyDayChange={vm.setMonthlyDay}
          onYearlyDatePress={vm.openYearlyDatePicker}
        />
      </ScrollView>

      <View style={transactionStyles.footer}>
        {!!vm.recurringTransactionId && (
          <Button
            title="Delete"
            variant="outline"
            onPress={vm.handleDelete}
            style={transactionStyles.deleteButton}
            textStyle={transactionStyles.deleteButtonText}
          />
        )}
        <Button
          title={vm.recurringTransactionId ? 'Update Recurrence' : 'Save Recurrence'}
          onPress={vm.handleSave}
          loading={vm.loading}
          style={transactionStyles.saveButton}
        />
      </View>

      <CategoryPickerModal
        visible={vm.isCategoryModalVisible}
        onClose={() => vm.setCategoryModalVisible(false)}
        categories={vm.categories}
        selectedCategoryId={vm.categoryId}
        onSelectCategory={vm.onCategorySelect}
      />

      <DatePickerModal
        visible={vm.isDatePickerVisible}
        onClose={() => vm.setDatePickerVisible(false)}
        date={vm.datePickerDate}
        onChange={vm.handleDateChange}
      />
    </Screen>
  );
};

export default RecurringTransactionFormScreen;
