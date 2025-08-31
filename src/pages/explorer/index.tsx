import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Zap,
  Database,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { useExplorer } from "@/hooks/use-explorer";

const ExplorerDashboard = () => {
  const {
    metrics,
    stats24h,
    totalPlaygrounds,
    activePlaygrounds,
    isLoading,
    formatNumber,
    formatGas,
    getTransactionTypeColor,
    getTransactionTypeName,
  } = useExplorer();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EVM Lens Explorer</h1>
          <p className="text-muted-foreground">
            Real-time blockchain analytics and transaction monitoring
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatNumber(metrics?.totalTransactions || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {stats24h?.transactionsLast24h || 0} in 24h
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Average Gas Used */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Gas Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatGas(metrics?.avgGasUsed || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {formatGas(stats24h?.avgGasLast24h || 0)} in 24h
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Total Gas Consumed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gas Consumed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatNumber(metrics?.totalGasUsed || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cumulative gas usage
            </p>
          </CardContent>
        </Card>

        {/* Active Playgrounds */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Playgrounds</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPlaygrounds}
            </div>
            <p className="text-xs text-muted-foreground">
              Total environments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Breakdown and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Types</CardTitle>
            <CardDescription>
              Breakdown of transaction types in the network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : (
              metrics?.transactionsByType?.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getTransactionTypeColor(item.type)}`} />
                    <span className="text-sm font-medium">
                      {getTransactionTypeName(item.type)}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {formatNumber(item.count)}
                  </Badge>
                </div>
              )) || <div className="text-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest blockchain activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center text-muted-foreground">Loading...</div>
              ) : (
                metrics?.recentTransactions?.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getTransactionTypeColor(tx.type)}`} />
                      <div>
                        <div className="text-sm font-medium">
                          {getTransactionTypeName(tx.type)}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatGas(Number(tx.gasUsed))} gas</div>
                      <div className="text-xs text-muted-foreground">
                        Playground {tx.playgroundId}
                      </div>
                    </div>
                  </div>
                )) || <div className="text-center text-muted-foreground">No recent transactions</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle>Network Status</CardTitle>
          <CardDescription>
            Current network health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-muted-foreground">Network Uptime</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(metrics?.totalTransactions || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Blocks Processed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {activePlaygrounds}
              </div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExplorerDashboard;