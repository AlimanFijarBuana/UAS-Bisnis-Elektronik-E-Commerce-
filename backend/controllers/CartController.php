<?php
// file: controllers/CartController.php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use yii\filters\auth\HttpBearerAuth;
use app\models\Cart;
use app\models\CartItem;

class CartController extends Controller
{
    public $enableCsrfValidation = false;

    public function init()
    {
        parent::init();
        Yii::$app->response->format = Response::FORMAT_JSON;
    }

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        
        // CORS configuration
        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:3000', 'http://localhost:5173'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
            ],
        ];

        // Authentication for all actions
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'except' => ['options'],
        ];

        return $behaviors;
    }

    public function actions()
    {
        return [
            'options' => [
                'class' => 'yii\rest\OptionsAction',
            ],
        ];
    }

    /**
     * GET /cart - Get user's cart with items
     */
    public function actionIndex()
    {
        try {
            $userId = Yii::$app->user->identity->id;
            $cart = Cart::findOrCreate($userId);

            if (!$cart) {
                Yii::$app->response->statusCode = 500;
                return ['success' => false, 'message' => 'Failed to create cart'];
            }

            $cartItems = CartItem::find()
                ->where(['cart_id' => $cart->id])
                ->with(['product'])
                ->asArray()
                ->all();

            // Format response dengan informasi produk
            $formattedItems = array_map(function($item) {
                $baseUrl = Yii::$app->request->hostInfo;
                $imageUrl = $item['product']['image'] ? 
                    (str_starts_with($item['product']['image'], 'http') ? 
                        $item['product']['image'] : $baseUrl . $item['product']['image']) : null;

                return [
                    'id' => $item['id'],
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price_at_addition' => (float)$item['price_at_addition'],
                    'added_at' => $item['added_at'],
                    'product' => [
                        'id' => $item['product']['id'],
                        'name' => $item['product']['name'],
                        'price' => (float)$item['product']['price'],
                        'image' => $imageUrl,
                        'stock' => $item['product']['stock']
                    ],
                    'total_price' => (float)($item['quantity'] * $item['price_at_addition'])
                ];
            }, $cartItems);

            return [
                'success' => true,
                'cart' => [
                    'id' => $cart->id,
                    'user_id' => $cart->user_id,
                    'total_quantity' => $cart->getTotalQuantity(),
                    'total_price' => (float)$cart->getTotalPrice(),
                    'items' => $formattedItems
                ]
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to fetch cart: ' . $e->getMessage()];
        }
    }

    /**
     * POST /cart/add - Add item to cart
     */
    public function actionAdd()
    {
        try {
            $userId = Yii::$app->user->identity->id;
            $cart = Cart::findOrCreate($userId);

            if (!$cart) {
                Yii::$app->response->statusCode = 500;
                return ['success' => false, 'message' => 'Failed to create cart'];
            }

            $productId = Yii::$app->request->post('product_id');
            $quantity = Yii::$app->request->post('quantity', 1);

            if (empty($productId)) {
                Yii::$app->response->statusCode = 400;
                return ['success' => false, 'message' => 'Product ID is required'];
            }

            $result = $cart->addItem($productId, $quantity);

            if ($result['success']) {
                return [
                    'success' => true,
                    'message' => $result['message'],
                    'cart' => [
                        'total_quantity' => $cart->getTotalQuantity(),
                        'total_price' => (float)$cart->getTotalPrice()
                    ]
                ];
            } else {
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => $result['message'],
                    'errors' => $result['errors'] ?? null
                ];
            }
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to add item to cart: ' . $e->getMessage()];
        }
    }

    /**
     * PUT /cart/update - Update item quantity in cart
     */
    public function actionUpdate()
    {
        try {
            $userId = Yii::$app->user->identity->id;
            $cart = Cart::findOne(['user_id' => $userId]);

            if (!$cart) {
                Yii::$app->response->statusCode = 404;
                return ['success' => false, 'message' => 'Cart not found'];
            }

            $productId = Yii::$app->request->getBodyParam('product_id');
            $quantity = Yii::$app->request->getBodyParam('quantity');

            if (empty($productId) || empty($quantity)) {
                Yii::$app->response->statusCode = 400;
                return ['success' => false, 'message' => 'Product ID and quantity are required'];
            }

            $result = $cart->updateItemQuantity($productId, $quantity);

            if ($result['success']) {
                return [
                    'success' => true,
                    'message' => $result['message'],
                    'cart' => [
                        'total_quantity' => $cart->getTotalQuantity(),
                        'total_price' => (float)$cart->getTotalPrice()
                    ]
                ];
            } else {
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => $result['message'],
                    'errors' => $result['errors'] ?? null
                ];
            }
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to update cart: ' . $e->getMessage()];
        }
    }

    /**
     * DELETE /cart/remove - Remove item from cart
     */
    public function actionRemove()
    {
        try {
            $userId = Yii::$app->user->identity->id;
            $cart = Cart::findOne(['user_id' => $userId]);

            if (!$cart) {
                Yii::$app->response->statusCode = 404;
                return ['success' => false, 'message' => 'Cart not found'];
            }

            $productId = Yii::$app->request->getBodyParam('product_id');

            if (empty($productId)) {
                Yii::$app->response->statusCode = 400;
                return ['success' => false, 'message' => 'Product ID is required'];
            }

            $result = $cart->removeItem($productId);

            if ($result['success']) {
                return [
                    'success' => true,
                    'message' => $result['message'],
                    'cart' => [
                        'total_quantity' => $cart->getTotalQuantity(),
                        'total_price' => (float)$cart->getTotalPrice()
                    ]
                ];
            } else {
                Yii::$app->response->statusCode = 400;
                return ['success' => false, 'message' => $result['message']];
            }
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to remove item from cart: ' . $e->getMessage()];
        }
    }

    /**
     * DELETE /cart/clear - Clear all items from cart
     */
    public function actionClear()
    {
        try {
            $userId = Yii::$app->user->identity->id;
            $cart = Cart::findOne(['user_id' => $userId]);

            if (!$cart) {
                Yii::$app->response->statusCode = 404;
                return ['success' => false, 'message' => 'Cart not found'];
            }

            $result = $cart->clear();

            if ($result['success']) {
                return [
                    'success' => true,
                    'message' => $result['message'],
                    'cart' => [
                        'total_quantity' => 0,
                        'total_price' => 0
                    ]
                ];
            } else {
                Yii::$app->response->statusCode = 500;
                return ['success' => false, 'message' => 'Failed to clear cart'];
            }
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to clear cart: ' . $e->getMessage()];
        }
    }

    /**
     * GET /cart/count - Get cart items count
     */
    public function actionCount()
    {
        try {
            $userId = Yii::$app->user->identity->id;
            $cart = Cart::findOne(['user_id' => $userId]);

            $totalQuantity = $cart ? $cart->getTotalQuantity() : 0;

            return [
                'success' => true,
                'count' => $totalQuantity
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to get cart count: ' . $e->getMessage()];
        }
    }
}