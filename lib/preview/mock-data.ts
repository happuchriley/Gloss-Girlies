import type { User } from "@/store/authStore"
import type { Order } from "@/store/orderStore"
import type { ProductWithInventory } from "@/store/productStore"

export const mockCustomer: User = {
  id: "preview-customer",
  name: "Ama Demo",
  email: "demo@glossgirlies.com",
  phone: "+233 20 123 4567",
  role: "user",
  emailVerified: true,
}

export const mockAdmin: User = {
  id: "preview-admin",
  name: "Gloss Admin",
  email: "admin@glossgirlies.com",
  phone: "+233 20 987 6543",
  role: "admin",
  emailVerified: true,
}

export const mockCustomerOrders: Order[] = [
  {
    id: "GG-240531-001",
    userId: mockCustomer.id,
    items: [
      {
        id: "p1",
        name: "Rose Glow Serum",
        price: 189,
        image: "",
        quantity: 1,
      },
      {
        id: "p2",
        name: "Soft Matte Lip Tint",
        price: 85,
        image: "",
        quantity: 2,
      },
    ],
    shippingAddress: {
      fullName: "Ama Demo",
      phone: "+233201234567",
      addressLine1: "14 Ring Road East",
      city: "Accra",
      country: "Ghana",
    },
    paymentMethod: "paystack",
    fulfillmentType: "delivery",
    total: 359,
    status: "shipped",
    createdAt: "2026-05-28T10:30:00.000Z",
    trackingNumber: "GGTRK-839201",
    estimatedDelivery: "2026-06-02",
  },
  {
    id: "GG-240512-004",
    userId: mockCustomer.id,
    items: [
      {
        id: "p3",
        name: "Hydrating Hair Mask",
        price: 120,
        image: "",
        quantity: 1,
      },
    ],
    shippingAddress: {
      fullName: "Ama Demo",
      phone: "+233201234567",
      addressLine1: "14 Ring Road East",
      city: "Accra",
      country: "Ghana",
    },
    paymentMethod: "paystack",
    fulfillmentType: "pickup",
    total: 120,
    status: "delivered",
    createdAt: "2026-05-12T14:15:00.000Z",
    trackingNumber: "GGTRK-772104",
  },
]

export const mockAdminMetrics = {
  revenue: 4820,
  totalOrders: 24,
  totalProducts: 18,
  pendingOrders: 3,
  lowStock: 2,
  outOfStock: 1,
}

export const mockAdminProducts: ProductWithInventory[] = [
  {
    id: "p1",
    name: "Rose Glow Serum",
    brand: "Gloss Girlies",
    price: 189,
    image: "",
    category: "Skincare",
    description: "Brightening daily serum",
    stock: 42,
    sku: "GG-SERUM-01",
  },
  {
    id: "p2",
    name: "Soft Matte Lip Tint",
    brand: "Gloss Girlies",
    price: 85,
    image: "",
    category: "Lips",
    description: "Long-wear lip tint",
    stock: 8,
    sku: "GG-LIP-02",
  },
  {
    id: "p3",
    name: "Hydrating Hair Mask",
    brand: "Gloss Girlies",
    price: 120,
    image: "",
    category: "Hair",
    description: "Weekly deep treatment",
    stock: 0,
    sku: "GG-HAIR-03",
  },
  {
    id: "p4",
    name: "Luminous Setting Spray",
    brand: "Gloss Girlies",
    price: 95,
    image: "",
    category: "Face",
    description: "All-day glow finish",
    stock: 31,
    sku: "GG-FACE-04",
  },
]

export const mockAdminOrders: Order[] = [
  {
    id: "GG-240531-001",
    userId: mockCustomer.id,
    items: [{ id: "p1", name: "Rose Glow Serum", price: 189, image: "", quantity: 1 }],
    shippingAddress: { fullName: "Ama Demo", phone: "", addressLine1: "", city: "Accra", country: "Ghana" },
    paymentMethod: "paystack",
    fulfillmentType: "delivery",
    total: 359,
    status: "shipped",
    createdAt: "2026-05-28T10:30:00.000Z",
  },
  {
    id: "GG-240530-002",
    userId: null,
    isGuest: true,
    guestEmail: "guest@example.com",
    items: [{ id: "p2", name: "Soft Matte Lip Tint", price: 85, image: "", quantity: 2 }],
    shippingAddress: { fullName: "Kofi Mensah", phone: "+233201112233", addressLine1: "", city: "Kumasi", country: "Ghana" },
    paymentMethod: "paystack",
    fulfillmentType: "pickup",
    total: 245,
    status: "pending",
    createdAt: "2026-05-30T09:00:00.000Z",
  },
  {
    id: "GG-240529-003",
    userId: mockCustomer.id,
    items: [{ id: "p4", name: "Luminous Setting Spray", price: 95, image: "", quantity: 3 }],
    shippingAddress: { fullName: "Ama Demo", phone: "+233201234567", addressLine1: "", city: "Accra", country: "Ghana" },
    paymentMethod: "cod",
    fulfillmentType: "delivery",
    total: 520,
    status: "confirmed",
    createdAt: "2026-05-29T16:45:00.000Z",
  },
  {
    id: "GG-240527-005",
    userId: null,
    isGuest: true,
    items: [{ id: "p3", name: "Hydrating Hair Mask", price: 120, image: "", quantity: 1 }],
    shippingAddress: { fullName: "Esi Boateng", phone: "+233244556677", addressLine1: "", city: "Tema", country: "Ghana" },
    paymentMethod: "paystack",
    fulfillmentType: "pickup",
    total: 178,
    status: "delivered",
    createdAt: "2026-05-27T11:20:00.000Z",
  },
]
