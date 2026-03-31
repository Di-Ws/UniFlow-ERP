/*
  Warnings:

  - You are about to drop the column `age` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `Student` table. All the data in the column will be lost.
  - Added the required column `english` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `math` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `science` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "math" INTEGER NOT NULL,
    "science" INTEGER NOT NULL,
    "english" INTEGER NOT NULL
);
INSERT INTO "new_Student" ("id", "name") SELECT "id", "name" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
