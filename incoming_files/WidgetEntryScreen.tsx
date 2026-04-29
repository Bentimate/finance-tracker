import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getAllCategories} from '../../repositories/categoryRepository';
import {createTransaction} from '../../repositories/transactionRepository';
import {Category} from '../../types';
import {styles} from './WidgetEntryScreen.styles';
import {theme} from '../../theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SaveState = 'idle' | 'saving' | 'done';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Rendered inside WidgetEntryActivity — a transparent, dialog-style Activity.
 * The screen is intentionally minimal: amount input + category picker + save.
 *
 * Interaction target: ≤ 3 user interactions, completion < 3 seconds (§3.4).
 *   1. Type amount  (keyboard is raised automatically on mount)
 *   2. Tap category
 *   3. Tap Save  →  closes activity
 */
const WidgetEntryScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [amountError, setAmountError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // ── Load categories on mount ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    getAllCategories()
      .then(cats => {
        if (!cancelled) {
          setCategories(cats);
          setLoadingCategories(false);
          // Auto-focus the amount field once categories are ready
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingCategories(false);
          Alert.alert('Error', 'Could not load categories. Please open the app.');
        }
      });
    return () => { cancelled = true; };
  }, []);

  // ── Hardware back → dismiss ───────────────────────────────────────────────
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      dismiss();
      return true; // prevent default behaviour
    });
    return () => sub.remove();
  }, []);

  // ── Dismiss (close the Activity) ──────────────────────────────────────────
  // On Android, calling BackHandler.exitApp() from a secondary activity
  // finishes that activity and returns to the previous task (home screen).
  const dismiss = useCallback(() => {
    Keyboard.dismiss();
    BackHandler.exitApp();
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const parsedAmount = parseFloat(amount);
    const amountOk = !isNaN(parsedAmount) && parsedAmount > 0;
    const categoryOk = selectedCategoryId !== null;

    setAmountError(!amountOk);
    setCategoryError(!categoryOk);

    return amountOk && categoryOk;
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) {
      return;
    }
    setSaveState('saving');
    try {
      await createTransaction({
        amount: parseFloat(amount),
        type: 'expense',
        category_id: selectedCategoryId!,
      });
      setSaveState('done');
      // Brief "done" feedback before dismissing
      setTimeout(dismiss, 400);
    } catch (e: any) {
      setSaveState('idle');
      Alert.alert('Could not save', e?.message ?? 'Something went wrong. Please try again.');
    }
  }

  // ── Amount field change ───────────────────────────────────────────────────
  function handleAmountChange(text: string) {
    // Allow digits and one decimal point only
    const sanitised = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setAmount(sanitised);
    if (amountError) {
      setAmountError(false);
    }
  }

  // ── Category selection ────────────────────────────────────────────────────
  function handleSelectCategory(id: number) {
    setSelectedCategoryId(id);
    if (categoryError) {
      setCategoryError(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const isSaving = saveState === 'saving';
  const isDone = saveState === 'done';

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Tap outside to dismiss */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={dismiss} />

      <SafeAreaView style={styles.sheet} edges={['bottom']}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quick Add</Text>
          <TouchableOpacity onPress={dismiss} hitSlop={12} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Amount input */}
        <View style={styles.amountRow}>
          <Text style={styles.currencyPrefix}>S$</Text>
          <TextInput
            ref={inputRef}
            style={[styles.amountInput, amountError && styles.inputError]}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.colors.textMuted}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            editable={!isSaving && !isDone}
          />
        </View>
        {amountError && (
          <Text style={styles.errorText}>Enter a valid amount</Text>
        )}

        {/* Category picker */}
        <Text style={[styles.pickerLabel, categoryError && styles.pickerLabelError]}>
          {categoryError ? 'Select a category' : 'Category'}
        </Text>

        {loadingCategories ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={styles.categoryLoader}
          />
        ) : (
          <FlatList
            data={categories}
            keyExtractor={item => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({item}) => {
              const isSelected = selectedCategoryId === item.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    isSelected && {
                      backgroundColor: item.color,
                      borderColor: item.color,
                    },
                  ]}
                  onPress={() => handleSelectCategory(item.id)}
                  activeOpacity={0.75}>
                  <View
                    style={[
                      styles.chipDot,
                      {backgroundColor: isSelected ? '#ffffff' : item.color},
                    ]}
                  />
                  <Text
                    style={[
                      styles.chipLabel,
                      isSelected && styles.chipLabelSelected,
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Save button */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (isSaving || isDone) && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving || isDone}
          activeOpacity={0.8}>
          {isSaving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isDone ? '✓ Saved' : 'Save Expense'}
            </Text>
          )}
        </TouchableOpacity>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default WidgetEntryScreen;
