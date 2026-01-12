-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 08 Jan 2026 pada 14.56
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_ecommerce`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(2, 4, '2025-10-27 03:10:28', '2025-10-27 03:10:28'),
(3, 6, '2025-10-27 03:38:24', '2025-10-27 03:38:24'),
(5, 7, '2025-10-31 06:14:21', '2025-10-31 06:14:21'),
(6, 8, '2025-12-25 14:23:59', '2025-12-25 14:23:59'),
(7, 10, '2026-01-03 12:10:14', '2026-01-03 12:10:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price_at_addition` decimal(15,2) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`, `price_at_addition`, `added_at`) VALUES
(18, 2, 1, 1, 19500000.00, '2025-10-27 17:38:39');

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `image`, `created_at`, `updated_at`) VALUES
(1, 'Laptop & PC', 'laptop-pc', '/uploads/categories/x3majBjSc2jRZK9R.jpg', '2025-10-22 15:25:55', '2025-10-24 13:16:21'),
(2, 'Mobile & Tablets', 'mobile-tablets', '/uploads/categories/SveuwqBQKQ7Xllfb.jpg', '2025-10-22 15:25:55', '2025-10-24 13:17:17'),
(3, 'Smart Home', 'smart-home', '/uploads/categories/qkmrZFX2FgufNsAk.jpg', '2025-10-22 15:25:55', '2025-10-24 13:19:50'),
(4, 'Audio & Headphones', 'audio-headphones', '/uploads/categories/Mcb6607D629UpD9Y.jpg', '2025-10-22 15:25:55', '2025-10-24 13:18:35'),
(8, 'Handphone', 'handphone', '/uploads/categories/vSULYCdImWH9N-Ji.png', '2025-10-31 13:12:15', '2025-10-31 13:12:25');

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `shipping_info` text NOT NULL,
  `payment_method` varchar(20) NOT NULL,
  `shipping_method` varchar(20) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `shipping_cost` decimal(15,2) NOT NULL,
  `total_weight` int(11) NOT NULL DEFAULT 0,
  `status` varchar(15) NOT NULL DEFAULT 'pending',
  `payment_status` varchar(15) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_number`, `shipping_info`, `payment_method`, `shipping_method`, `total_amount`, `shipping_cost`, `total_weight`, `status`, `payment_status`, `created_at`, `updated_at`) VALUES
