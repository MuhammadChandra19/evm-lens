import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, ArrowLeft, Coins, Wallet } from "lucide-react";
import { useAccountDetail, TokenBalance } from "./use-account-detail";
import useAppStore from "@/store/app";
import { ETH_DECIMAL } from "@/lib/constants";

const AccountDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accounts } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Find account by address (id is the account address)
  const account = Array.from(accounts.values()).find(
    acc => acc.address.toString() === id
  );

  const {
    tokenBalances,
    isLoading,
    error,
    refreshBalances,
    totalTokens
  } = useAccountDetail(id || "");

  if (!account) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Account Not Found</h1>
          <p className="text-muted-foreground">
            The account address "{id}" was not found.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalances();
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account.address.toString());
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: bigint) => {
    return (Number(balance) / Math.pow(10, ETH_DECIMAL)).toFixed(4);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Account Details</h1>
            <p className="text-muted-foreground">
              {account.isContract ? "Contract Account" : "Externally Owned Account"}
            </p>
          </div>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="text-sm font-medium">Address</div>
              <div className="font-mono text-sm">{account.address.toString()}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={copyAddress}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* ETH Balance */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">ETH Balance</div>
              <div className="text-xl font-bold">
                {formatBalance(account.balance)} ETH
              </div>
            </div>

            {/* Transaction Count */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Transactions</div>
              <div className="text-xl font-bold">{Number(account.nonce)}</div>
            </div>

            {/* Account Type */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Type</div>
              <Badge variant={account.isContract ? "secondary" : "default"}>
                {account.isContract ? "Contract" : "EOA"}
              </Badge>
            </div>

            {/* Token Count */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Token Types</div>
              <div className="text-xl font-bold">{totalTokens}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Holdings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Holdings
          </CardTitle>
          <CardDescription>
            ERC20 token balances from all playground contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading token balances...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          ) : tokenBalances.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No token balances found</p>
              <p className="text-sm text-muted-foreground">
                This account doesn't hold any tokens from playground contracts
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokenBalances.map((token: TokenBalance, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {token.symbol?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <div className="font-medium">
                        {token.name || 'Unknown Token'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {token.symbol || 'TKN'} • Contract: {formatAddress(token.contractAddress)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {token.formattedBalance}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {token.symbol || 'TKN'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Details */}
      {account.isContract && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Code Hash</div>
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  {account.codeHash || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Storage Root</div>
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  {account.storageRoot || 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountDetailPage;
