/**
 * Curated MaterialCommunityIcons grouped by theme for the icon picker.
 * Each entry is a valid icon name string accepted by MaterialCommunityIcons.
 */

export interface IconGroup {
  label: string;
  icons: string[];
}

export const ICON_GROUPS: IconGroup[] = [
  {
    label: 'Food & Drink',
    icons: [
      'food',
      'food-fork-drink',
      'food-apple',
      'coffee',
      'cup',
      'beer',
      'wine',
      'pizza',
      'hamburger',
      'noodles',
      'cake',
      'ice-cream',
      'fish',
      'leaf',
    ],
  },
  {
    label: 'Transport',
    icons: [
      'car',
      'bus',
      'train',
      'subway-variant',
      'airplane',
      'taxi',
      'bicycle',
      'walk',
      'motorbike',
      'fuel',
      'parking',
      'ferry',
    ],
  },
  {
    label: 'Home',
    icons: [
      'home',
      'sofa',
      'bed',
      'shower',
      'washing-machine',
      'lightbulb',
      'water',
      'fire',
      'tools',
      'broom',
      'television',
      'wifi',
    ],
  },
  {
    label: 'Health',
    icons: [
      'heart-pulse',
      'pill',
      'hospital-box',
      'stethoscope',
      'tooth',
      'eye',
      'run',
      'weight-lifter',
      'yoga',
      'spa',
      'needle',
      'bandage',
    ],
  },
  {
    label: 'Shopping',
    icons: [
      'cart',
      'shopping',
      'hanger',
      'shoe-heel',
      'tshirt-crew',
      'watch',
      'sunglasses',
      'gift',
      'tag',
      'barcode-scan',
    ],
  },
  {
    label: 'Entertainment',
    icons: [
      'gamepad-variant',
      'movie-open',
      'music',
      'headphones',
      'theater',
      'ticket',
      'bowling',
      'basketball',
      'soccer',
      'tennis',
      'cards-playing',
      'book-open-variant',
    ],
  },
  {
    label: 'Finance',
    icons: [
      'cash',
      'credit-card',
      'bank',
      'chart-line',
      'chart-pie',
      'currency-usd',
      'safe',
      'receipt',
      'wallet',
      'hand-coin',
    ],
  },
  {
    label: 'Work',
    icons: [
      'briefcase',
      'laptop',
      'monitor',
      'printer',
      'phone',
      'email',
      'calendar',
      'pen',
      'paperclip',
      'account-tie',
    ],
  },
  {
    label: 'Family & Social',
    icons: [
      'account',
      'account-group',
      'baby-carriage',
      'dog',
      'cat',
      'school',
      'human-male-female-child',
      'party-popper',
      'balloon',
      'cake-variant',
    ],
  },
  {
    label: 'Other',
    icons: [
      'star',
      'flag',
      'map-marker',
      'cloud',
      'moon',
      'sun-wireless',
      'flower',
      'recycle',
      'charity',
      'dots-horizontal',
    ],
  },
];

/** Flat list of all icon names — used for search filtering. */
export const ALL_ICONS: string[] = ICON_GROUPS.flatMap(g => g.icons);
