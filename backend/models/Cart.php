<?php
// file: models/Cart.php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Cart extends ActiveRecord
{
    public static function tableName()
    {
        return 'carts';
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
            [['user_id'], 'required'],
            [['user_id'], 'integer'],
            [['user_id'], 'unique'],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function getCartItems()
    {
        return $this->hasMany(CartItem::class, ['cart_id' => 'id']);
    }

    public function getProducts()
    {
        return $this->hasMany(Product::class, ['id' => 'product_id'])
            ->via('cartItems');
    }

    /**
     * Get total quantity of items in cart
     */
    public function getTotalQuantity()
    {
        return (int) $this->getCartItems()->sum('quantity');
    }

    /**
     * Get total price of items in cart
     */
    public function getTotalPrice()
    {
        $total = 0;
        foreach ($this->cartItems as $item) {
            $total += $item->quantity * $item->price_at_addition;
        }
        return $total;
    }

    /**
     * Find or create cart for user
     */
    public static function findOrCreate($userId)
    {
        $cart = static::findOne(['user_id' => $userId]);
        
        if (!$cart) {
            $cart = new static();
            $cart->user_id = $userId;
            if (!$cart->save()) {
                return null;
            }
        }
        
        return $cart;
    }

    /**
     * Add item to cart
     */
    public function addItem($productId, $quantity = 1)
    {
        $product = Product::findOne($productId);
        if (!$product) {
            return ['success' => false, 'message' => 'Product not found'];
        }

        if ($product->stock < $quantity) {
            return ['success' => false, 'message' => 'Insufficient stock'];
        }

        $cartItem = CartItem::findOne([
            'cart_id' => $this->id,
            'product_id' => $productId
        ]);

        if ($cartItem) {
            // Update existing item
            $newQuantity = $cartItem->quantity + $quantity;
            if ($product->stock < $newQuantity) {
                return ['success' => false, 'message' => 'Insufficient stock for additional quantity'];
            }
            $cartItem->quantity = $newQuantity;
        } else {
            // Create new item
            $cartItem = new CartItem();
            $cartItem->cart_id = $this->id;
            $cartItem->product_id = $productId;
            $cartItem->quantity = $quantity;
            $cartItem->price_at_addition = $product->price;
        }

        if ($cartItem->save()) {
            return [
                'success' => true, 
                'message' => 'Item added to cart',
                'cartItem' => $cartItem
            ];
        } else {
            return [
                'success' => false, 
                'message' => 'Failed to add item to cart',
                'errors' => $cartItem->getFirstErrors()
            ];
        }
    }

    /**
     * Remove item from cart
     */
    public function removeItem($productId)
    {
        $cartItem = CartItem::findOne([
            'cart_id' => $this->id,
            'product_id' => $productId
        ]);

        if ($cartItem && $cartItem->delete()) {
            return ['success' => true, 'message' => 'Item removed from cart'];
        } else {
            return ['success' => false, 'message' => 'Item not found in cart'];
        }
    }

    /**
     * Update item quantity
     */
    public function updateItemQuantity($productId, $quantity)
    {
        if ($quantity <= 0) {
            return $this->removeItem($productId);
        }

        $product = Product::findOne($productId);
        if (!$product) {
            return ['success' => false, 'message' => 'Product not found'];
        }

        if ($product->stock < $quantity) {
            return ['success' => false, 'message' => 'Insufficient stock'];
        }

        $cartItem = CartItem::findOne([
            'cart_id' => $this->id,
            'product_id' => $productId
        ]);

        if (!$cartItem) {
            return ['success' => false, 'message' => 'Item not found in cart'];
        }

        $cartItem->quantity = $quantity;
        if ($cartItem->save()) {
            return [
                'success' => true, 
                'message' => 'Cart updated',
                'cartItem' => $cartItem
            ];
        } else {
            return [
                'success' => false, 
                'message' => 'Failed to update cart',
                'errors' => $cartItem->getFirstErrors()
            ];
        }
    }

    /**
     * Clear all items from cart
     */
    public function clear()
    {
        CartItem::deleteAll(['cart_id' => $this->id]);
        return ['success' => true, 'message' => 'Cart cleared'];
    }
}