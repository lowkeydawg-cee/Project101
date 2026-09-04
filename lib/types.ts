export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  status: string;
  inventory: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type PaymentMethod = {
  id: string;
  label: string;
};

export type Order = {
  id: string;
  product_id: string | null;
  product_name: string;
  customer_name: string;
  phone: string;
  address: string;
  notes: string;
  status: string;
  created_at: string;
};
