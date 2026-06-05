import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  brand: string;
}

export interface ProductWithInventory extends Product {
  stock: number;
  sku?: string;
  featured?: boolean;
  images?: string[];
}

interface ProductStore {
  products: ProductWithInventory[];
  loading: boolean;
  initializeProducts: () => Promise<void>;
  addProduct: (product: Omit<ProductWithInventory, "id">) => Promise<boolean>;
  updateProduct: (
    id: string,
    product: Partial<ProductWithInventory>
  ) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateStock: (id: string, stock: number) => Promise<boolean>;
  getProductById: (id: string) => ProductWithInventory | undefined;
}

function mapRow(p: Record<string, unknown>): ProductWithInventory {
  return {
    id: String(p.id ?? ""),
    name: String(p.name ?? "Unknown Product"),
    brand: String(p.brand ?? "Unknown Brand"),
    price: Number(p.price) || 0,
    image: String(p.image ?? ""),
    category: String(p.category ?? "uncategorized"),
    description: String(p.description ?? ""),
    stock: Number(p.stock) || 0,
    sku: p.sku ? String(p.sku) : undefined,
    featured: Boolean(p.featured),
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
  };
}

export const useProductStore = create<ProductStore>()((set, get) => ({
  products: [],
  loading: false,

  initializeProducts: async () => {
    if (!isSupabaseConfigured()) {
      console.error(
        "Supabase is not configured. Please set environment variables."
      );
      set({ products: [], loading: false });
      return;
    }

    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        set({ products: [], loading: false });
        return;
      }

      const products = (data ?? [])
        .filter((p) => p && p.id)
        .map((p) => mapRow(p as Record<string, unknown>));

      set({ products, loading: false });
    } catch (error) {
      console.error("Error initializing products:", error);
      set({ products: [], loading: false });
    }
  },

  addProduct: async (product) => {
    const newProduct: ProductWithInventory = {
      ...product,
      id: Date.now().toString(),
      stock: product.stock || 0,
      sku: product.sku || `SKU-${Date.now()}`,
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("products").insert({
          id: newProduct.id,
          name: newProduct.name,
          brand: newProduct.brand,
          price: newProduct.price,
          image: newProduct.image,
          category: newProduct.category,
          description: newProduct.description,
          stock: newProduct.stock,
          sku: newProduct.sku || null,
        });

        if (error) {
          console.error("Error adding product:", error);
          return false;
        }
      } catch (error) {
        console.error("Error adding product:", error);
        return false;
      }
    }

    const products = get().products || [];
    set({ products: [...products, newProduct] });
    return true;
  },

  updateProduct: async (id, updates) => {
    if (!isSupabaseConfigured()) {
      console.error("Supabase is not configured.");
      return false;
    }

    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.brand) updateData.brand = updates.brand;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.image) updateData.image = updates.image;
      if (updates.category) updateData.category = updates.category;
      if (updates.description) updateData.description = updates.description;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.sku !== undefined) updateData.sku = updates.sku || null;

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Error updating product:", error);
        return false;
      }

      const products = get().products || [];
      set({
        products: products.map((p) =>
          p && p.id === id ? { ...p, ...updates } : p
        ),
      });
      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      return false;
    }
  },

  deleteProduct: async (id) => {
    if (!isSupabaseConfigured()) {
      console.error("Supabase is not configured.");
      return false;
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        console.error("Error deleting product:", error);
        return false;
      }

      const products = get().products || [];
      set({ products: products.filter((p) => p && p.id !== id) });
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  },

  updateStock: async (id, stock) => {
    if (!isSupabaseConfigured()) {
      console.error("Supabase is not configured.");
      return false;
    }

    try {
      const { error } = await supabase
        .from("products")
        .update({ stock: Math.max(0, stock) })
        .eq("id", id);

      if (error) {
        console.error("Error updating stock:", error);
        return false;
      }

      const products = get().products || [];
      set({
        products: products.map((p) =>
          p && p.id === id ? { ...p, stock: Math.max(0, stock) } : p
        ),
      });
      return true;
    } catch (error) {
      console.error("Error updating stock:", error);
      return false;
    }
  },

  getProductById: (id) => {
    const products = get().products || [];
    return products.find((p) => p && p.id === id);
  },
}));