(1, 4, 'ORD-20241027-ABC123', '{\"fullName\":\"Alisya\",\"email\":\"alisya@gmail.com\",\"phone\":\"+62123456789\",\"address\":\"Jl. Contoh No. 123\",\"city\":\"Jakarta\",\"postalCode\":\"12345\",\"notes\":\"Please deliver quickly\"}', 'bank_transfer', 'standard', 34650000.00, 15000.00, 2780, 'shipped', 'paid', '2025-10-27 15:57:54', '2025-10-27 12:53:39'),
(2, 6, 'ORD-20241027-DEF456', '{\"fullName\":\"tes123\",\"email\":\"alisya123@gmail.com\",\"phone\":\"+62123456780\",\"address\":\"Jl. Sample No. 456\",\"city\":\"Bandung\",\"postalCode\":\"54321\",\"notes\":\"\"}', 'bank_transfer', 'express', 650000.00, 35000.00, 350, 'processing', 'paid', '2025-10-27 15:57:54', '2025-10-27 15:57:54'),
(3, 4, 'ORD-20251027-FC316E', '{\"fullName\":\"Alisya\",\"email\":\"alisya@gmail.com\",\"phone\":\"+62123456789\",\"address\":\"Jl. Contoh No. 123\",\"city\":\"Jakarta\",\"postalCode\":\"12345\",\"notes\":\"Please deliver quickly\"}', 'bank_transfer', 'standard', 34815000.00, 15000.00, 2280, 'pending', 'pending', '2025-10-27 10:07:11', '2025-10-27 10:07:11'),
(4, 4, 'ORD-20251027-CA8113', '{\"fullName\":\"ALIMAN FIJAR BUANA\",\"email\":\"alimanfijar1@gmail.com\",\"phone\":\"+6285776323521\",\"address\":\"Villa Mutiara Cikarang 1 Blok G11 No 29 RT.031\\/RW.009 , Ciantra, Cikarang Selatan\",\"city\":\"BEKASI\",\"postalCode\":\"17550\",\"notes\":\"\"}', 'bank_transfer', 'standard', 165000.00, 15000.00, 500, 'pending', 'pending', '2025-10-27 10:43:24', '2025-10-27 10:43:24'),
(5, 4, 'ORD-20251027-F81CAF', '{\"fullName\":\"ALIMAN FIJAR BUANA\",\"email\":\"alimanfijar1@gmail.com\",\"phone\":\"+6285776323521\",\"address\":\"Villa Mutiara Cikarang 1 Blok G11 No 29 RT.031\\/RW.009 , Ciantra, Cikarang Selatan\",\"city\":\"BEKASI\",\"postalCode\":\"17550\",\"notes\":\"tes\"}', 'bank_transfer', 'standard', 165000.00, 15000.00, 500, 'pending', 'pending', '2025-10-27 10:55:59', '2025-10-27 10:55:59'),
(6, 4, 'ORD-20251027-920C36', '{\"fullName\":\"ALIMAN FIJAR BUANA\",\"email\":\"alimanfijar1@gmail.com\",\"phone\":\"+6285776323521\",\"address\":\"Villa Mutiara Cikarang 1 Blok G11 No 29 RT.031\\/RW.009 , Ciantra, Cikarang Selatan\",\"city\":\"BEKASI\",\"postalCode\":\"17550\",\"notes\":\"\"}', 'bank_transfer', 'standard', 165000.00, 15000.00, 500, 'pending', 'pending', '2025-10-27 11:02:01', '2025-10-27 11:02:01'),
(7, 4, 'ORD-20251027-682E23', '{\"fullName\":\"ALIMAN FIJAR BUANA\",\"email\":\"alimanfijar1@gmail.com\",\"phone\":\"+6285776323521\",\"address\":\"Villa Mutiara Cikarang 1 Blok G11 No 29 RT.031\\/RW.009 , Ciantra, Cikarang Selatan\",\"city\":\"BEKASI\",\"postalCode\":\"17550\",\"notes\":\"tes\"}', 'bank_transfer', 'standard', 19515000.00, 15000.00, 1200, 'pending', 'pending', '2025-10-27 11:05:10', '2025-10-27 11:05:10'),
(8, 4, 'ORD-20251027-72E3E4', '{\"fullName\":\"Aliman Fijar\",\"email\":\"alimanfijar1@gmail.com\",\"phone\":\"+6281311465525\",\"address\":\"Villa Mutiara Cikarang 1 Blok G11 No 29\",\"city\":\"Cikarang\",\"postalCode\":\"17550\",\"notes\":\"tes\"}', 'bank_transfer', 'standard', 19515000.00, 15000.00, 1200, 'pending', 'pending', '2025-10-27 11:10:47', '2025-10-27 11:10:47'),
(9, 4, 'ORD-20251027-764AB2', '{\"fullName\":\"ALIMAN FIJAR BUANA\",\"email\":\"alimanfijar1@gmail.com\",\"phone\":\"+6285776323521\",\"address\":\"Villa Mutiara Cikarang 1 Blok G11 No 29 RT.031\\/RW.009 , Ciantra, Cikarang Selatan\",\"city\":\"BEKASI\",\"postalCode\":\"17550\",\"notes\":\"tes\"}', 'bank_transfer', 'standard', 19515000.00, 15000.00, 1200, 'pending', 'pending', '2025-10-27 11:18:31', '2025-10-27 11:18:31'),
(10, 4, 'ORD-20251027-2466C3', '{\"fullName\":\"ALIMAN FIJAR BUANA\",\"email\":\"alimanfijar1@gmail.com\",\"phone\":\"+6285776323521\",\"address\":\"Villa Mutiara Cikarang 1 Blok G11 No 29 RT.031\\/RW.009 , Ciantra, Cikarang Selatan\",\"city\":\"BEKASI\",\"postalCode\":\"17550\",\"notes\":\"\"}', 'bank_transfer', 'standard', 19515000.00, 15000.00, 1200, 'pending', 'pending', '2025-10-27 11:20:34', '2025-10-27 11:20:34'),
(11, 7, 'ORD-20251031-4BC79A', '{\"fullName\":\"Aliman\",\"email\":\"alimanfijar1@gmail.com\",\"phone\":\"+6281311465525\",\"address\":\"Villa Mutiara Cikarang 1 Blok G11 No 29\",\"city\":\"Cikarang\",\"postalCode\":\"17550\",\"notes\":\"\"}', 'bank_transfer', 'express', 4035000.00, 35000.00, 2000, 'shipped', 'paid', '2025-10-31 06:17:08', '2026-01-03 12:04:32'),
(12, 10, 'ORD-20260103-456BFA', '{\"fullName\":\"ALIMAN FIJAR BUANA\",\"email\":\"alimanfijar1@gmail.com\",\"phone\":\"+6285776323521\",\"address\":\"Villa Mutiara Cikarang 1 Blok G11 No 29 RT.031\\/RW.009 , Ciantra, Cikarang Selatan\",\"city\":\"BEKASI\",\"postalCode\":\"123\",\"notes\":\"\"}', 'bank_transfer', 'same_day', 19575000.00, 75000.00, 1200, 'processing', 'paid', '2026-01-03 12:11:00', '2026-01-03 12:14:57'),
(13, 10, 'ORD-20260103-6A10F7', '{\"fullName\":\"ALIMAN FIJAR BUANA\",\"email\":\"alimanfijar1@gmail.com\",\"phone\":\"+6285776323521\",\"address\":\"Villa Mutiara Cikarang 1 Blok G11 No 29 RT.031\\/RW.009 , Ciantra, Cikarang Selatan\",\"city\":\"BEKASI\",\"postalCode\":\"124\",\"notes\":\"\"}', 'bank_transfer', 'standard', 2015000.00, 15000.00, 1000, 'pending', 'pending', '2026-01-03 14:01:26', '2026-01-03 14:01:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `weight` int(11) NOT NULL DEFAULT 0,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `weight`, `product_name`, `product_image`, `created_at`) VALUES
(1, 1, 1, 1, 19500000.00, 1200, 'MacBook Air M4', 'http://localhost:8080/uploads/YdzzZk_zrsuACYWKyHsnTCbskAPe3D2C.jpg', '2025-10-27 15:57:54'),
(2, 1, 2, 1, 14500000.00, 230, 'Samsung S24 Ultra', '/uploads/Q1N0WZjveZSznukhrLkiEvbjz9E9trnM.jpg', '2025-10-27 15:57:54'),
(3, 1, 3, 1, 650000.00, 350, 'Smart Security Cam', '/uploads/K7U3vlJ4mdj8LDp8nTM-Xi1ZMsWrTYjj.jpg', '2025-10-27 15:57:54'),
(4, 2, 3, 1, 650000.00, 350, 'Smart Security Cam', '/uploads/K7U3vlJ4mdj8LDp8nTM-Xi1ZMsWrTYjj.jpg', '2025-10-27 15:57:54'),
(5, 3, 2, 1, 14500000.00, 230, 'Samsung S24 Ultra', '/uploads/Q1N0WZjveZSznukhrLkiEvbjz9E9trnM.jpg', '2025-10-27 10:07:11'),
(6, 3, 1, 1, 19500000.00, 1200, 'MacBook Air M4', 'http://localhost:8080/uploads/YdzzZk_zrsuACYWKyHsnTCbskAPe3D2C.jpg', '2025-10-27 10:07:11'),
(7, 3, 3, 1, 650000.00, 350, 'Smart Security Cam', '/uploads/K7U3vlJ4mdj8LDp8nTM-Xi1ZMsWrTYjj.jpg', '2025-10-27 10:07:11'),
(12, 7, 1, 1, 19500000.00, 1200, 'MacBook Air M4', 'http://localhost:8080/uploads/YdzzZk_zrsuACYWKyHsnTCbskAPe3D2C.jpg', '2025-10-27 11:05:10'),
(13, 8, 1, 1, 19500000.00, 1200, 'MacBook Air M4', 'http://localhost:8080/uploads/YdzzZk_zrsuACYWKyHsnTCbskAPe3D2C.jpg', '2025-10-27 11:10:47'),
(14, 9, 1, 1, 19500000.00, 1200, 'MacBook Air M4', 'http://localhost:8080/uploads/YdzzZk_zrsuACYWKyHsnTCbskAPe3D2C.jpg', '2025-10-27 11:18:31'),
(15, 10, 1, 1, 19500000.00, 1200, 'MacBook Air M4', 'http://localhost:8080/uploads/YdzzZk_zrsuACYWKyHsnTCbskAPe3D2C.jpg', '2025-10-27 11:20:34'),
(16, 11, 13, 2, 2000000.00, 1000, 'Xiaomi 10', '/uploads/jkgG40otym4PUdxVevR2BXQRrOnKqFx8.png', '2025-10-31 06:17:08'),
(17, 12, 1, 1, 19500000.00, 1200, 'MacBook Air M4', 'http://localhost:8080/uploads/ByuWgm0_iuXj6YdeveYxDtz8eF5KJ6NV.jpg', '2026-01-03 12:11:00'),
(18, 13, 13, 1, 2000000.00, 1000, 'Xiaomi 10', '/uploads/jkgG40otym4PUdxVevR2BXQRrOnKqFx8.png', '2026-01-03 14:01:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `weight` int(11) NOT NULL DEFAULT 500,
  `category_id` int(11) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `weight`, `category_id`, `image`, `created_at`, `updated_at`) VALUES
(1, 'MacBook Air M4', 'Laptop ultra-ringan dengan chip M4 terbaru untuk performa grafis dan AI yang superior.', 19500000.00, 44, 1200, 1, 'http://localhost:8080/uploads/ByuWgm0_iuXj6YdeveYxDtz8eF5KJ6NV.jpg', '2025-10-22 15:25:55', '2026-01-03 19:11:00'),
(2, 'Samsung S24 Ultra', 'Smartphone premium dengan kamera 200MP dan fitur AI canggih.', 14500000.00, 119, 230, 2, '/uploads/Q1N0WZjveZSznukhrLkiEvbjz9E9trnM.jpg', '2025-10-22 15:25:55', '2025-10-27 17:07:11'),
(3, 'Smart Security Cam', 'Kamera keamanan nirkabel 4K untuk pemantauan rumah 24 jam.', 650000.00, 29, 350, 3, '/uploads/K7U3vlJ4mdj8LDp8nTM-Xi1ZMsWrTYjj.jpg', '2025-10-22 15:25:55', '2025-10-27 17:07:11'),
(4, 'Wireless Earbuds Pro', 'Earbuds nirkabel dengan noise cancellation dan battery life 30 jam.', 850000.00, 75, 50, 4, '/uploads/_2YWG9ErWorxKoUNeOYIekJyJ0r_Hi2i.jpg', '2025-10-22 15:25:55', '2025-10-24 13:14:17'),
(13, 'Xiaomi 10', 'Tes', 2000000.00, 97, 1000, 2, '/uploads/jkgG40otym4PUdxVevR2BXQRrOnKqFx8.png', '2025-10-31 13:11:27', '2026-01-03 21:01:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `access_token`, `role`, `created_at`) VALUES
(4, 'Alisya', 'alisya@gmail.com', '$2y$13$fo55doSYvCqev4GNiapGHeZdZcee5yyalCnfgMbC8ULbOhCLBR6FK', 'uOjUFJGWyrmqLi57hKd-A1J4vUMfm3m7mkpr-km9a5LevfjM5-ob1eby8YcHzrxR', 'user', '2025-10-22 04:02:03'),
(5, 'Alisyae', 'alisya12@gmail.com', '$2y$13$A0llN10NHPRNSAms0gUG2OH7ZID6BGdeswvHcVWV6l79bxdblH/se', 'QEqlsh5Fcis7iPipP1d63DmwJB53lAxblnj8HUEIlN7J_waPaAeHU51kfWvzb46m', 'user', '2025-10-23 11:39:06'),
(6, 'tes123', 'alisya123@gmail.com', '$2y$13$KK/ti3MstqiZtFRf08sJ2.P1jjupdK4pHnoJywbjEM.OejEDzw1f2', '6LBt4Fq0he8Y20naEVnik1ng9LEPcg_-njnGOPRkSyXWkKItp4dPwTsS_-laWGxS', 'user', '2025-10-24 02:50:05'),
(7, 'Aliman12', 'alimanfijar3@gmail.com', '$2y$13$jeaR2tKncwgscRe/axen/O6eGDrWfre13/6WZL4wpwtbARwzXY85K', 'qSe26oEq3RAj8iJcmbLawXdVtH9NQAXGe1BcDMDwBB5q1JxdPkryKIC5qe0D1kX_', 'user', '2025-10-31 06:09:15'),
(8, 'Aliman4', 'alimanfijar9@gmail.com', '$2y$13$GJKuWZnbYn7jMNF.8sBoyOMr2lubvIPBYD6axoeudQ6lCi49HbZZG', 'P_9JHrb13gs3I-E6mI-EOSuKkG-HqJ_5fh44rQ1l0t5GGvfLajuXCfV4QEsNq_85', 'admin', '2025-12-25 14:17:07'),
(9, 'Aliman', 'nana@gmail.com', '$2y$13$ZHYvhHK9jG4tZHg6B2KGKu58kng0hNChDF/UZcYxLZsroWc1hxIIe', 'Y3fDVt-9jkZiGLQ3nD3gAqeI35gwH7gralFAry20b6H6B-ZZsiWYfucO_DCUAxFN', 'admin', '2026-01-03 11:59:58'),
(10, 'user', 'user@gmail.com', '$2y$13$OOs7IGD4Ctw4gPygPxaFS.SVgAeY7W7ubaDdenUjkHcGEXu94rML.', 'QCMQh1BkUDWJ4qXuSaJQ73xc6oNDjoBb1FSt3AOTLp-pBbojD1k48kq6D_P6Eb5S', 'user', '2026-01-03 12:08:49');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uc_cart_product` (`cart_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_weight` (`weight`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
