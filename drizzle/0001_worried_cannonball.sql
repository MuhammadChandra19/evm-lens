PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_snapshot` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`playground_id` integer,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`playground_id`) REFERENCES `playground`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_snapshot`("id", "type", "playground_id", "timestamp", "payload") SELECT "id", "type", "playground_id", "timestamp", "payload" FROM `snapshot`;--> statement-breakpoint
DROP TABLE `snapshot`;--> statement-breakpoint
ALTER TABLE `__new_snapshot` RENAME TO `snapshot`;--> statement-breakpoint
PRAGMA foreign_keys=ON;