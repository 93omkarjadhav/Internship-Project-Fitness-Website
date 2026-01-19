import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Week2 Pages (Setup Flow)
import CalendarCard from "./pages/CalendarCard";
import SetupIntro from "./pages/SetupIntro";

import CycleSelector from "./pages/CycleSelector";
import Treatments from "./pages/Treatments";
import PeriodSelector from "./pages/PeriodSelector";
import Symptoms from "./pages/Symptoms";
import Analyze from "./pages/Analyze";
import NextPeriod from "./pages/NextPeriod";
import Dashboard from "./pages/Dashboard";
// Existing Pages (Main App)
import Index from "./pages/Index";
import CycleHistory from "./pages/CycleHistory";
import CycleDetails from "./pages/CycleDetails";
import CycleInsight from "./pages/CycleInsight";
import CycleCalendar from "./pages/CycleCalendar";
import LogCycle from "./pages/LogCycle";
import CycleSuccess from "./pages/CycleSuccess";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Week2 Setup Flow Routes */}
            <Route path="/" element={<CalendarCard />} />
            <Route path="/setup-intro" element={<SetupIntro />} />
           
            <Route path="/cycle" element={<CycleSelector />} />
            <Route path="/treatment" element={<Treatments />} />
            <Route path="/period-start" element={<PeriodSelector />} />
            <Route path="/symptoms" element={<Symptoms />} />
            <Route path="/Analyzing" element={<Analyze />} />
            <Route path="/next-period" element={<NextPeriod />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Existing Main App Routes */}
            <Route path="/index" element={<Index />} />
            <Route path="/cycle-history" element={<CycleHistory />} />
            {/* CycleDetails page removed */}
            <Route path="/cycle-insight" element={<CycleInsight />} />
            <Route path="/cycle-calendar" element={<CycleCalendar />} />
            <Route path="/log-cycle" element={<LogCycle />} />
            <Route path="/cycle-success" element={<CycleSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
