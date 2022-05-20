CREATE TABLE tasks (
	"id" serial PRIMARY KEY,
	"title" varchar(40),
	"description" varchar(280),
	"completed" boolean DEFAULT false,
	"due_date" date, --format YYYY-MM-DD
	"priority" integer
);

DROP TABLE tasks;

INSERT INTO tasks (title, description, due_date, priority) VALUES ('get groceries', 'apples, oranges, tuna, bread, starfruit', '2022-05-23', 2);

SELECT * FROM tasks;