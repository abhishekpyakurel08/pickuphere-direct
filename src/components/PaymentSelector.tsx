import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Smartphone, Wallet } from 'lucide-react';

export type PaymentMethod = 'esewa' | 'khalti' | 'stripe';

interface PaymentSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
}

const paymentMethods = [
  {
    id: 'esewa' as PaymentMethod,
    name: 'eSewa',
    description: 'Pay with eSewa wallet',
    icon: Smartphone,
    color: 'bg-green-500',
    logo: '🟢',
  },
  {
    id: 'khalti' as PaymentMethod,
    name: 'Khalti',
    description: 'Pay with Khalti wallet',
    icon: Wallet,
    color: 'bg-purple-500',
    logo: '🟣',
  },
  {
    id: 'stripe' as PaymentMethod,
    name: 'Card Payment',
    description: 'Visa, Mastercard, etc.',
    icon: CreditCard,
    color: 'bg-blue-500',
    logo: '💳',
  },
];

export function PaymentSelector({ selectedMethod, onSelectMethod }: PaymentSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground mb-3">Select Payment Method</h3>
      {paymentMethods.map((method, index) => {
        const isSelected = selectedMethod === method.id;
        const Icon = method.icon;
        
        return (
          <motion.button
            key={method.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectMethod(method.id)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${method.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{method.name}</h4>
                  <span className="text-lg">{method.logo}</span>
                </div>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
