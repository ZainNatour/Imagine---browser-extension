import React, { useEffect, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { create } from 'zustand';
import { FilterPanel, FilterValues } from '../components/FilterPanel/FilterPanel';
import { Button } from '../ui/button';
import { Builder } from '../lookbook/Builder';

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  store: string;
}

interface FilterState {
  stores: string[];
  price: number[];
  demographic: string[];
  clothing: string[];
  rating: number[];
}

interface MarketplaceState {
  products: Product[];
  filters: FilterState;
  sort: string;
  setProducts: (p: Product[]) => void;
  toggleStore: (s: string) => void;
  applyFilters: (f: FilterState & { sort: string }) => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  products: [],
  filters: { stores: [], price: [0, Number.MAX_SAFE_INTEGER], demographic: [], clothing: [], rating: [] },
  sort: '',
  setProducts: (p) => set({ products: p }),
  toggleStore: (store) =>
    set((state) => {
      const exists = state.filters.stores.includes(store);
      const stores = exists
        ? state.filters.stores.filter((s) => s !== store)
        : [...state.filters.stores, store];
      return { filters: { ...state.filters, stores } };
    }),
  applyFilters: (f) =>
    set((state) => ({
      filters: {
        ...state.filters,
        demographic: f.demographic,
        clothing: f.clothing,
        rating: f.rating,
        price: f.price,
      },
      sort: f.sort,
    })),
}));

const priceLabels = ['$0', '$25', '$50', '$75', '$100'];
const priceSteps = [0, 25, 50, 75, 100];

const columnCount = 3;
const rowHeight = 240;
const columnWidth = 200;
const gridHeight = 480;
const gridWidth = columnCount * columnWidth;

const Outer = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => (
  <div ref={ref} data-testid="market-grid" {...props} />
));
Outer.displayName = 'Outer';

export const MarketplaceTab: React.FC = () => {
  const { products, filters, sort, setProducts, toggleStore, applyFilters } = useMarketplaceStore();
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage('GET_ALL_PRODUCTS', (res: Product[]) => {
      setProducts(res || []);
    });
  }, [setProducts]);

  const stores = useMemo(() => Array.from(new Set(products.map((p) => p.store))), [products]);

  const handleApply = (values: FilterValues) => {
    const min = priceSteps[values.price[0]] ?? 0;
    const max = priceSteps[values.price[1]] ?? priceSteps[priceSteps.length - 1];
    applyFilters({
      ...values,
      price: [min, max],
      stores: filters.stores,
    });
  };

  const filtered = useMemo(() => {
    let items = products.filter((p) => {
      const storeMatch =
        filters.stores.length === 0 || filters.stores.includes(p.store);
      const priceMatch = p.price >= filters.price[0] && p.price <= filters.price[1];
      return storeMatch && priceMatch;
    });
    if (sort === 'Price (Low-High)') items = items.slice().sort((a, b) => a.price - b.price);
    if (sort === 'Price (High-Low)') items = items.slice().sort((a, b) => b.price - a.price);
    return items;
  }, [products, filters, sort]);

  const Cell: React.FC<{ columnIndex: number; rowIndex: number; style: React.CSSProperties }> = ({
    columnIndex,
    rowIndex,
    style,
  }) => {
    const index = rowIndex * columnCount + columnIndex;
    const item = filtered[index];
    if (!item) return null;
    return (
      <div style={style} className="p-2" data-testid="product-card" data-store={item.store}>
        <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded" />
        <p className="mt-1 text-sm">{item.name}</p>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      <div className="w-72">
        <FilterPanel
          demographics={[]}
          clothingTypes={[]}
          priceLabels={priceLabels}
          sortOptions={['Price (Low-High)', 'Price (High-Low)']}
          onApply={handleApply}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 p-2">
          {stores.map((s) => (
            <Button
              key={s}
              variant="outline"
              data-active={filters.stores.includes(s) || undefined}
              onClick={() => toggleStore(s)}
            >
              {s}
            </Button>
          ))}
          <Button size="sm" onClick={() => setOpen(true)}>
            Outfit Builder
          </Button>
        </div>
        {open && (
          <Builder
            items={filtered.map((p, i) => ({ productId: p.id, x: 0, y: 0, z: i }))}
            open={open}
          />
        )}
        {filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="p-4 border rounded">No products found</div>
          </div>
        ) : (
          <Grid
            outerElementType={Outer}
            columnCount={columnCount}
            columnWidth={columnWidth}
            height={gridHeight}
            rowCount={Math.ceil(filtered.length / columnCount)}
            rowHeight={rowHeight}
            width={gridWidth}
            className="flex-1"
          >
            {Cell}
          </Grid>
        )}
      </div>
    </div>
  );
};

