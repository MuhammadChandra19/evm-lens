import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Wallet,
  Users,
  TrendingUp,
  ExternalLink,
  Copy
} from "lucide-react";
import { useState } from "react";
import { useAccounts } from "./use-accounts";

const AccountsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    accounts,
    totalAccounts,
    eoaAccounts,
    contractAccounts,
    totalBalance,
    formatAddress,
    formatBalance,
    getAccountTypeColor,
  } = useAccounts();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Browse and manage blockchain accounts across playgrounds
          </p>
        </div>
        <Badge variant="outline">
          {totalAccounts} Total
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Accounts</CardTitle>
          <CardDescription>
            Find accounts by address, type, or playground
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by address, type, or playground..."
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

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Across all playgrounds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">EOA Accounts</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eoaAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              Externally owned accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contracts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contractAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              Smart contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBalance(totalBalance.toString())}
            </div>
            <p className="text-xs text-muted-foreground">
              ETH equivalent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>
            Complete list of accounts across all playgrounds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getAccountTypeColor(account.type)}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">
                        {formatAddress(account.address)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => navigator.clipboard.writeText(account.address)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Badge variant="secondary" className="text-xs">
                        {account.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Playground {account.playground} • {account.transactionCount} transactions
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatBalance(account.balance)} ETH
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Balance
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Data Notice */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Users className="h-5 w-5" />
            Live EVM Account Data
          </CardTitle>
          <CardDescription className="text-green-700">
            Real-time account data from the EVM state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700">
            Account data is now sourced directly from the EVM store, showing real balances,
            nonces, and contract information. Data updates automatically as transactions are executed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPage;
