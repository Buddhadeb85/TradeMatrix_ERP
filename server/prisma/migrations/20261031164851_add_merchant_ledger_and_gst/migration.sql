-- AlterTable
ALTER TABLE `bills` ADD COLUMN `taxAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `gstRate` DECIMAL(5, 2) NOT NULL DEFAULT 5.00;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NULL,
    `currentDue` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    UNIQUE INDEX `accounts_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_lines` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `journalEntryId` INTEGER NOT NULL,
    `accountId` INTEGER NOT NULL,
    `debit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `credit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `journal_lines` ADD CONSTRAINT `journal_lines_journalEntryId_fkey` FOREIGN KEY (`journalEntryId`) REFERENCES `journal_entries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_lines` ADD CONSTRAINT `journal_lines_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
