--create table
CREATE TABLE tasks (
	"id" serial PRIMARY KEY,
	"title" varchar(40),
	"description" varchar(280),
	"due_date" date, --format YYYY-MM-DD
	"priority" integer,
    "completed" boolean DEFAULT false,
    "time_completed" timestamp --format YYYY-MM-DD HH:MI:SS
);
--delete table to start fresh
DROP TABLE tasks;
--insert values
INSERT INTO tasks (title, description, due_date, priority) VALUES ('Pick Up Groceries', 'apples, oranges, tuna, bread, starfruit', '2022-05-23', 2);
--get table values
SELECT * FROM tasks ORDER BY id ASC;
--delete task from table
DELETE FROM tasks WHERE id = 1;
--set task as completed by fliping the bool and record time_completed
UPDATE tasks SET completed = NOT completed, time_completed = '2022-05-23 10:10:10' WHERE id = 2;
--update task data based on id
UPDATE tasks SET title = 'Santa Fe', description = 'desc', due_date = '2022-05-23', priority = 3 WHERE id = 1;