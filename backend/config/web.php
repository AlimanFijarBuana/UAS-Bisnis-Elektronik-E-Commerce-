<?php

$params = require __DIR__ . '/params.php';
$db = require __DIR__ . '/db.php';

$config = [
    'id' => 'basic',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'aliases' => [
        '@bower' => '@vendor/bower-asset',
        '@npm'   => '@vendor/npm-asset',
    ],
    'components' => [
        'request' => [
            'cookieValidationKey' => 'mn7L9bbjznCdKJRX95b5xhEgBpwLUtb-',
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ]
        ],
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
        'user' => [
            'identityClass' => 'app\models\User',
            'enableAutoLogin' => true,
            'enableSession' => true,
            'identityCookie' => ['name' => '_identity-frontend', 'httpOnly' => true],
        ],
        'session' => [
            'class' => 'yii\web\Session',
            'name' => 'advanced-frontend',
            'timeout' => 3600, // 1 jam
            'cookieParams' => [
                'lifetime' => 0, // Session cookie expires when browser closes
                'httponly' => true,
                'secure' => false, // Set true if using HTTPS
            ],
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
        'mailer' => [
            'class' => \yii\symfonymailer\Mailer::class,
            'viewPath' => '@app/mail',
            'useFileTransport' => true,
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning', 'info'],
                ],
            ],
        ],
        'db' => $db,
        
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'rules' => [

                'GET /' => 'site/index',
                'GET health' => 'site/health',
                'GET docs' => 'site/docs',
                'GET site/error' => 'site/error',
                
                // Auth routes
                'POST auth/register' => 'auth/register',
                'POST auth/login' => 'auth/login',
                'POST auth/logout' => 'auth/logout',
                'GET auth/check' => 'auth/check',
                
                // Orders Routes - USER
                'POST order/update-payment/<id:\d+>' => 'order/update-payment',
                'POST order/cancel/<id:\d+>' => 'order/cancel',
                
                // 🎯 ADMIN ORDER ROUTES - TAMBAHKAN INI
                'GET order/admin-list' => 'order/admin-list',
                'GET order/admin-view/<id:\d+>' => 'order/admin-view',
                'POST order/admin-update/<id:\d+>' => 'order/admin-update',

                // Cart routes
                'GET cart' => 'cart/index',
                'GET cart/count' => 'cart/count',
                'POST cart/add' => 'cart/add',
                'PUT cart/update' => 'cart/update',
                'DELETE cart/remove' => 'cart/remove',
                'DELETE cart/clear' => 'cart/clear',

                // Order routes - USER
                'POST order/place' => 'order/place',
                'GET order/list' => 'order/list',
                'GET order/view/<id:\d+>' => 'order/view',
                'GET order/user' => 'order/user-orders',

                // Category routes
                'GET category/list' => 'category/list',
                'POST category/create' => 'category/create', 
                'PUT category/update/<id:\d+>' => 'category/update',
                'DELETE category/delete/<id:\d+>' => 'category/delete',

                // Product routes
                'GET product/list' => 'product/list',
                'GET product/categories' => 'product/categories',
                'GET product/view/<id:\d+>' => 'product/view',
                'POST product/create' => 'product/create', 
                'PUT product/update/<id:\d+>' => 'product/update',
                'DELETE product/delete/<id:\d+>' => 'product/delete',

                // User management routes
                'GET user/list' => 'user/list',
                'POST user/create' => 'user/create', 
                'PUT user/update/<id:\d+>' => 'user/update',
                'DELETE user/delete/<id:\d+>' => 'user/delete',
                
                // Default routes
                '<controller:\w+>/<id:\d+>' => '<controller>/view',
                '<controller:\w+>/<action:\w+>/<id:\d+>' => '<controller>/<action>',
                '<controller:\w+>/<action:\w+>' => '<controller>/<action>',
            ],
        ],
    ],
    'params' => $params,
];

if (YII_ENV_DEV) {
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
    ];
}

return $config;