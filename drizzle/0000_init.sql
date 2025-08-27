CREATE TABLE `playground` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`isActive` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `snapshot` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`playground_id` integer,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`playground_id`) REFERENCES `playground`(`id`) ON UPDATE no action ON DELETE no action
);
