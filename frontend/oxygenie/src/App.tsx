import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navigation from "./components/Navigation";

import Home from "./pages/Home";
import Personalize from "./pages/Personalize";
import Recommendations from "./pages/Recommendations";
import PlantDetail from "./pages/PlantDetail";
import AIDetection from "./pages/AIDetection";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppLayout = () => {
  const location = useLocation();

  // hide Navigation on all /plant/* pages
  const hideNavigation = location.pathname.startsWith("/plant/");

  return (
    <>
      {!hideNavigation && <Navigation />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/personalize" element={<Personalize />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/plant/:id" element={<PlantDetail />} />
        <Route path="/ai-detection" element={<AIDetection />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
