import {categoryRulesService} from '../src/screens/Categories/services/CategoryRulesService';

describe('CategoryRulesService', () => {
  test('validates empty name', () => {
    const result = categoryRulesService.validateName('  ');
    expect(result.ok).toBe(false);
  });

  test('first child warning condition', () => {
    expect(
      categoryRulesService.shouldShowFirstChildWarning({
        isEdit: false,
        parentId: 1,
        isFirstChild: true,
      }),
    ).toBe(true);
  });

  test('no first child warning in edit mode', () => {
    expect(
      categoryRulesService.shouldShowFirstChildWarning({
        isEdit: true,
        parentId: 1,
        isFirstChild: true,
      }),
    ).toBe(false);
  });
});
