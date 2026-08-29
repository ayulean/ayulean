export type BundleComponent = {
  productId: number;
  qty: number;
};

/** A component of a combo, resolved with the details needed to display it. */
export type ResolvedComponent = BundleComponent & {
  name: string;
  slug: string;
  image: string;
  price: number;
  stock: number;
};

export type ProductRow = {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  benefits: string[];
  ingredients: string;
  how_to_use: string;
  mrp: number;
  price: number;
  image: string;
  gallery: string[];
  stock: number;
  active: boolean;
  bundle_items: BundleComponent[];
  created_at: string;
};

export type Product = ProductRow & {
  discountPercent: number;
  rating: number;
  reviewCount: number;
  /** True when this product is a combo made of other products. */
  isBundle: boolean;
  /** Components with their names and stock, empty for a normal product. */
  components: ResolvedComponent[];
  /** Units that can actually be sold — component-limited for a combo. */
  available: number;
  /** What the components would cost bought separately (0 for a normal product). */
  separateValue: number;
};

export type Review = {
  id: number;
  product_id: number;
  name: string;
  email: string;
  rating: number;
  title: string;
  body: string;
  approved: boolean;
  created_at: string;
};

export type Coupon = {
  id: number;
  code: string;
  type: "percent" | "flat";
  value: number;
  min_order: number;
  max_discount: number;
  expires_at: string | null;
  usage_limit: number;
  per_customer_limit: number;
  used_count: number;
  active: boolean;
  created_at: string;
};

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  qty: number;
};

export type Order = {
  id: number;
  order_no: string;
  user_id: string | null;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  coupon_code: string;
  shipping: number;
  total: number;
  payment_method: "cod" | "online";
  payment_status: "pending" | "paid" | "failed";
  razorpay_order_id: string;
  razorpay_payment_id: string;
  status: string;
  notes: string;
  stock_reserved: boolean;
  tracking_number: string;
  courier: string;
  created_at: string;
};

export type ReplacementRequest = {
  id: number;
  order_no: string;
  name: string;
  phone: string;
  reason: string;
  details: string;
  status: "open" | "approved" | "rejected" | "completed";
  admin_note: string;
  created_at: string;
};
