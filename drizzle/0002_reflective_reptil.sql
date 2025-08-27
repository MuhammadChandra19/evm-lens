PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_playground` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`isActive` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_playground`("id", "name", "isActive", "created_at") SELECT "id", "name", "isActive", "created_at" FROM `playground`;--> statement-breakpoint
DROP TABLE `playground`;--> statement-breakpoint
ALTER TABLE `__new_playground` RENAME TO `playground`;--> statement-breakpoint
PRAGMA foreign_keys=ON;