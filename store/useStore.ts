import { create } from "zustand";

export type SortOption = "price-asc" | "price-desc" | "newest" | "popular";

interface FiltersState {
  category: string[];
  priceRange: [number, number];
  transmission: string;
  minSeats: number;
  availableOnly: boolean;
  sortBy: SortOption;
  searchLocation: string;
  pickupDate: string;
  returnDate: string;
}

interface StoreState {
  filters: FiltersState;
  selectedCarId: string | null;
  bookingModalOpen: boolean;
  detailModalCarId: string | null;
  mobileMenuOpen: boolean;

  setCategory: (cats: string[]) => void;
  toggleCategory: (cat: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setTransmission: (t: string) => void;
  setMinSeats: (s: number) => void;
  setAvailableOnly: (v: boolean) => void;
  setSortBy: (s: SortOption) => void;
  setSearchLocation: (l: string) => void;
  setPickupDate: (d: string) => void;
  setReturnDate: (d: string) => void;
  setSelectedCarId: (id: string | null) => void;
  openBookingModal: (carId: string) => void;
  closeBookingModal: () => void;
  openDetailModal: (carId: string) => void;
  closeDetailModal: () => void;
  setMobileMenuOpen: (v: boolean) => void;
  resetFilters: () => void;
}

const defaultFilters: FiltersState = {
  category: [],
  priceRange: [2000, 15000],
  transmission: "All",
  minSeats: 0,
  availableOnly: false,
  sortBy: "popular",
  searchLocation: "",
  pickupDate: "",
  returnDate: "",
};

export const useStore = create<StoreState>((set) => ({
  filters: { ...defaultFilters },
  selectedCarId: null,
  bookingModalOpen: false,
  detailModalCarId: null,
  mobileMenuOpen: false,

  setCategory: (cats) =>
    set((s) => ({ filters: { ...s.filters, category: cats } })),
  toggleCategory: (cat) =>
    set((s) => {
      const cats = s.filters.category.includes(cat)
        ? s.filters.category.filter((c) => c !== cat)
        : [...s.filters.category, cat];
      return { filters: { ...s.filters, category: cats } };
    }),
  setPriceRange: (range) =>
    set((s) => ({ filters: { ...s.filters, priceRange: range } })),
  setTransmission: (t) =>
    set((s) => ({ filters: { ...s.filters, transmission: t } })),
  setMinSeats: (s_) =>
    set((s) => ({ filters: { ...s.filters, minSeats: s_ } })),
  setAvailableOnly: (v) =>
    set((s) => ({ filters: { ...s.filters, availableOnly: v } })),
  setSortBy: (sortBy) =>
    set((s) => ({ filters: { ...s.filters, sortBy } })),
  setSearchLocation: (l) =>
    set((s) => ({ filters: { ...s.filters, searchLocation: l } })),
  setPickupDate: (d) =>
    set((s) => ({ filters: { ...s.filters, pickupDate: d } })),
  setReturnDate: (d) =>
    set((s) => ({ filters: { ...s.filters, returnDate: d } })),
  setSelectedCarId: (id) => set({ selectedCarId: id }),
  openBookingModal: (carId) =>
    set({ bookingModalOpen: true, selectedCarId: carId }),
  closeBookingModal: () =>
    set({ bookingModalOpen: false }),
  openDetailModal: (carId) => set({ detailModalCarId: carId }),
  closeDetailModal: () => set({ detailModalCarId: null }),
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
}));
