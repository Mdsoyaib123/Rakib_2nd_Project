export interface TProduct {
  productId: number;
  status: "Active" | "Inactive";
  name: string;
  price: number;
  commission: number; // percentage
  salePrice: number;
  introduction: string;
  poster: string; // image URL or filename
}
