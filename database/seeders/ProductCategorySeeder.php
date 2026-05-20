<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductCategory;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'title' => 'CPU',
                'description' => 'Central Processing Unit',
            ],
            [
                'title' => 'GPU',
                'description' => 'Graphics Processing Unit',
            ],
            [
                'title' => 'Motherboard',
                'description' => 'Main circuit board of the computer',
            ],
            [
                'title' => 'RAM',
                'description' => 'Random Access Memory',
            ],
            [
                'title' => 'Laptop',
                'description' => 'Portable computer',
            ],
            [
                'title' => 'Peripheral',
                'description' => 'External devices like keyboard, mouse, etc.',
            ],
            [
                'title' => 'Monitor',
                'description' => 'Display screen for computer output',
            ],
            [
                'title' => 'PSU',
                'description' => 'Power Supply Unit',
            ],
            [
                'title' => 'Storage',
                'description' => 'HDD, SSD and other storage devices',
            ],
        ];

        foreach ($categories as $category) {
            ProductCategory::create($category);
        }
    }
}