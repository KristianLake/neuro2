export interface Product {
  id: string;
  name: string;
  description: string | null;
  type: 'module' | 'course';
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  status_reason?: string;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  products: Product | null;
  user?: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
}

export interface PurchaseWithProduct extends Purchase {
  products: Product;
  user?: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
}