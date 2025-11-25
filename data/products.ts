export interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
  brand: string
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Salicylic Acid Face Wash',
    price: 299,
    image: 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759626_skincare.jpg',
    category: 'Skincare',
    description: 'Deep cleansing face wash with salicylic acid',
    brand: 'DermDoc'
  },
  {
    id: '2',
    name: 'Matte Foundation',
    price: 499,
    image: 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759624_makeup.jpg',
    category: 'Makeup',
    description: 'Long-lasting matte finish foundation',
    brand: 'Lakme'
  },
  {
    id: '3',
    name: 'Hydrating Hair Serum',
    price: 399,
    image: 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759622_haircare.jpg',
    category: 'Haircare',
    description: 'Intensive hydration for dry and damaged hair',
    brand: 'L\'Oreal Paris'
  },
  {
    id: '4',
    name: 'CICA Sunscreen SPF 50',
    price: 349,
    image: 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759626_skincare.jpg',
    category: 'Skincare',
    description: 'Broad spectrum protection with CICA extract',
    brand: 'Good Vibes'
  },
  {
    id: '5',
    name: 'Rosemary Hair Spray',
    price: 249,
    image: 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759622_haircare.jpg',
    category: 'Haircare',
    description: 'Strengthening hair spray with rosemary extract',
    brand: 'Alps Goodness'
  },
  {
    id: '6',
    name: 'Winter Hydration Cream',
    price: 449,
    image: 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759626_skincare.jpg',
    category: 'Skincare',
    description: 'Intensive moisturizing cream for winter',
    brand: 'Foxtale'
  },
  {
    id: '7',
    name: 'Vitamin C Serum',
    price: 599,
    image: 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759626_skincare.jpg',
    category: 'Skincare',
    description: 'Brightening serum with Vitamin C',
    brand: 'Dot & Key'
  },
  {
    id: '8',
    name: 'Hair Care Combo',
    price: 899,
    image: 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759620_combos.jpg',
    category: 'Haircare',
    description: 'Complete hair care solution',
    brand: 'Mamaearth'
  },
]

export const categories = [
  { id: 'skincare', name: 'Skincare', image: 'https://media6.ppl-media.com/tr:w-171,ar-112-95,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759626_skincare.jpg' },
  { id: 'makeup', name: 'Makeup', image: 'https://media6.ppl-media.com/tr:w-171,ar-112-95,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759624_makeup.jpg' },
  { id: 'haircare', name: 'Haircare', image: 'https://media6.ppl-media.com/tr:w-171,ar-112-95,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759622_haircare.jpg' },
  { id: 'combos', name: 'Combos', image: 'https://media6.ppl-media.com/tr:w-171,ar-112-95,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759620_combos.jpg' },
]

