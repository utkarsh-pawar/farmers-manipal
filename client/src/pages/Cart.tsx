import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../components/ui/use-toast";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Truck,
} from "lucide-react";
import api from "../lib/axios";

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalAmount, clearCart } =
    useCart();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [orderData, setOrderData] = useState({
    shippingAddress: "",
    paymentMethod: "cash" as "cash" | "card" | "online",
    notes: "",
  });

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    if (!orderData.shippingAddress.trim()) {
      toast({
        title: "Error",
        description: "Please provide a shipping address",
        variant: "destructive",
      });
      return;
    }

    if (orderData.shippingAddress.trim().length < 10) {
      toast({
        title: "Error",
        description: "Shipping address must be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        products: items.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes,
      };

      await api.post("/orders", orderPayload);

      toast({
        title: "Success",
        description: "Order placed successfully!",
      });

      clearCart();
      setOrderData({ shippingAddress: "", paymentMethod: "cash", notes: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold">Your cart is empty</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add some products to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold">Shopping Cart</h2>

        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)}/{item.unit}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.availableQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
          <div className="text-right">
            <p className="text-lg font-semibold">
              Total: ${totalAmount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {items.reduce((sum, item) => sum + item.quantity, 0)} items
            </p>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Place Order
            </CardTitle>
            <CardDescription>Complete your order details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Textarea
                  id="shippingAddress"
                  placeholder="Enter your complete shipping address (minimum 10 characters)"
                  value={orderData.shippingAddress}
                  onChange={(e) =>
                    setOrderData((prev) => ({
                      ...prev,
                      shippingAddress: e.target.value,
                    }))
                  }
                  required
                  minLength={10}
                />
                {orderData.shippingAddress.length > 0 &&
                  orderData.shippingAddress.length < 10 && (
                    <p className="text-sm text-red-500">
                      Shipping address must be at least 10 characters long
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={orderData.paymentMethod}
                  onValueChange={(value: "cash" | "card" | "online") =>
                    setOrderData((prev) => ({ ...prev, paymentMethod: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Cash on Delivery
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Credit/Debit Card
                      </div>
                    </SelectItem>
                    <SelectItem value="online">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Online Payment
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or notes for your order"
                  value={orderData.notes}
                  onChange={(e) =>
                    setOrderData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Order Summary</Label>
                <div className="bg-muted p-3 rounded space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Items:</span>
                    <span>
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cart;
