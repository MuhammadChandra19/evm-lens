import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Code2,
  Eye,
  ArrowRight,
  Zap,
  BookOpen,
  Target,
  MousePointer,
} from "lucide-react";

const Intro = () => {
  const steps = [
    {
      icon: MousePointer,
      title: "Select a Function",
      description: "Choose a function from the sidebar to start exploring",
    },
    {
      icon: Code2,
      title: "Configure Parameters",
      description: "Set input parameters and values for your function call",
    },
    {
      icon: Play,
      title: "Execute & Analyze",
      description: "Run the function and see the detailed execution flow",
    },
  ];

  const features = [
    "Step-by-step EVM execution tracing",
    "Interactive execution flow visualization",
    "Real-time stack, memory, and storage inspection",
    "Gas consumption analysis",
    "Opcode-level debugging capabilities",
  ];

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Welcome Header */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-blue-900">
            Welcome to EVM Playground
          </CardTitle>
          <CardDescription className="text-blue-700 text-base">
            Explore smart contract functions with interactive execution tracing
            and visualization
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Follow these simple steps to start exploring your smart contract
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <step.icon className="w-4 h-4 text-gray-600" />
                    <h4 className="font-semibold text-sm">{step.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}

            <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <ArrowRight className="w-4 h-4" />
                <span className="font-medium text-sm">
                  Start by selecting a function from the sidebar!
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              What You'll See
            </CardTitle>
            <CardDescription>
              Powerful features to understand your smart contract execution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}

            <div className="mt-6 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 text-purple-700">
                <Eye className="w-4 h-4" />
                <span className="font-medium text-sm">
                  Interactive visualization makes complex EVM operations easy to
                  understand
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tip */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-lg">💡</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Pro Tip</h4>
                <p className="text-sm text-gray-600">
                  Click on any node in the execution flow to inspect its
                  detailed state information
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Interactive
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Intro;
