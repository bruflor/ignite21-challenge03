import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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

  // useEffect(() => {
  //   localStorage.setItem("@RocketShoes:cart", JSON.stringify([...cart]));
  // }, [cart]);

  const addProduct = async (productId: number) => {
    try {
      const responseProduct = await api
        .get(`/products/${productId}`)
        .catch((error) => {
          toast.error("Erro na adição do produto");
        });
      const responseStock = await api
        .get(`/stock/${productId}`)
        .catch((error) => {
          toast.error("Erro na adição do produto");
        });
      const onCart = cart.findIndex((element) => element.id === productId);

      if (onCart === -1 && responseProduct?.status === 200) {
        responseProduct.data["amount"] = 1;
        setCart((state) => [...state, responseProduct.data]);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
      } else if (
        responseStock?.status === 200 &&
        responseStock.data.amount > cart[onCart].amount
      ) {
        const newCart = [...cart];
        newCart[onCart].amount = newCart[onCart].amount + 1;
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
      } else {
        toast.error("Quantidade solicitada fora de estoque");
        // throw new Error("Quantidade solicitada fora de estoque");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const onCart = cart.filter((product) => product.id === productId);
      if (onCart.length >= 1) {
        const cartWithoutDeleted = cart.filter(
          (product) => product.id !== productId
        );
        setCart(cartWithoutDeleted);
        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify(cartWithoutDeleted)
        );
      } else {
        toast.error("Erro na remoção do produto");
      }
    } catch (error) {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const responseStock = await api
        .get(`/stock/${productId}`)
        .catch((error) => {
          toast.error("Erro na alteração de quantidade do produto");
        });
      if (amount <= responseStock?.data.amount && amount >= 1) {
        const newCart = [...cart];
        const indexOnCart = cart.findIndex(
          (product) => product.id === productId
        );
        newCart[indexOnCart].amount = amount;
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      } else {
        toast.error("Quantidade solicitada fora de estoque");
      }
    } catch (error) {
      console.log(error);
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
