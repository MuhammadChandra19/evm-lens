import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Clock,
  Zap,
  ExternalLink
} from "lucide-react";
import { useTransactions } from "./use-transactions";
import { useState } from "react";

const TransactionsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    totalTransactions,
    recentTransactions,
    totalGasUsed,
    functionCalls,
    deployments,
    isLoading,
    formatGas,
    getTransactionTypeColor,
    getTransactionTypeName,
  } = useTransactions();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Browse and search all network transactions
          </p>
        </div>
        <Badge variant="outline">
          {totalTransactions} Total
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Transactions</CardTitle>
          <CardDescription>
            Find transactions by ID, type, or playground
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID, type, or playground..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest blockchain activity across all playgrounds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading transactions...
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions?.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getTransactionTypeColor(tx.type)}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{tx.id}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getTransactionTypeName(tx.type)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(tx.timestamp).toLocaleString()}
                        <span className="mx-1">•</span>
                        Playground {tx.playgroundId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Zap className="h-3 w-3" />
                        {formatGas(Number(tx.gasUsed))} gas
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Gas Used
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                </div>
              )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Function Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {functionCalls}
            </div>
            <p className="text-xs text-muted-foreground">
              Smart contract interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deployments}
            </div>
            <p className="text-xs text-muted-foreground">
              Contract deployments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatGas(totalGasUsed)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cumulative consumption
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionsPage;
