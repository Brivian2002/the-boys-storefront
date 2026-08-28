import { CartProvider } from "@/components/store/CartProvider";
import { Toaster } from "@/components/ui/sonner";
import Cart from "@/pages/Cart";
import Atelier from "@/pages/Atelier";
import Checkout from "@/pages/Checkout";
import Home from "@/pages/Home";
import InformationPages from "@/pages/InformationPages";
import NotFound from "@/pages/NotFound";
import ProductDetail from "@/pages/ProductDetail";
import PaymentVerification from "@/pages/PaymentVerification";
import Shop from "@/pages/Shop";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./marketplace.css";
import "./ops.css";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/shop" component={Shop} /><Route path="/shop/:slug" component={ProductDetail} /><Route path="/cart" component={Cart} /><Route path="/checkout" component={Checkout} /><Route path="/checkout/verify" component={PaymentVerification} /><Route path="/delivery" component={InformationPages} /><Route path="/policies" component={InformationPages} /><Route path="/contact" component={InformationPages} /><Route path="/atelier" component={Atelier} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><CartProvider><Router /><Toaster /></CartProvider></ThemeProvider></ErrorBoundary>;
}
