import { create } from "zustand";
import { Product } from "@/data/products";
import { products as initialProducts } from "@/data/products";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface ProductWithInventory extends Product {
  stock: number;
  sku?: string;
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

export const useProductStore = create<ProductStore>()((set, get) => ({
  products: [],
  loading: false,

  initializeProducts: async () => {
    if (!isSupabaseConfigured()) {
      console.error(
        "Supabase is not configured. Please set environment variables."
      );
      set({ loading: false });
      return;
    }

    try {
      set({ loading: true });

      // Fetch products from Supabase
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        set({ loading: false });
        return;
      }

      if (data && data.length > 0) {
        // Convert database format to ProductWithInventory
        const products: ProductWithInventory[] = data
          .filter((p) => p && p.id) // Filter out invalid products
          .map((p) => ({
            id: p.id || "",
            name: p.name || "Unknown Product",
            brand: p.brand || "Unknown Brand",
            price: Number(p.price) || 0,
            image: p.image || "",
            category: p.category || "uncategorized",
            description: p.description || "",
            stock: Number(p.stock) || 0,
            sku: p.sku || undefined,
          }));
        set({ products, loading: false });
      } else {
        // Database is empty, try to seed using secure function
        // First, check if user is admin before attempting to seed
        const {
          data: { session },
        } = await supabase.auth.getSession();
        let isAdmin = false;

        if (session?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();

          isAdmin = profile?.role === "admin";
        }

        // Only attempt seeding if user is admin
        if (isAdmin) {
          const { error: seedError } = await supabase.rpc("seed_products");

          if (seedError) {
            // Only log unexpected errors, not permission errors
            if (
              !seedError.message?.includes("admin") &&
              !seedError.message?.includes("permission")
            ) {
              console.error(
                "Unexpected error seeding products:",
                seedError.message
              );
            }

            // Fall back to local products
            const productsWithStock: ProductWithInventory[] =
              initialProducts.map((p) => ({
                ...p,
                stock: 100,
                sku: `SKU-${p.id.padStart(6, "0")}`,
              }));
            set({ products: productsWithStock, loading: false });
            return;
          }
        } else {
          // User is not admin - silently use local products
          const productsWithStock: ProductWithInventory[] = initialProducts.map(
            (p) => ({
              ...p,
              stock: 100,
              sku: `SKU-${p.id.padStart(6, "0")}`,
            })
          );
          set({ products: productsWithStock, loading: false });
          return;
        }

        // If seeding succeeded, fetch the products
        const { data: seededData, error: fetchError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching seeded products:", fetchError);
          set({ loading: false });
          return;
        }

        if (seededData && seededData.length > 0) {
          const products: ProductWithInventory[] = seededData
            .filter((p) => p && p.id)
            .map((p) => ({
              id: p.id || "",
              name: p.name || "Unknown Product",
              brand: p.brand || "Unknown Brand",
              price: Number(p.price) || 0,
              image: p.image || "",
              category: p.category || "uncategorized",
              description: p.description || "",
              stock: Number(p.stock) || 0,
              sku: p.sku || undefined,
            }));
          set({ products, loading: false });
        } else {
          // Fallback: use local products if seeding didn't work
          const productsWithStock: ProductWithInventory[] = initialProducts.map(
            (p) => ({
              ...p,
              stock: 100,
              sku: `SKU-${p.id.padStart(6, "0")}`,
            })
          );
          set({ products: productsWithStock, loading: false });
        }
      }
    } catch (error) {
      console.error("Error initializing products:", error);
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    const newProduct: ProductWithInventory = {
      ...product,
      id: Date.now().toString(),
      stock: product.stock || 0,
      sku: product.sku || `SKU-${Date.now()}`,
    };

    // If Supabase is configured, save to database
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

    // Update local state
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
      const updateData: any = {};
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

      // Update local state
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

      // Update local state
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

      // Update local state
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
