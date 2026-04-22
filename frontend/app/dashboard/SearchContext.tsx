'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ProductDetails {
  id: string;
  title: string;
  current_price: number;
  platform: string;
  image_url: string;
  short_description: string;
  full_description: string;
  specifications: Record<string, string>;
  rating: number | null;
  reviews_count: number | null;
  url: string;
}

interface Offer {
  platform: string;
  price: string | null;
  url: string;
  title: string;
}

interface SearchContextType {
  lastUrl: string;
  setLastUrl: (url: string) => void;
  lastProduct: ProductDetails | null;
  setLastProduct: (product: ProductDetails | null) => void;
  lastOffers: Offer[];
  setLastOffers: (offers: Offer[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [lastUrl, setLastUrl] = useState("")
  const [lastProduct, setLastProduct] = useState<ProductDetails | null>(null)
  const [lastOffers, setLastOffers] = useState<Offer[]>([])

  return (
    <SearchContext.Provider value={{ 
      lastUrl, setLastUrl, 
      lastProduct, setLastProduct, 
      lastOffers, setLastOffers 
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
