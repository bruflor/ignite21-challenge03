import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const responseProduct = await api.get(`/products/${productId}`);
      const responseStock = await api.get(`/stock/${productId}`);
      const storagedCart = localStorage.getItem("@RocketShoes:cart");
      const onCart = cart.findIndex((element) => element.id === productId);
      if (onCart === -1) {
        responseProduct.data["amount"] = 1;
        setCart((state) => [...state, responseProduct.data]);
        console.log("novo");
        // localStorage.setItem(
        //   "@RocketShoes:cart",
        //   JSON.stringify([...cart, response.data])
        // );
      } else {
        const newCart = [...cart];
        newCart[onCart].amount = newCart[onCart].amount + 1;
        setCart(newCart);
        console.log("já tem desse");
      }
      // response.data["amount"] = 1;
      // setCart((state) => [...state, response.data]);
    } catch (err) {
      console.log(err);
    }
  };
  console.log("this is my cart", cart);

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
