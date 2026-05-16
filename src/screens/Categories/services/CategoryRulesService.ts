import {Category} from '../../../types';

export interface ValidationResult {
  ok: boolean;
  message?: string;
}

export class CategoryRulesService {
  public validateName(name: string): ValidationResult {
    if (!name.trim()) {
      return {ok: false, message: 'Name is required'};
    }

    return {ok: true};
  }

  public shouldShowFirstChildWarning(input: {
    isEdit: boolean;
    parentId: number | null;
    isFirstChild: boolean;
  }): boolean {
    return !input.isEdit && input.parentId !== null && input.isFirstChild;
  }

  public buildFirstChildWarningMessage(parentName: string): string {
    return `Existing transactions assigned directly to "${parentName}" will appear under "Others" in charts. You can reassign them later.`;
  }

  public canReparentCategory(input: {
    isEdit: boolean;
    hasChildren: boolean;
    selectedParent: Category | null;
  }): boolean {
    if (!input.isEdit) {
      return true;
    }

    return !input.hasChildren || input.selectedParent !== null;
  }
}

export const categoryRulesService = new CategoryRulesService();
