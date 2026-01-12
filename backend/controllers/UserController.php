<?php
// file: controllers/UserController.php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use yii\filters\auth\HttpBearerAuth;
use app\models\User;

class UserController extends Controller
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

        // Authentication for all actions except options
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
     * GET /user/list - Get all users
     */
    public function actionList()
    {
        try {
            $users = User::find()
                ->select(['id', 'username', 'email', 'role', 'created_at'])
                ->asArray()
                ->all();

            // Tambahkan status default karena tidak ada kolom status
            $usersWithStatus = array_map(function($user) {
                $user['status'] = 'Active'; // Default status
                return $user;
            }, $users);

            return [
                'success' => true,
                'users' => $usersWithStatus,
                'total' => count($users)
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to fetch users: ' . $e->getMessage()];
        }
    }

    /**
     * POST /user/create - Create new user
     */
    public function actionCreate()
    {
        $request = Yii::$app->request;
        
        $user = new User();
        $user->username = $request->post('username');
        $user->email = $request->post('email');
        $user->role = $request->post('role', 'user');
        // Status diabaikan karena tidak ada kolom status
        $user->password_hash = Yii::$app->security->generatePasswordHash('default123'); // Default password
        $user->access_token = Yii::$app->security->generateRandomString(32);

        if ($user->save()) {
            return [
                'success' => true,
                'message' => 'User created successfully',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => 'Active' // Default status untuk response
                ]
            ];
        } else {
            Yii::$app->response->statusCode = 422;
            return [
                'success' => false,
                'message' => 'Failed to create user',
                'errors' => $user->getFirstErrors()
            ];
        }
    }

    /**
     * PUT /user/update/{id} - Update user
     */
    public function actionUpdate($id)
    {
        $request = Yii::$app->request;
        
        $user = User::findOne($id);
        if (!$user) {
            Yii::$app->response->statusCode = 404;
            return ['success' => false, 'message' => 'User not found'];
        }

        // Prevent admin from modifying their own role
        $currentUser = Yii::$app->user->identity;
        if ($currentUser->id == $id) {
            // Admin tidak bisa mengubah role sendiri
            if ($request->getBodyParam('role') !== $user->role) {
                Yii::$app->response->statusCode = 403;
                return ['success' => false, 'message' => 'Cannot change your own role'];
            }
            
            // Admin tidak bisa mengubah username sendiri
            if ($request->getBodyParam('username') !== $user->username) {
                Yii::$app->response->statusCode = 403;
                return ['success' => false, 'message' => 'Cannot change your own username'];
            }
        }

        // Update fields yang ada di database
        $user->email = $request->getBodyParam('email', $user->email);
        
        // Hanya update role jika bukan user sendiri
        if ($currentUser->id != $id) {
            $user->role = $request->getBodyParam('role', $user->role);
            
            // Username hanya bisa diubah untuk user lain
            $newUsername = $request->getBodyParam('username');
            if ($newUsername && $newUsername !== $user->username) {
                $user->username = $newUsername;
            }
        }

        if ($user->save()) {
            return [
                'success' => true,
                'message' => 'User updated successfully',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => 'Active' // Default status untuk response
                ]
            ];
        } else {
            Yii::$app->response->statusCode = 422;
            return [
                'success' => false,
                'message' => 'Failed to update user',
                'errors' => $user->getFirstErrors()
            ];
        }
    }

    /**
     * DELETE /user/delete/{id} - Delete user
     */
    public function actionDelete($id)
    {
        $currentUser = Yii::$app->user->identity;
        
        // Prevent admin from deleting themselves
        if ($currentUser->id == $id) {
            Yii::$app->response->statusCode = 403;
            return ['success' => false, 'message' => 'Cannot delete your own account'];
        }

        $user = User::findOne($id);
        if (!$user) {
            Yii::$app->response->statusCode = 404;
            return ['success' => false, 'message' => 'User not found'];
        }

        if ($user->delete()) {
            return ['success' => true, 'message' => 'User deleted successfully'];
        } else {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to delete user'];
        }
    }
}