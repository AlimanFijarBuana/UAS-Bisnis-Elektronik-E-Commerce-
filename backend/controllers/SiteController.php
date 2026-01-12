<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;

class SiteController extends Controller
{
    public $enableCsrfValidation = false;

    public function init()
    {
        parent::init();
        Yii::$app->response->format = Response::FORMAT_JSON;
    }

    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        
        // Remove default authenticator and access control
        unset($behaviors['access']);
        unset($behaviors['verbs']);

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

        return $behaviors;
    }

    /**
     * {@inheritdoc}
     */
    public function actions()
    {
        return [
            'error' => [
                'class' => 'yii\web\ErrorAction',
            ],
            'options' => [
                'class' => 'yii\rest\OptionsAction',
            ],
        ];
    }

    /**
     * Displays homepage API info.
     *
     * @return array
     */
    public function actionIndex()
    {
        return [
            'success' => true,
            'message' => 'E-Commerce API',
            'version' => '1.0.0',
            'endpoints' => [
                'auth' => [
                    'POST /auth/register' => 'User registration',
                    'POST /auth/login' => 'User login',
                    'POST /auth/logout' => 'User logout',
                    'GET /auth/check' => 'Check authentication status',
                ],
                'cart' => [
                    'GET /cart' => 'Get user cart',
                    'GET /cart/count' => 'Get cart items count',
                    'POST /cart/add' => 'Add item to cart',
                    'PUT /cart/update' => 'Update cart item',
                    'DELETE /cart/remove' => 'Remove item from cart',
                    'DELETE /cart/clear' => 'Clear cart',
                ],
                'products' => [
                    'GET /product/list' => 'Get all products',
                    'GET /product/categories' => 'Get product categories',
                    'GET /product/view/{id}' => 'Get product details',
                    'POST /product/create' => 'Create product (admin)',
                    'PUT /product/update/{id}' => 'Update product (admin)',
                    'DELETE /product/delete/{id}' => 'Delete product (admin)',
                ],
                'categories' => [
                    'GET /category/list' => 'Get all categories',
                    'POST /category/create' => 'Create category (admin)',
                    'PUT /category/update/{id}' => 'Update category (admin)',
                    'DELETE /category/delete/{id}' => 'Delete category (admin)',
                ],
                'users' => [
                    'GET /user/list' => 'Get all users (admin)',
                    'POST /user/create' => 'Create user (admin)',
                    'PUT /user/update/{id}' => 'Update user (admin)',
                    'DELETE /user/delete/{id}' => 'Delete user (admin)',
                ]
            ]
        ];
    }

    /**
     * Health check endpoint
     *
     * @return array
     */
    public function actionHealth()
    {
        try {
            // Test database connection
            Yii::$app->db->open();
            $dbStatus = 'connected';
        } catch (\Exception $e) {
            $dbStatus = 'disconnected';
        }

        return [
            'success' => true,
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s'),
            'database' => $dbStatus,
            'environment' => YII_ENV,
            'debug' => YII_DEBUG,
        ];
    }

    /**
     * API documentation
     *
     * @return array
     */
    public function actionDocs()
    {
        return [
            'success' => true,
            'message' => 'API Documentation',
            'authentication' => [
                'type' => 'Bearer Token',
                'description' => 'Include access token in Authorization header for protected routes',
                'example' => 'Authorization: Bearer your_access_token_here'
            ],
            'response_format' => [
                'success' => 'boolean - indicates if request was successful',
                'message' => 'string - response message',
                'data' => 'mixed - response data (optional)',
                'errors' => 'array - validation errors (optional)'
            ],
            'common_status_codes' => [
                '200' => 'Success',
                '201' => 'Created',
                '400' => 'Bad Request',
                '401' => 'Unauthorized',
                '403' => 'Forbidden',
                '404' => 'Not Found',
                '422' => 'Validation Error',
                '500' => 'Internal Server Error'
            ]
        ];
    }

    /**
     * Override default error action for API
     */
    public function actionError()
    {
        $exception = Yii::$app->errorHandler->exception;
        
        if ($exception !== null) {
            Yii::$app->response->statusCode = $exception->statusCode ?: 500;
            return [
                'success' => false,
                'message' => $exception->getMessage(),
                'code' => $exception->getCode(),
                'status' => $exception->statusCode ?: 500,
            ];
        }

        return [
            'success' => false,
            'message' => 'Unknown error occurred',
            'status' => 500,
        ];
    }
}