import { CartProvider } from "@/components/store/CartProvider";
import { Toaster } from "@/components/ui/sonner";
import Cart from "@/pages/Cart";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import ProductDetail from "@/pages/ProductDetail";
import Shop from "@/pages/Shop";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/shop" component={Shop} /><Route path="/shop/:slug" component={ProductDetail} /><Route path="/cart" component={Cart} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><CartProvider><Router /><Toaster /></CartProvider></ThemeProvider></ErrorBoundary>;
}
