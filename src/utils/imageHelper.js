// src/utils/imageHelper.js

/**
 * Builds a proper image URL for product images using the tenant schema.
 * Follows the same schema_name pattern as axiosInstance.
 *
 * @param {string|null|undefined} image - The image field from the product API response
 *   (e.g. "http://mardi.cafe.pootechnologies.tech/products/image.png" or "/products/image.png")
 * @returns {string|null} The resolved image URL, or null if no image is provided
 */
export const getImageUrl = (image) => {
  if (!image) return null;

  const schemaName = localStorage.getItem("schema_name");

  // Build the tenant base URL (without /api), matching axiosInstance's pattern
  const baseUrl =
    schemaName && schemaName !== "public"
      ? `https://${schemaName}.cafe.pootechnologies.tech`
      : "https://cafe.pootechnologies.tech";

  // If the image is already a full URL, extract just the path portion
  if (image.startsWith("http://") || image.startsWith("https://")) {
    try {
      const url = new URL(image);
      return `${baseUrl}${url.pathname}`;
    } catch {
      // If URL parsing fails, return as-is
      return image;
    }
  }

  // If it's a relative path, prepend the base URL
  const path = image.startsWith("/") ? image : `/${image}`;
  return `${baseUrl}${path}`;
};
