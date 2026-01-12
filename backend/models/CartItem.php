<?php
// file: models/CartItem.php

namespace app\models;

use yii\db\ActiveRecord;

class CartItem extends ActiveRecord
{
    public static function tableName()
    {
        return 'cart_items';
    }

    public function rules()
    {
        return [
            [['cart_id', 'product_id', 'quantity', 'price_at_addition'], 'required'],
            [['cart_id', 'product_id', 'quantity'], 'integer'],
            [['price_at_addition'], 'number', 'min' => 0],
            [['quantity'], 'integer', 'min' => 1],
            [['cart_id'], 'exist', 'skipOnError' => true, 'targetClass' => Cart::class, 'targetAttribute' => ['cart_id' => 'id']],
            [['product_id'], 'exist', 'skipOnError' => true, 'targetClass' => Product::class, 'targetAttribute' => ['product_id' => 'id']],
        ];
    }

    public function getCart()
    {
        return $this->hasOne(Cart::class, ['id' => 'cart_id']);
    }

    public function getProduct()
    {
        return $this->hasOne(Product::class, ['id' => 'product_id']);
    }

    /**
     * Get total price for this item
     */
    public function getTotalPrice()
    {
        return $this->quantity * $this->price_at_addition;
    }

    /**
     * Before save, validate stock availability
     */
    public function beforeSave($insert)
    {
        if (!parent::beforeSave($insert)) {
            return false;
        }

        if ($this->product && $this->quantity > $this->product->stock) {
            $this->addError('quantity', 'Insufficient stock');
            return false;
        }

        return true;
    }
}