-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `math` INTEGER NOT NULL,
    `science` INTEGER NOT NULL,
    `english` INTEGER NOT NULL,
    `total` INTEGER NULL,
    `average` DOUBLE NULL,
    `grade` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
