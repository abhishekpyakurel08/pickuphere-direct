import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Package, DollarSign, Tag, FileText, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { productsApi, ProductData } from '@/services/api';
import { formatNPR } from '@/lib/currency';

interface VendorProductFormProps {
  product?: ProductData;
  onSuccess: () => void;
  onCancel: () => void;
}

const categories = ['liquor', 'beer', 'wine', 'spirits', 'cigarettes', 'mixers', 'snacks'];

export default function VendorProductForm({ product, onSuccess, onCancel }: VendorProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || 'liquor',
    stock: product?.stock || 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Image too large',
          description: 'Please select an image under 10MB',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (product?.id) {
        // Update existing product
        await productsApi.update(product.id, formData);
        toast({
          title: 'Product updated!',
          description: 'Your product has been updated successfully',
        });
      } else {
        // Create new product
        if (imageFile) {
          const formDataToSend = new FormData();
          formDataToSend.append('name', formData.name);
          formDataToSend.append('description', formData.description);
          formDataToSend.append('price', String(formData.price));
          formDataToSend.append('category', formData.category);
          formDataToSend.append('stock', String(formData.stock));
          formDataToSend.append('image', imageFile);
          await productsApi.createWithImage(formDataToSend);
        } else {
          await productsApi.create(formData);
        }
        toast({
          title: 'Product created!',
          description: 'Your product is pending approval',
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to save product',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6 p-6 bg-card rounded-lg border"
    >
      <h2 className="text-xl font-bold">
        {product ? 'Edit Product' : 'Add New Product'}
      </h2>

      {/* Image upload */}
      <div className="space-y-2">
        <Label>Product Image</Label>
        {imagePreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
            <img
              src={imagePreview}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload product image</span>
            <span className="text-xs text-muted-foreground mt-1">Max 10MB • Auto-compressed</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>

      {/* Product name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          <Package className="w-4 h-4 inline mr-2" />
          Product Name *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Khukuri Rum 750ml"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          <FileText className="w-4 h-4 inline mr-2" />
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your product..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Price (NPR) *
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="1"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            placeholder="0"
            required
          />
          {formData.price > 0 && (
            <p className="text-sm text-muted-foreground">{formatNPR(formData.price)}</p>
          )}
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label htmlFor="stock">
            <Boxes className="w-4 h-4 inline mr-2" />
            Stock Quantity *
          </Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
            placeholder="0"
            required
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>
          <Tag className="w-4 h-4 inline mr-2" />
          Category
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Commission notice */}
      <div className="bg-muted/50 p-3 rounded-lg text-sm">
        <p className="text-muted-foreground">
          💡 <strong>Commission:</strong> 3% commission applies after product is sold for 1 day.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}
