import { createContext, ReactNode, useContext, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
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
      const responseProduct = await api
        .get(`/products/${productId}`)
        .catch((error) => {
          throw new Error("Erro na adição do produto");
        });
      const responseStock = await api
        .get(`/stock/${productId}`)
        .catch((error) => {
          throw new Error("Erro na adição do produto");
        });
      const onCart = cart.findIndex((element) => element.id === productId);

      if (onCart === -1) {
        responseProduct.data["amount"] = 1;
        setCart((state) => [...state, responseProduct.data]);
        console.log("novo");
      } else if (responseStock.data.amount > cart[onCart].amount) {
        console.log("já tem desse");
        const newCart = [...cart];
        newCart[onCart].amount = newCart[onCart].amount + 1;
        setCart(newCart);
      } else {
        throw new Error("Quantidade solicitada fora de estoque");
      }

      localStorage.setItem("@RocketShoes:cart", JSON.stringify([...cart]));
    } catch (error) {
      console.log(error);
    }
  };
  console.log("this is my cart", cart);

  const removeProduct = (productId: number) => {
    try {
      console.log("exclui esse", productId);
      const cartWithoutDeleted = cart.filter(
        (product) => product.id !== productId
      );
      setCart(cartWithoutDeleted);
    } catch (error) {
      console.log(error);
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
