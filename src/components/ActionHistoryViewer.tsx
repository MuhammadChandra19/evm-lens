import React, { useState, useEffect } from "react";
import { useApp } from "@/hooks/use-app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdapterReplayableAction } from "@/service/action-recorder/types";

/**
 * ActionHistoryViewer - Component to view and manage action history
 * This component demonstrates the action snapshot system using ActionRecorder
 */
const ActionHistoryViewer: React.FC = () => {
  const { actionRecorder } = useApp();
  const [actionHistory, setActionHistory] = useState<AdapterReplayableAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load action history from ActionRecorder
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const { data: actions, error } = await actionRecorder.loadUnifiedSnapshotWithAdapter();
        if (error) {
          console.error("Failed to load action history:", error);
          setActionHistory([]);
        } else {
          setActionHistory(actions || []);
        }
      } catch (error) {
        console.error("Failed to load action history:", error);
        setActionHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [actionRecorder]);



  const formatPayload = (payload: unknown) => {
    if (!payload) return "N/A";

    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case "DEPLOY_CONTRACT":
        return "bg-blue-500";
      case "CREATE_ACCOUNT":
        return "bg-green-500";
      case "FUND_ACCOUNT":
        return "bg-yellow-500";
      case "CALL_FUNCTION":
        return "bg-purple-500";
      case "REGISTER_ACCOUNT":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Action History ({actionHistory.length} actions)</CardTitle>
          {isLoading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>
      </CardHeader>
      <CardContent>
        {actionHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No actions recorded yet. Perform some EVM operations to see them
            here.
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {actionHistory.map((action, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-500">
                      #{index + 1}
                    </span>
                    <Badge className={getActionTypeColor(action.type)}>
                      {action.type}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Payload:</h4>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {formatPayload(action.payload)}
                    </pre>
                  </div>
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
