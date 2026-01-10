import { motion } from 'framer-motion';

export const ProductCard = ({ product, index }: any) => {
  return (
    <motion.div
      className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg text-foreground">{product.name}</h3>
        <p className="text-muted-foreground mt-1">{product.description}</p>
        <p className="font-semibold text-primary mt-2">Rs {product.price}</p>
      </div>
    </motion.div>
  );
};
