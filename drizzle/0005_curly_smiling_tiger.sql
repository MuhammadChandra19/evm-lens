CREATE TABLE `clear_control` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer NOT NULL,
	`cleared_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`tables_cleared` text NOT NULL
);
