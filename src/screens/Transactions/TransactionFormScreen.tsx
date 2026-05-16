import React from 'react';
import {ScrollView, View} from 'react-native';

import {Input} from '../../components/Input';
import {Screen} from '../../components/Screen';
import {CategoryPickerModal} from '../../components/CategoryPickerModal';
import {AmountKeypad} from './components/AmountKeypad';
import {DatePickerModal} from './components/DatePickerModal';
import {AmountSection} from './components/form/AmountSection';
import {CategorySection} from './components/form/CategorySection';
import {DateSection} from './components/form/DateSection';
import {FooterActions} from './components/form/FooterActions';
import {styles} from './styles/TransactionFormScreen.styles';
import {useTransactionFormViewModel} from './viewmodel/useTransactionFormViewModel';

const TransactionFormScreen: React.FC = () => {
  const vm = useTransactionFormViewModel();

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
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={vm.isAmountKeypadVisible ? styles.contentWithKeypad : undefined}>
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
          placeholder="What was this for?"
          multiline
          onFocus={vm.closeAmountKeypad}
        />

        <DateSection
          date={vm.selectedDate}
          onPress={() => {
            vm.closeAmountKeypad();
            vm.openDatePicker();
          }}
        />
      </ScrollView>

      <FooterActions
        isEdit={!!vm.transactionId}
        loading={vm.loading}
        onDelete={vm.handleDelete}
        onSave={() => void vm.handleSave()}
      />

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
        date={vm.selectedDate}
        onChange={vm.handleDateChange}
      />
    </Screen>
  );
};

export default TransactionFormScreen;
