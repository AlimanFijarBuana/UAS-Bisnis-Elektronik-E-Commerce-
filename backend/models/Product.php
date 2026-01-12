<?php
// file: models/Product.php

namespace app\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Product extends ActiveRecord
{
    public static function tableName()
    {
        return 'products';
    }

    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::class,
                'createdAtAttribute' => 'created_at',
                'updatedAtAttribute' => 'updated_at',
                'value' => function() { 
                    return date('Y-m-d H:i:s'); 
                },
            ],
        ];
    }

    public function rules()
    {
        return [
            [['name', 'price', 'stock', 'category_id', 'weight'], 'required'],
            [['name'], 'string', 'max' => 255],
            [['description'], 'string'],
            [['price'], 'number', 'min' => 0],
            [['stock'], 'integer', 'min' => 0],
            [['category_id', 'weight'], 'integer'],
            [['weight'], 'integer', 'min' => 1],
            [['weight'], 'default', 'value' => 500],
            [['image'], 'string', 'max' => 500],
            [['category_id'], 'exist', 'skipOnError' => true, 'targetClass' => Category::class, 'targetAttribute' => ['category_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Product Name',
            'description' => 'Description',
            'price' => 'Price',
            'stock' => 'Stock',
            'weight' => 'Weight (grams)',
            'category_id' => 'Category',
            'image' => 'Image',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getCategory()
    {
        return $this->hasOne(Category::class, ['id' => 'category_id']);
    }

    public function getCategoryName()
    {
        return $this->category ? $this->category->name : 'Unknown';
    }

    /**
     * Get weight in kilograms
     */
    public function getWeightInKg()
    {
        return $this->weight / 1000;
    }

    /**
     * Get formatted weight
     */
    public function getFormattedWeight()
    {
        if ($this->weight >= 1000) {
            return number_format($this->weight / 1000, 2) . ' kg';
        } else {
            return $this->weight . ' g';
        }
    }
}