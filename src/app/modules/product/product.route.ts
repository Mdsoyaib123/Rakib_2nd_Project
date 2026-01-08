import express from "express";
import { ProductController } from "./product.controller";
import { createUploader } from "../../utils/cloudinary";

const router = express.Router();

const upload = createUploader('productImages')

router.post(
  "/create-product",
  upload.single("poster"),
  ProductController.createProduct
);
router.patch(
  "/update-product/:productId",
  upload.single("poster"),
  ProductController.updateProduct
);

router.get("/getAllProduct", ProductController.getAllProducts);
router.delete("/delete-product/:productId", ProductController.deleteProduct);

export const ProductRoutes = router;
