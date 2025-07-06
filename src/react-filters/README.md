# React Filter Components

This directory provides a set of modular React components to render the **Stores › Filters** panel.

## Usage

1. Ensure React, Tailwind and Zustand are included in your build.
2. Import the `FilterPanel` component and provide option lists:

```tsx
import { FilterPanel } from './react-filters';

<FilterPanel
  demographics={["Men", "Women"]}
  clothingTypes={["Shirts", "Pants"]}
  priceRanges={["0", "100"]}
/>
```

3. Filter state is managed by Zustand (`useFilterStore`). The store persists in URL query params when integrated into your app.

## Extending

Styles follow the Tailwind config in the repository. Components are accessible and keyboard-friendly.
