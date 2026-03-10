export interface Artist {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  whatsapp?: string;
  email: string;
  district: string;
  bio?: string;
  art_types: string[];
  is_verified: boolean;
  is_active: boolean;
  profile_image_url: string;
  nid_front_url?: string;
  nid_back_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  total_sales: number;
  total_earnings: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface Artwork {
  id: string;
  artist_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  size_inches?: string;
  medium?: string;
  colors?: string;
  year_created?: string;
  image_url: string;
  image_public_id?: string;
  thumbnail_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  is_featured: boolean;
  views_count: number;
  order_count: number;
  admin_note?: string;
  created_at: string;
  approved_at?: string;
  artist?: Artist;
}

export interface Order {
  id: string;
  order_number: string;
  artwork_id: string;
  artist_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_district: string;
  customer_note?: string;
  artwork_title: string;
  artwork_price: number;
  payment_method: string;
  status: 'new' | 'confirmed' | 'delivered' | 'cancelled';
  artist_note?: string;
  confirmed_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  created_at: string;
  artwork?: Artwork;
}

export interface Review {
  id: string;
  order_id: string;
  artwork_id: string;
  artist_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  is_visible: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  artist_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_order_id?: string;
  related_artwork_id?: string;
  created_at: string;
}
