export type DateMode = 'single' | 'range';

export interface SingleSelection {
  mode: 'single';
  year: number;
  month: number;
}

export interface RangeSelection {
  mode: 'range';
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

export type DateSelection = SingleSelection | RangeSelection;
