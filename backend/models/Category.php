<?php
// file: models/Category.php

namespace app\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Category extends ActiveRecord
{
    public static function tableName()
    {
        return 'categories';
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
            [['name', 'slug'], 'required'],
            [['name', 'slug'], 'string', 'max' => 255],
            ['slug', 'unique'],
            [['image'], 'string', 'max' => 500],
        ];
    }

    public function getProducts()
    {
        return $this->hasMany(Product::class, ['category_id' => 'id']);
    }

    public function getProductsCount()
    {
        return $this->getProducts()->count();
    }
}