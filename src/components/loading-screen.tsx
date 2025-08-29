import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Database, Cpu, Zap } from "lucide-react";

const LoadingScreen = () => {
  const loadingSteps = [
    { icon: Database, label: "Initializing Database", delay: "0s" },
    { icon: Cpu, label: "Loading EVM Engine", delay: "0.5s" },
    { icon: Zap, label: "Setting up Services", delay: "1s" },
    { icon: Eye, label: "Preparing Interface", delay: "1.5s" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Main Loading Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Logo/Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
              <Eye className="w-10 h-10 text-white relative z-10" />
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-75 animate-pulse"></div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">EVM Lens</h1>
            <p className="text-gray-600 mb-6">Initializing your smart contract explorer...</p>

            {/* Loading Progress */}
            <div className="space-y-3 mb-6">
              {loadingSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 animate-pulse"
                  style={{ animationDelay: step.delay }}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                    {step.label}
                  </span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: step.delay }}></div>
                </div>
              ))}
            </div>

            {/* Loading Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>

            {/* Status Badge */}
            <Badge variant="secondary" className="animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></div>
              Loading...
            </Badge>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="text-center space-y-2 text-sm text-gray-500">
          <p>Setting up your interactive EVM environment</p>
          <p className="text-xs">This may take a few moments on first load</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
