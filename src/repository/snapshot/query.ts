import { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import snapshotSchema from "./entity";
import type { NewSnapshot } from "./entity";
import { eq, asc, inArray, count, avg, sum, sql } from "drizzle-orm";

const snapshotRepository = (db: SqliteRemoteDatabase) => {
  const create = async (payload: NewSnapshot) => {
    try {
      return db.insert(snapshotSchema).values(payload).returning();
    } catch (e) {
      throw new Error("failed to insert snapshot", {
        cause: e,
      });
    }
  };

  const loadPlaygroundSnapshot = async (playgroundId: number) => {
    try {
      const res = await db
        .select()
        .from(snapshotSchema)
        .where(eq(snapshotSchema.playgroundId, playgroundId))
        .orderBy(asc(snapshotSchema.timestamp));

      return res;
    } catch (e) {
      throw new Error("failed to load snapshot", {
        cause: e,
      });
    }
  };

  /**
   * Load ALL snapshots from ALL playgrounds, ordered chronologically
   * This enables unified EVM state across all playgrounds
   */
  const loadAllSnapshotsOrderedByTime = async () => {
    try {
      const res = await db
        .select()
        .from(snapshotSchema)
        .orderBy(asc(snapshotSchema.timestamp));

      return res;
    } catch (e) {
      throw new Error("failed to load all snapshots", {
        cause: e,
      });
    }
  };

  /**
   * Get explorer metrics for dashboard
   */
  const getExplorerMetrics = async () => {
    try {
      // Get transaction types we care about
      const transactionTypes = ["CALL_FUNCTION", "DEPLOY_CONTRACT"] as const;

      // Get total transaction count
      const transactionCountResult = await db
        .select({ count: count() })
        .from(snapshotSchema)
        .where(inArray(snapshotSchema.type, transactionTypes));

      const totalTransactions = transactionCountResult[0]?.count || 0;

      // Get average gas used (convert text to number for calculation)
      const gasMetricsResult = await db
        .select({
          avgGas: avg(sql`CAST(${snapshotSchema.gasUsed} AS INTEGER)`),
          totalGas: sum(sql`CAST(${snapshotSchema.gasUsed} AS INTEGER)`),
        })
        .from(snapshotSchema)
        .where(inArray(snapshotSchema.type, transactionTypes));

      const avgGasUsed = gasMetricsResult[0]?.avgGas || 0;
      const totalGasUsed = gasMetricsResult[0]?.totalGas || 0;

      // Get recent transactions (last 10)
      const recentTransactions = await db
        .select()
        .from(snapshotSchema)
        .where(inArray(snapshotSchema.type, transactionTypes))
        .orderBy(sql`${snapshotSchema.timestamp} DESC`)
        .limit(10);

      // Get transaction count by type
      const transactionsByType = await db
        .select({
          type: snapshotSchema.type,
          count: count(),
        })
        .from(snapshotSchema)
        .where(inArray(snapshotSchema.type, transactionTypes))
        .groupBy(snapshotSchema.type);

      return {
        totalTransactions,
        avgGasUsed: Math.round(Number(avgGasUsed)),
        totalGasUsed: Number(totalGasUsed),
        recentTransactions,
        transactionsByType,
      };
    } catch (e) {
      throw new Error("failed to get explorer metrics", {
        cause: e,
      });
    }
  };

  /**
   * Get transaction statistics for a specific time period
   */
  const getTransactionStats = async (hours: number = 24) => {
    try {
      const timeThreshold = new Date(
        Date.now() - hours * 60 * 60 * 1000,
      ).toISOString();

      const stats = await db
        .select({
          count: count(),
          avgGas: avg(sql`CAST(${snapshotSchema.gasUsed} AS INTEGER)`),
        })
        .from(snapshotSchema)
        .where(
          sql`${snapshotSchema.type} IN ('CALL_FUNCTION', 'DEPLOY_CONTRACT') AND ${snapshotSchema.timestamp} >= ${timeThreshold}`,
        );

      return {
        transactionsLast24h: stats[0]?.count || 0,
        avgGasLast24h: Math.round(Number(stats[0]?.avgGas || 0)),
      };
    } catch (e) {
      throw new Error("failed to get transaction stats", {
        cause: e,
      });
    }
  };

  return {
    create,
    loadPlaygroundSnapshot,
    loadAllSnapshotsOrderedByTime,
    getExplorerMetrics,
    getTransactionStats,
  };
};

type SnapshotRepository = ReturnType<typeof snapshotRepository>;
export default snapshotRepository;
export type { SnapshotRepository };
