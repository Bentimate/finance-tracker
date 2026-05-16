import {Category, ParentCategory} from '../../types';

export interface SelectedCategoryDisplay {
  label: string;
  color: string;
  icon: string | null;
}

export class CategorySelectionService {
  public resolveSelectedDisplay(
    categories: ParentCategory[],
    categoryId: number | null,
  ): SelectedCategoryDisplay | null {
    if (categoryId === null) {
      return null;
    }

    for (const parent of categories) {
      if (parent.id === categoryId) {
        return {label: parent.name, color: parent.color, icon: parent.icon};
      }

      for (const child of parent.children) {
        if (child.id === categoryId) {
          return {label: child.name, color: child.color, icon: child.icon};
        }
      }
    }

    return null;
  }

  public resolveBudgetCategory(
    categories: ParentCategory[],
    categoryId: number | null,
  ): {parent: ParentCategory; child?: Category} | null {
    if (!categoryId) {
      return null;
    }

    for (const parent of categories) {
      if (parent.id === categoryId) {
        return {parent};
      }

      const child = parent.children.find(current => current.id === categoryId);
      if (child) {
        return {parent, child};
      }
    }

    return null;
  }
}

export const categorySelectionService = new CategorySelectionService();
