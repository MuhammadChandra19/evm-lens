import React from 'react';
import useEVMStore from '@/store/evm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * ActionHistoryViewer - Component to view and manage action history
 * This component demonstrates the action snapshot system
 */
const ActionHistoryViewer: React.FC = () => {
  const { getActionHistory, clearActionHistory } = useEVMStore();
  const actionHistory = getActionHistory();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatPayload = (payload: unknown) => {
    if (!payload) return 'N/A';

    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'DEPLOY_CONTRACT':
        return 'bg-blue-500';
      case 'CREATE_ACCOUNT':
        return 'bg-green-500';
      case 'FUND_ACCOUNT':
        return 'bg-yellow-500';
      case 'CALL_FUNCTION':
        return 'bg-purple-500';
      case 'REGISTER_ACCOUNT':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Action History ({actionHistory.length} actions)</CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearActionHistory}
            disabled={actionHistory.length === 0}
          >
            Clear History
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {actionHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No actions recorded yet. Perform some EVM operations to see them here.
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {actionHistory.map((action, index) => (
              <div key={action.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-500">
                      #{index + 1}
                    </span>
                    <Badge className={getActionTypeColor(action.type)}>
                      {action.type}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(action.timestamp)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Payload:</h4>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {formatPayload(action.payload)}
                    </pre>
                  </div>

                  {action.result !== undefined && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Result:</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {typeof action.result === "string" || typeof action.result === "number" || typeof action.result === "boolean"
                          ? String(action.result)
                          : formatPayload(action.result)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionHistoryViewer;
