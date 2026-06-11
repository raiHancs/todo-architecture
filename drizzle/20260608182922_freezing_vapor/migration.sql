CREATE TABLE [todos] (
	[id] uniqueidentifier,
	[title] varchar(255) NOT NULL,
	[is_completed] bit NOT NULL CONSTRAINT [todos_is_completed_default] DEFAULT ((0)),
	[position] int NOT NULL CONSTRAINT [todos_position_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [todos_created_at_default] DEFAULT (GETDATE()),
	CONSTRAINT [todos_pkey] PRIMARY KEY([id])
);
