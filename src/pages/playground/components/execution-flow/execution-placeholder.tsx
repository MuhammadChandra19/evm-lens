import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Cpu,
  BarChart3,
  Eye,
  ArrowRight,
  Layers,
  Zap,
} from "lucide-react";

const ExecutionPlaceholder = () => {
  const features = [
    {
      icon: Eye,
      title: "Visual Flow",
      description: "See your contract execution as an interactive flowchart",
    },
    {
      icon: Cpu,
      title: "Opcode Tracing",
      description: "Step-by-step EVM opcode execution with detailed analysis",
    },
    {
      icon: Layers,
      title: "State Inspection",
      description: "Monitor stack, memory, and storage changes in real-time",
    },
    {
      icon: BarChart3,
      title: "Gas Analysis",
      description: "Track gas consumption for each operation",
    },
  ];

  return (
    <div className="w-full col-span-9 flex flex-col gap-3 h-full">
      {/* Compact Header */}
      <div className="flex items-center gap-3 p-3 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-lg">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Play className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900">
            Execution Flow Visualization
          </h3>
          <p className="text-sm text-blue-700">
            Execute a function to see the interactive EVM execution flow
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          <Zap className="w-3 h-3 mr-1" />
          Ready
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {features.slice(0, 4).map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
          >
            <feature.icon className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-medium text-gray-900">
                {feature.title}
              </div>
              <div className="text-xs text-gray-600">
                {feature.description.split(" ").slice(0, 4).join(" ")}...
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Demo Visualization Area */}
      <Card className="border border-gray-200 flex-1">
        <CardContent className="p-4 h-full">
          <div className="h-full min-h-48 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50/50">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold">1</span>
                </div>
                <ArrowRight className="w-4 h-4" />
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold">2</span>
                </div>
                <ArrowRight className="w-4 h-4" />
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold">3</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Select a function and execute to see the flow
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutionPlaceholder;
