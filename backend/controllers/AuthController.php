<?php
// file: controllers/AuthController.php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use app\models\User;

class AuthController extends Controller
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
        
        unset($behaviors['authenticator']);
        
        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:3000', 'http://localhost:5173'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 86400,
            ],
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
     * Endpoint: POST /auth/register
     */
    public function actionRegister()
    {
        $request = Yii::$app->request;
        $username = $request->post('username');
        $email = $request->post('email');
        $password = $request->post('password');

        // Validasi input
        if (empty($username) || empty($email) || empty($password)) {
            Yii::$app->response->statusCode = 400;
            return ['success' => false, 'message' => 'Semua field harus diisi.'];
        }

        $user = new User();
        $user->username = $username;
        $user->email = $email;
        $user->role = 'user';
        $user->password_hash = Yii::$app->security->generatePasswordHash($password);
        $user->access_token = Yii::$app->security->generateRandomString(32);
        
        if ($user->save()) {
            Yii::$app->response->statusCode = 201;
            return [
                'success' => true, 
                'message' => 'Pendaftaran berhasil. Silakan login.',
                'data' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ];
        } else {
            Yii::$app->response->statusCode = 422;
            $errors = $user->getFirstErrors();
            return [
                'success' => false, 
                'message' => array_shift($errors) ?? 'Pendaftaran gagal.',
                'errors' => $user->errors
            ];
        }
    }

    /**
     * Endpoint: POST /auth/login
     * SEKARANG BISA LOGIN DENGAN USERNAME ATAU EMAIL
     */
    public function actionLogin()
    {
        $request = Yii::$app->request;
        $login = $request->post('username'); // Bisa berisi username atau email
        $password = $request->post('password');

        // Validasi input
        if (empty($login) || empty($password)) {
            Yii::$app->response->statusCode = 400;
            return ['success' => false, 'message' => 'Username/Email dan password harus diisi.'];
        }

        // Cari user by username ATAU email
        $user = $this->findUserByIdentifier($login);

        if ($user && Yii::$app->security->validatePassword($password, $user->password_hash)) {
            
            // Generate new access token
            $token = Yii::$app->security->generateRandomString(64);
            $user->access_token = $token;
            $user->save(false);

            Yii::$app->response->statusCode = 200;
            return [
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'message' => 'Login berhasil!'
            ];
        } else {
            Yii::$app->response->statusCode = 401;
            return ['success' => false, 'message' => 'Username/Email atau password salah.'];
        }
    }

    /**
     * Mencari user berdasarkan username ATAU email
     */
    private function findUserByIdentifier($identifier)
    {
        // Cek apakah identifier berupa email
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            // Jika berupa email, cari by email
            return User::findOne(['email' => $identifier]);
        } else {
            // Jika bukan email, cari by username
            return User::findOne(['username' => $identifier]);
        }
    }
}