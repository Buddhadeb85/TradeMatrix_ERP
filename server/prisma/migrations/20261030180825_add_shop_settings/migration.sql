-- CreateTable
CREATE TABLE `shop_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shopName` VARCHAR(191) NOT NULL DEFAULT 'My Grocery Shop',
    `tagline` VARCHAR(191) NULL DEFAULT 'Fresh & Quality Essentials',
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `gstin` VARCHAR(191) NULL,
    `receiptFooter` VARCHAR(191) NULL DEFAULT 'Thank you for shopping with us!',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `units_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
