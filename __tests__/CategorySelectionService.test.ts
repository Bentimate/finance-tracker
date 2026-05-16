import {categorySelectionService} from '../src/components/services/CategorySelectionService';
import {ParentCategory} from '../src/types';

const mockCategories: ParentCategory[] = [
  {
    id: 1,
    name: 'Food',
    color: '#111111',
    icon: 'food',
    parent_id: null,
    is_archived: 0,
    children: [
      {
        id: 2,
        name: 'Coffee',
        color: '#222222',
        icon: 'coffee',
        parent_id: 1,
        is_archived: 0,
      },
    ],
  },
];

describe('CategorySelectionService', () => {
  test('resolves parent display', () => {
    expect(categorySelectionService.resolveSelectedDisplay(mockCategories, 1)?.label).toBe('Food');
  });

  test('resolves child display', () => {
    expect(categorySelectionService.resolveSelectedDisplay(mockCategories, 2)?.label).toBe('Coffee');
  });

  test('returns null for unknown id', () => {
    expect(categorySelectionService.resolveSelectedDisplay(mockCategories, 999)).toBeNull();
  });
});
