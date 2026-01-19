import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full rounded-2xl shadow-md">
        <CardContent className="p-5 sm:p-8 space-y-6 text-center">
          <div className="mb-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 sm:mb-6 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
            <svg className="w-12 h-12 sm:w-14 sm:h-14 text-period-red" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3">CycleTracker</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Track and understand your menstrual cycle with comprehensive insights
          </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate("/period/cycle-history", { state: { from: "/index" } })}
          >
            View Cycle History
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/period/log-cycle", { state: { from: "/index" } })}
          >
            Log New Cycle
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/period/cycle-calendar", { state: { from: "/cycle-history" } })}
          >
            View Calendar
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/cycle-insight")}
          >
            View Insights
          </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
