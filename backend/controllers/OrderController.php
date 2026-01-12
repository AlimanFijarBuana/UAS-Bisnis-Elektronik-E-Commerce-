<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use yii\filters\auth\HttpBearerAuth;
use app\models\Order;
use app\models\OrderItem;
use app\models\Cart;
use app\models\CartItem;
use app\models\Product;
use app\models\User;

class OrderController extends Controller
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
        
        // CORS configuration - SAMA PERSIS dengan CartController
        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:3000', 'http://localhost:5173'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
            ],
        ];

        // Authentication for all actions - SAMA PERSIS dengan CartController
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
     * 🎯 GET /order/admin-list - Get all orders for admin
     */
    public function actionAdminList()
    {
        $currentUser = Yii::$app->user->identity;

        // Check if user is admin
        if ($currentUser->role !== 'admin') {
            Yii::$app->response->statusCode = 403;
            return [
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ];
        }

        try {
            $orders = Order::find()
                ->with(['user', 'orderItems'])
                ->orderBy(['created_at' => SORT_DESC])
                ->all();

            $orderData = [];
            foreach ($orders as $order) {
                $orderData[] = [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'user' => [
                        'id' => $order->user->id,
                        'email' => $order->user->email,
                        'username' => $order->user->username
                    ],
                    'total_amount' => (float) $order->total_amount,
                    'shipping_cost' => (float) $order->shipping_cost,
                    'subtotal_amount' => (float) ($order->total_amount - $order->shipping_cost),
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method,
                    'shipping_method' => $order->shipping_method,
                    'total_weight' => $order->total_weight,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'shipping_info' => $order->getShippingInfoArray(),
                    'items_count' => count($order->orderItems),
                    'items' => array_map(function($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product_name,
                            'product_image' => $item->product_image,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                            'weight' => $item->weight,
                            'total' => (float) ($item->price * $item->quantity)
                        ];
                    }, $order->orderItems)
                ];
            }

            Yii::info("Admin orders list retrieved by user: {$currentUser->id}", 'order');

            return [
                'success' => true,
                'orders' => $orderData
            ];

        } catch (\Exception $e) {
            Yii::error('Admin orders list error: ' . $e->getMessage(), 'order');
            Yii::$app->response->statusCode = 500;
            return [
                'success' => false,
                'message' => 'Failed to retrieve admin orders: ' . $e->getMessage()
            ];
        }
    }

    /**
     * 🎯 GET /order/admin-view/<id> - Get order details for admin
     */
    public function actionAdminView($id)
    {
        $currentUser = Yii::$app->user->identity;

        // Check if user is admin
        if ($currentUser->role !== 'admin') {
            Yii::$app->response->statusCode = 403;
            return [
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ];
        }

        try {
            $order = Order::find()
                ->where(['id' => $id])
                ->with(['user', 'orderItems'])
                ->one();

            if (!$order) {
                Yii::$app->response->statusCode = 404;
                return [
                    'success' => false,
                    'message' => 'Order not found'
                ];
            }

            $items = [];
            foreach ($order->orderItems as $orderItem) {
                $items[] = [
                    'id' => $orderItem->id,
                    'product_id' => $orderItem->product_id,
                    'product_name' => $orderItem->product_name,
                    'product_image' => $orderItem->product_image,
                    'quantity' => $orderItem->quantity,
                    'price' => (float) $orderItem->price,
                    'weight' => $orderItem->weight,
                    'total' => (float) ($orderItem->price * $orderItem->quantity)
                ];
            }

            Yii::info("Admin order view for order: {$order->order_number} by user: {$currentUser->id}", 'order');

            return [
                'success' => true,
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'user' => [
                        'id' => $order->user->id,
                        'email' => $order->user->email,
                        'username' => $order->user->username
                    ],
                    'shipping_info' => $order->getShippingInfoArray(),
                    'payment_method' => $order->payment_method,
                    'shipping_method' => $order->shipping_method,
                    'total_amount' => (float) $order->total_amount,
                    'shipping_cost' => (float) $order->shipping_cost,
                    'subtotal_amount' => (float) ($order->total_amount - $order->shipping_cost),
                    'total_weight' => $order->total_weight,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'items' => $items,
                    'notes' => $order->notes ?? '' // Jika ada field notes
                ]
            ];

        } catch (\Exception $e) {
            Yii::error('Admin order view error: ' . $e->getMessage(), 'order');
            Yii::$app->response->statusCode = 500;
            return [
                'success' => false,
                'message' => 'Failed to retrieve order details: ' . $e->getMessage()
            ];
        }
    }

    /**
     * 🎯 POST /order/admin-update/<id> - Update order for admin
     */
    public function actionAdminUpdate($id)
    {
        $currentUser = Yii::$app->user->identity;

        // Check if user is admin
        if ($currentUser->role !== 'admin') {
            Yii::$app->response->statusCode = 403;
            return [
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ];
        }

        try {
            $request = Yii::$app->request;
            $data = $request->post();

            Yii::info('Admin order update request received', 'order');
            Yii::info('Order ID: ' . $id, 'order');
            Yii::info('User: ' . $currentUser->id, 'order');
            Yii::info('Request data: ' . json_encode($data), 'order');

            // Find order
            $order = Order::findOne($id);
            if (!$order) {
                Yii::$app->response->statusCode = 404;
                return [
                    'success' => false,
                    'message' => 'Order not found'
                ];
            }

            // Validate allowed statuses
            $allowedStatuses = [Order::STATUS_PENDING, Order::STATUS_PROCESSING, Order::STATUS_SHIPPED, Order::STATUS_DELIVERED, Order::STATUS_CANCELLED];
            $allowedPaymentStatuses = [Order::PAYMENT_STATUS_PENDING, Order::PAYMENT_STATUS_PAID, Order::PAYMENT_STATUS_FAILED];

            // Update fields if provided
            if (isset($data['status']) && in_array($data['status'], $allowedStatuses)) {
                $order->status = $data['status'];
            }

            if (isset($data['payment_status']) && in_array($data['payment_status'], $allowedPaymentStatuses)) {
                $order->payment_status = $data['payment_status'];
            }

            // Update timestamp
            $order->updated_at = date('Y-m-d H:i:s');

            if ($order->save()) {
                Yii::info("Admin updated order {$order->order_number}: status={$order->status}, payment_status={$order->payment_status}", 'order');
                
                return [
                    'success' => true,
                    'message' => 'Order updated successfully',
                    'order' => [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status,
                        'payment_status' => $order->payment_status,
                        'updated_at' => $order->updated_at
                    ]
                ];
            } else {
                Yii::error('Failed to update order: ' . json_encode($order->errors), 'order');
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => 'Failed to update order',
                    'errors' => $order->errors
                ];
            }

        } catch (\Exception $e) {
            Yii::error('Admin order update error: ' . $e->getMessage(), 'order');
            Yii::$app->response->statusCode = 500;
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * POST /order/place - Place new order
     */
    public function actionPlace()
    {
        $user = Yii::$app->user->identity;
        
        try {
            $request = Yii::$app->request;
            $data = $request->post();

            // LOG untuk debug
            Yii::info('Order place request received', 'order');
            Yii::info('User: ' . $user->id, 'order');
            Yii::info('Request data: ' . json_encode($data), 'order');

            // Validate required fields
            $requiredFields = ['shipping_info', 'payment_method', 'shipping_method'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    Yii::$app->response->statusCode = 400;
                    return [
                        'success' => false,
                        'message' => "Field {$field} is required"
                    ];
                }
            }

            // Get user's cart
            $cart = Cart::find()->where(['user_id' => $user->id])->one();
            if (!$cart || !$cart->cartItems) {
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => 'Cart is empty'
                ];
            }

            // Start transaction
            $transaction = Yii::$app->db->beginTransaction();

            try {
                // Calculate totals
                $subtotal = 0;
                $totalWeight = 0;
                $cartItems = [];

                foreach ($cart->cartItems as $cartItem) {
                    $product = $cartItem->product;
                    if (!$product) {
                        throw new \Exception("Product not found: {$cartItem->product_id}");
                    }

                    // Check stock
                    if ($product->stock < $cartItem->quantity) {
                        throw new \Exception("Insufficient stock for {$product->name}. Available: {$product->stock}, Requested: {$cartItem->quantity}");
                    }

                    $itemTotal = $cartItem->price_at_addition * $cartItem->quantity;
                    $itemWeight = $product->weight * $cartItem->quantity;

                    $subtotal += $itemTotal;
                    $totalWeight += $itemWeight;

                    $cartItems[] = [
                        'cart_item' => $cartItem,
                        'product' => $product,
                        'total' => $itemTotal,
                        'weight' => $itemWeight
                    ];
                }

                // Get shipping cost
                $shippingCost = $this->getShippingCost($data['shipping_method'], $totalWeight);
                $totalAmount = $subtotal + $shippingCost;

                // Create order
                $order = new Order();
                $order->user_id = $user->id;
                $order->order_number = Order::generateOrderNumber();
                $order->shipping_info = json_encode($data['shipping_info']);
                $order->payment_method = $data['payment_method'];
                $order->shipping_method = $data['shipping_method'];
                $order->total_amount = $totalAmount;
                $order->shipping_cost = $shippingCost;
                $order->total_weight = $totalWeight;
                $order->status = Order::STATUS_PENDING;
                $order->payment_status = Order::PAYMENT_STATUS_PENDING;

                if (!$order->save()) {
                    throw new \Exception('Failed to create order: ' . json_encode($order->errors));
                }

                // Create order items and update product stock
                foreach ($cartItems as $itemData) {
                    $cartItem = $itemData['cart_item'];
                    $product = $itemData['product'];

                    // Create order item
                    $orderItem = new OrderItem();
                    $orderItem->order_id = $order->id;
                    $orderItem->product_id = $product->id;
                    $orderItem->quantity = $cartItem->quantity;
                    $orderItem->price = $cartItem->price_at_addition;
                    $orderItem->weight = $product->weight;
                    $orderItem->product_name = $product->name;
                    $orderItem->product_image = $product->image;

                    if (!$orderItem->save()) {
                        throw new \Exception('Failed to create order item: ' . json_encode($orderItem->errors));
                    }

                    // Update product stock
                    $product->stock -= $cartItem->quantity;
                    if (!$product->save()) {
                        throw new \Exception('Failed to update product stock: ' . json_encode($product->errors));
                    }
                }

                // Clear cart
                CartItem::deleteAll(['cart_id' => $cart->id]);

                $transaction->commit();

                Yii::info("Order placed successfully: {$order->order_number}", 'order');

                return [
                    'success' => true,
                    'message' => 'Order placed successfully',
                    'order' => [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'total_amount' => $order->total_amount,
                        'status' => $order->status,
                        'payment_status' => $order->payment_status
                    ]
                ];

            } catch (\Exception $e) {
                $transaction->rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            Yii::error('Order placement error: ' . $e->getMessage(), 'order');
            Yii::$app->response->statusCode = 500;
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * GET /order/list - Get user's orders
     */
    public function actionList()
    {
        $user = Yii::$app->user->identity;

        $orders = Order::find()
            ->where(['user_id' => $user->id])
            ->orderBy(['created_at' => SORT_DESC])
            ->all();

        $orderData = [];
        foreach ($orders as $order) {
            $orderData[] = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'created_at' => $order->created_at,
                'shipping_info' => $order->getShippingInfoArray(),
                'items_count' => count($order->orderItems)
            ];
        }

        return [
            'success' => true,
            'orders' => $orderData
        ];
    }

    /**
     * GET /order/view/<id> - Get order details
     */
    public function actionView($id)
    {
        $user = Yii::$app->user->identity;

        $order = Order::find()
            ->where(['id' => $id, 'user_id' => $user->id])
            ->with('orderItems.product')
            ->one();

        if (!$order) {
            Yii::$app->response->statusCode = 404;
            return [
                'success' => false,
                'message' => 'Order not found'
            ];
        }

        $items = [];
        foreach ($order->orderItems as $orderItem) {
            $items[] = [
                'id' => $orderItem->id,
                'product_id' => $orderItem->product_id,
                'product_name' => $orderItem->product_name,
                'product_image' => $orderItem->product_image,
                'quantity' => $orderItem->quantity,
                'price' => $orderItem->price,
                'weight' => $orderItem->weight,
                'total' => $orderItem->price * $orderItem->quantity
            ];
        }

        return [
            'success' => true,
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'shipping_info' => $order->getShippingInfoArray(),
                'payment_method' => $order->payment_method,
                'shipping_method' => $order->shipping_method,
                'total_amount' => $order->total_amount,
                'shipping_cost' => $order->shipping_cost,
                'total_weight' => $order->total_weight,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'created_at' => $order->created_at,
                'items' => $items
            ]
        ];
    }

    /**
     * POST /order/update-payment/<id> - Update payment status
     */
    public function actionUpdatePayment($id)
    {
        $user = Yii::$app->user->identity;

        try {
            $request = Yii::$app->request;
            $data = $request->post();

            Yii::info('Update payment request received', 'order');
            Yii::info('Order ID: ' . $id, 'order');
            Yii::info('User: ' . $user->id, 'order');
            Yii::info('Request data: ' . json_encode($data), 'order');

            // Validate required fields
            if (empty($data['payment_status'])) {
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => "Payment status is required"
                ];
            }

            // Validate payment status value
            $allowedStatuses = [Order::PAYMENT_STATUS_PENDING, Order::PAYMENT_STATUS_PAID, Order::PAYMENT_STATUS_FAILED];
            if (!in_array($data['payment_status'], $allowedStatuses)) {
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => "Invalid payment status. Allowed values: " . implode(', ', $allowedStatuses)
                ];
            }

            // Find order
            $order = Order::find()
                ->where(['id' => $id, 'user_id' => $user->id])
                ->one();

            if (!$order) {
                Yii::$app->response->statusCode = 404;
                return [
                    'success' => false,
                    'message' => 'Order not found'
                ];
            }

            // Update payment status
            $order->payment_status = $data['payment_status'];
            $order->updated_at = date('Y-m-d H:i:s');

            // Jika status pembayaran menjadi paid, update order status menjadi processing
            if ($data['payment_status'] === Order::PAYMENT_STATUS_PAID && $order->status === Order::STATUS_PENDING) {
                $order->status = Order::STATUS_PROCESSING;
                Yii::info("Order status updated to processing for order: {$order->order_number}", 'order');
            }

            if ($order->save()) {
                Yii::info("Payment status updated for order {$order->order_number}: {$order->payment_status}", 'order');
                
                return [
                    'success' => true,
                    'message' => 'Payment status updated successfully',
                    'order' => [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'payment_status' => $order->payment_status,
                        'status' => $order->status
                    ]
                ];
            } else {
                Yii::error('Failed to update payment status: ' . json_encode($order->errors), 'order');
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => 'Failed to update payment status',
                    'errors' => $order->errors
                ];
            }

        } catch (\Exception $e) {
            Yii::error('Update payment status error: ' . $e->getMessage(), 'order');
            Yii::$app->response->statusCode = 500;
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * POST /order/cancel/<id> - Cancel order
     */
    public function actionCancel($id)
    {
        $user = Yii::$app->user->identity;

        try {
            // Find order
            $order = Order::find()
                ->where(['id' => $id, 'user_id' => $user->id])
                ->one();

            if (!$order) {
                Yii::$app->response->statusCode = 404;
                return [
                    'success' => false,
                    'message' => 'Order not found'
                ];
            }

            // Check if order can be cancelled (only pending orders can be cancelled)
            if ($order->status !== Order::STATUS_PENDING) {
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => 'Only pending orders can be cancelled'
                ];
            }

            // Start transaction to restore product stock
            $transaction = Yii::$app->db->beginTransaction();

            try {
                // Restore product stock
                foreach ($order->orderItems as $orderItem) {
                    $product = Product::findOne($orderItem->product_id);
                    if ($product) {
                        $product->stock += $orderItem->quantity;
                        if (!$product->save()) {
                            throw new \Exception('Failed to restore product stock: ' . json_encode($product->errors));
                        }
                    }
                }

                // Update order status
                $order->status = Order::STATUS_CANCELLED;
                $order->payment_status = Order::PAYMENT_STATUS_FAILED;
                $order->updated_at = date('Y-m-d H:i:s');

                if (!$order->save()) {
                    throw new \Exception('Failed to cancel order: ' . json_encode($order->errors));
                }

                $transaction->commit();

                Yii::info("Order cancelled: {$order->order_number}", 'order');

                return [
                    'success' => true,
                    'message' => 'Order cancelled successfully',
                    'order' => [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status,
                        'payment_status' => $order->payment_status
                    ]
                ];

            } catch (\Exception $e) {
                $transaction->rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            Yii::error('Cancel order error: ' . $e->getMessage(), 'order');
            Yii::$app->response->statusCode = 500;
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Calculate shipping cost based on method and weight
     */
    private function getShippingCost($method, $weight)
    {
        $baseCosts = [
            'standard' => 15000,
            'express' => 35000,
            'same_day' => 75000
        ];

        $baseCost = $baseCosts[$method] ?? 15000;

        // Additional cost for heavy items (above 5kg)
        if ($weight > 5000) {
            $extraWeight = ceil(($weight - 5000) / 1000); // per kg above 5kg
            $baseCost += $extraWeight * 5000; // additional 5000 per kg
        }

        return $baseCost;
    }
}