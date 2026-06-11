// ProductVariantsDisplay component for ManageOrder update modal
const ProductVariantsDisplay = ({
  product,
  selectedVariant,
  onSelectVariant,
}) => {
  if (!product || !product.variants || product.variants.length === 0)
    return null;
  return (
    <div className="mt-4">
      <h4 className="mb-2 text-sm font-medium">Available Variants:</h4>
      <div className="flex py-2 pb-4 space-x-3 overflow-x-auto">
        {product.variants.map((variant, idx) => {
          const isSelected = selectedVariant?.id === variant.id;
          return (
            <div
              key={idx}
              className={`mx-4 flex-shrink-0 relative group cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-blue-500 ring-offset-2 rounded-md"
                  : "hover:ring-2 hover:ring-gray-300"
              }`}
              onClick={() => onSelectVariant(variant)}
            >
              <div
                className="overflow-hidden border-2 rounded-lg p-2"
                style={{
                  borderColor: isSelected ? "" : "transparent",
                }}
              >
                <div className="p-2 text-xs text-center">
                  <div className="font-bold">
                    {variant.specification || "No Specification"}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-500 rounded-lg bg-opacity-10"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default ProductVariantsDisplay