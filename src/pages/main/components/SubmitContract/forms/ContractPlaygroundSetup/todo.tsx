import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  Dice6,
  Upload,
  Copy,
  Zap,
  Settings,
  BookOpen,
  Wallet,
  Coins,
  SearchCode,
} from "lucide-react";
// import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

const ContractPlaygroundSetup = () => {
  const [formData, setFormData] = useState({
    contractAddress: "0x742d35Cc6ab8b2532c4b4b3d34d0f0d1f8b8c8d8",
    ownerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    totalSupply: "1000000",
    decimals: "18",
    constructorBytecode:
      "0x608060405234801561001057600080fd5b506040516107d03803806107d083398101604052810190508061002f576000803c8d6000fd5b50600160005560408051908101604052806020016040528060051b6040528060051b6040528160068201526004810191825260408051602001604052806020016040528060051b6040528060051b604052816006820",
    contractAbi: `[
  {
    "inputs": [
      {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]`,
    gasLimit: "300000",
    gasPrice: "20",
    enableDebug: true,
    enableTrace: true,
    recordStateChanges: true,
    autoExplore: true,
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = (data: {
    contractAddress: string;
    ownerAddress: string;
    totalSupply: string;
    decimals: string;
    constructorBytecode: string;
    contractAbi: string;
    gasLimit: string;
    gasPrice: string;
    enableDebug: boolean;
    enableTrace: boolean;
    recordStateChanges: boolean;
    autoExplore: boolean;
  }) => {
    console.log("Deploy Contract:", data);
  };

  const generateRandomAddress = () => {
    const randomAddress =
      "0x" +
      Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join("");
    updateFormData("contractAddress", randomAddress);
  };

  const loadTemplate = (template: string) => {
    if (template === "erc20") {
      updateFormData(
        "contractAbi",
        `[
        {
          "inputs": [{"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "symbol", "type": "string"}],
          "stateMutability": "nonpayable", "type": "constructor"
        },
        {
          "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
          "name": "transfer", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "nonpayable", "type": "function"
        }
      ]`,
      );
    }
  };

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <SearchCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EVM Lens</h1>
              <p className="text-sm text-gray-500">
                Learn smart contracts by deploying and exploring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <BookOpen className="w-4 h-4 mr-2" />
              Tutorial
            </Button>
            <Button variant="outline" size="sm">
              Examples
            </Button>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Local Node Ready
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              🎯 Smart Contract Playground Setup
            </h2>
            <p className="text-blue-100 text-lg">
              Configure your contract parameters and deploy to your local
              blockchain!
            </p>
          </CardContent>
        </Card>

        {/* Contract Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Contract Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                📍 Contract Address (where it will be deployed)
              </label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={formData.contractAddress}
                  onChange={(e) =>
                    updateFormData("contractAddress", e.target.value)
                  }
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomAddress}
                >
                  <Dice6 className="w-4 h-4 mr-2" />
                  Generate Random
                </Button>
                <Button type="button" variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Deterministic
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                👤 Owner Address
              </label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={formData.ownerAddress}
                  onChange={(e) =>
                    updateFormData("ownerAddress", e.target.value)
                  }
                  className="font-mono text-sm"
                />
                <Button type="button" variant="outline">
                  Use Default Account
                </Button>
                <Button type="button" variant="outline">
                  Import Private Key
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Total Supply (for ERC20 tokens)
                </label>
                <Input
                  value={formData.totalSupply}
                  onChange={(e) =>
                    updateFormData("totalSupply", e.target.value)
                  }
                  type="number"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Decimals
                </label>
                <Select
                  value={formData.decimals}
                  onValueChange={(value) => updateFormData("decimals", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="18">18</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bytecode & ABI */}
        <Card>
          <CardHeader>
            <CardTitle>📜 Bytecode & ABI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Constructor Bytecode
                </label>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              <Textarea
                value={formData.constructorBytecode}
                onChange={(e) =>
                  updateFormData("constructorBytecode", e.target.value)
                }
                rows={4}
                className="font-mono text-xs mt-2"
              />
              <div className="flex gap-2 flex-wrap mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadTemplate("erc20")}
                >
                  ERC20 Template
                </Button>
                <Button type="button" variant="outline" size="sm">
                  ERC721 Template
                </Button>
                <Button type="button" variant="outline" size="sm">
                  Custom Contract
                </Button>
                <Button type="button" variant="outline" size="sm">
                  Load Example
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  📋 Contract ABI (Application Binary Interface)
                </label>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              <Textarea
                value={formData.contractAbi}
                onChange={(e) => updateFormData("contractAbi", e.target.value)}
                rows={8}
                className="font-mono text-xs mt-2"
              />
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" size="sm">
                  🔍 Validate ABI
                </Button>
                <Button type="button" variant="outline" size="sm">
                  Auto-generate from Bytecode
                </Button>
                <Button type="button" variant="outline" size="sm">
                  Format JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Deployment Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gas Settings */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Gas Settings
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Gas Limit
                  </label>
                  <Input
                    value={formData.gasLimit}
                    onChange={(e) => updateFormData("gasLimit", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Gas Price (gwei)
                  </label>
                  <Input
                    value={formData.gasPrice}
                    onChange={(e) => updateFormData("gasPrice", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-end">
                  <div className="text-sm">
                    <div className="text-gray-500">Max Fee</div>
                    <div className="font-medium text-lg">~$12.50</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Advanced Options */}
            <div>
              <h4 className="font-medium mb-4">🔧 Advanced Options</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium leading-none">
                    Enable debugging mode
                  </span>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium leading-none">
                    Record all state changes
                  </span>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium leading-none">
                    Trace opcode execution
                  </span>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium leading-none">
                    Auto-explore after deployment
                  </span>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Pre-deployment Validation */}
            <div>
              <h4 className="font-medium mb-4">📊 Pre-deployment Validation</h4>
              <div className="grid grid-cols-2 gap-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Bytecode is valid
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ABI matches bytecode
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Constructor params valid
                  </AlertDescription>
                </Alert>

                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    High gas usage detected
                  </AlertDescription>
                </Alert>
              </div>

              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Contract size: 12.4KB | Gas estimate successful
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Ethereum.js Status */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Ethereum.js Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Local Node: Running</span>
                </div>
                <div className="text-sm text-gray-600">ganache</div>
              </div>

              <div>
                <div className="font-medium mb-2">📦 Blocks: 0</div>
                <div className="text-sm text-gray-600">
                  ⛽ Gas Price: 20 gwei
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">
                  💰 Test Accounts: 10 loaded
                </div>
                <div className="text-sm text-gray-600">
                  💳 Default Balance: 1000 ETH each
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-6 text-sm text-gray-600">
              <div>🔗 Network ID: 1337</div>
              <div>📊 Block Time: ~2s</div>
              <div>📈 Total Gas Used: 0</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-lg z-50">
        <div className="max-w-6xl mx-auto p-4">
          {/* Quick Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 max-w-xs"
            >
              📚 Load Example Contract
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 max-w-xs"
            >
              🎯 Use Template
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 max-w-xs"
            >
              📁 Import from File
            </Button>
          </div>

          {/* Primary Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => onSubmit(formData)}
            >
              <Play className="w-5 h-5 mr-2" />
              🚀 Deploy & Explore Contract
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="border-gray-300 hover:border-gray-400"
            >
              💾 Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPlaygroundSetup;
