import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Play,
  Zap,
  Eye,
  BookOpen,
  ArrowRight,
  Plus,
  FolderOpen,
  Cpu,
  BarChart3,
  Shield,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router";

const Landing = () => {
  const navigate = useNavigate();

  const handleCreateContract = () => {
    navigate("/create-contract");
  };

  const handleChooseProject = () => {
    // TODO: Implement project selection logic
    console.log("Choose existing project - to be implemented");
  };

  const features = [
    {
      icon: Cpu,
      title: "EVM Simulation",
      description:
        "Full Ethereum Virtual Machine simulation with step-by-step execution tracing",
    },
    {
      icon: Code2,
      title: "Smart Contract Deployment",
      description:
        "Deploy and interact with smart contracts in a safe, simulated environment",
    },
    {
      icon: Eye,
      title: "Visual Execution Flow",
      description:
        "See exactly how your contract executes with interactive visual diagrams",
    },
    {
      icon: BarChart3,
      title: "Gas Analysis",
      description:
        "Understand gas consumption patterns and optimize your contract efficiency",
    },
    {
      icon: Shield,
      title: "Security Insights",
      description:
        "Identify potential vulnerabilities and best practices in your smart contracts",
    },
    {
      icon: Layers,
      title: "State Management",
      description:
        "Track storage changes, memory usage, and stack operations in real-time",
    },
  ];

  const useCases = [
    "Learn Solidity and smart contract development",
    "Debug complex contract interactions",
    "Optimize gas usage and performance",
    "Understand EVM internals and opcodes",
    "Test contract behavior before mainnet deployment",
    "Educational workshops and blockchain courses",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EVM Lens</h1>
              <p className="text-sm text-gray-500">Smart Contract Explorer</p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            v1.0.0 Beta
          </Badge>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Interactive Ethereum
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}
                Smart Contract{" "}
              </span>
              Explorer
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Learn, deploy, and analyze smart contracts with our comprehensive
              EVM simulator. Perfect for developers, students, and anyone
              curious about blockchain technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                onClick={handleCreateContract}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Contract
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg font-semibold"
                onClick={handleChooseProject}
              >
                <FolderOpen className="w-5 h-5 mr-2" />
                Choose Existing Project
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-gray-500">EVM Compatible</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  Real-time
                </div>
                <div className="text-sm text-gray-500">Execution Tracing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  Zero Cost
                </div>
                <div className="text-sm text-gray-500">
                  Simulation Environment
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to understand and master smart contract
              development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Perfect For
              </h2>
              <div className="space-y-4">
                {useCases.map((useCase, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      {useCase}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-2xl text-white">
                  Ready to Explore?
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Start your smart contract journey today with our interactive
                  tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-blue-100">
                  <BookOpen className="w-5 h-5" />
                  <span>Comprehensive learning resources</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <Play className="w-5 h-5" />
                  <span>Interactive tutorials and examples</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <Zap className="w-5 h-5" />
                  <span>Real-time feedback and analysis</span>
                </div>
                <Button
                  variant="secondary"
                  className="w-full mt-6 bg-white text-blue-600 hover:bg-blue-50"
                  onClick={handleCreateContract}
                >
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-gray-200">
          <p className="text-gray-500">
            Built with ❤️ for the Ethereum developer community
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
