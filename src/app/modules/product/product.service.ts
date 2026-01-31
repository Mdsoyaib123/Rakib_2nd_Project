import { ProductModel } from "./product.model";
import { TProduct } from "./product.interface";

const generateUnique4DigitProductId = async (): Promise<number> => {
  for (let i = 0; i < 10; i++) {
    const productId = Math.floor(1000 + Math.random() * 9000);

    const exists = await ProductModel.exists({ productId });
    if (!exists) return productId;
  }

  throw new Error("All 4-digit product IDs are exhausted");
};

const createProduct = async (payload: TProduct) => {
  // console.log("product pyload", payload);
  payload.productId = await generateUnique4DigitProductId();
  payload.salePrice = Number(payload.price) + Number(payload.commission);

  const product = await ProductModel.create(payload);
  return product;
};

const updateProduct = async (productId: number, payload: Partial<TProduct>) => {
  // Recalculate salePrice if price or commission changes
  if (payload.price !== undefined || payload.commission !== undefined) {
    const existingProduct = await ProductModel.findOne({
      productId: productId,
    });

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    payload.salePrice =
      Number(payload.price ?? existingProduct.price) +
      Number(payload.commission ?? existingProduct.commission);
  }

  const updatedProduct = await ProductModel.findOneAndUpdate(
    { productId: productId },
    payload,
    { new: true, runValidators: true },
  );

  if (!updatedProduct) {
    throw new Error("Product not found");
  }

  return updatedProduct;
};
const getAllProducts = async (
  page = 1,
  limit = 10,
  name?: string,
  productId?: string,
  minPrice?: number,
  maxPrice?: number,
) => {
  const query: any = {};

  // Name search
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  // Product ID filter
  if (productId) {
    query.productId = Number(productId);
  }

  // ✅ Price range filter (safe)
  if (
    (typeof minPrice === "number" && !isNaN(minPrice)) ||
    (typeof maxPrice === "number" && !isNaN(maxPrice))
  ) {
    query.price = {};

    if (typeof minPrice === "number" && !isNaN(minPrice)) {
      query.price.$gte = minPrice;
    }

    if (typeof maxPrice === "number" && !isNaN(maxPrice)) {
      query.price.$lte = maxPrice;
    }
  }

  const data = await ProductModel.find(query)
    .sort({ price: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return { data };
};

const deleteProduct = async (productId: number) => {
  const deletedProduct = await ProductModel.findOneAndDelete({ productId });

  if (!deletedProduct) {
    throw new Error("Product not found");
  }

  return deletedProduct;
};

export const ProductService = {
  createProduct,
  updateProduct,
  getAllProducts,
  deleteProduct,
};
