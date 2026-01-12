<?php
// file: controllers/CategoryController.php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use yii\web\UploadedFile;
use yii\filters\auth\HttpBearerAuth;
use app\models\Category;

class CategoryController extends Controller
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
            'except' => ['options', 'list'],
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
     * GET /category/list - Get all categories
     */
    public function actionList()
    {
        try {
            $categories = Category::find()
                ->select(['id', 'name', 'slug', 'image', 'created_at'])
                ->asArray()
                ->all();

            return [
                'success' => true,
                'categories' => $categories,
                'total' => count($categories)
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to fetch categories: ' . $e->getMessage()];
        }
    }

    /**
     * POST /category/create - Create new category with image upload
     */
    public function actionCreate()
    {
        $request = Yii::$app->request;
        
        $category = new Category();
        $category->name = $request->post('name');
        $category->slug = $request->post('slug');

        // Handle image upload
        $uploadedImage = UploadedFile::getInstanceByName('image');
        if ($uploadedImage && $uploadedImage->error === UPLOAD_ERR_OK) {
            $imageName = Yii::$app->security->generateRandomString(16) . '.' . $uploadedImage->extension;
            $imagePath = Yii::getAlias('@webroot/uploads/categories/') . $imageName;
            
            // Create uploads directory if not exists
            $uploadDir = Yii::getAlias('@webroot/uploads/categories/');
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            if ($uploadedImage->saveAs($imagePath)) {
                $category->image = '/uploads/categories/' . $imageName;
            }
        } else {
            // Use image URL if provided
            $category->image = $request->post('image', '');
        }

        if ($category->save()) {
            return [
                'success' => true,
                'message' => 'Category created successfully',
                'category' => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'image' => $category->image
                ]
            ];
        } else {
            Yii::$app->response->statusCode = 422;
            return [
                'success' => false,
                'message' => 'Failed to create category',
                'errors' => $category->getFirstErrors()
            ];
        }
    }

    /**
     * PUT /category/update/{id} - Update category with image upload
     */
    public function actionUpdate($id)
    {
        $request = Yii::$app->request;
        
        $category = Category::findOne($id);
        if (!$category) {
            Yii::$app->response->statusCode = 404;
            return ['success' => false, 'message' => 'Category not found'];
        }

        $category->name = $request->getBodyParam('name', $category->name);
        $category->slug = $request->getBodyParam('slug', $category->slug);

        // Handle image upload
        $uploadedImage = UploadedFile::getInstanceByName('image');
        if ($uploadedImage && $uploadedImage->error === UPLOAD_ERR_OK) {
            $imageName = Yii::$app->security->generateRandomString(16) . '.' . $uploadedImage->extension;
            $imagePath = Yii::getAlias('@webroot/uploads/categories/') . $imageName;
            
            // Create uploads directory if not exists
            $uploadDir = Yii::getAlias('@webroot/uploads/categories/');
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            if ($uploadedImage->saveAs($imagePath)) {
                // Delete old image if exists
                if ($category->image && file_exists(Yii::getAlias('@webroot') . $category->image)) {
                    unlink(Yii::getAlias('@webroot') . $category->image);
                }
                $category->image = '/uploads/categories/' . $imageName;
            }
        } else {
            // Use image URL if provided and different from current
            $newImageUrl = $request->getBodyParam('image', $category->image);
            if ($newImageUrl !== $category->image && !empty($newImageUrl)) {
                $category->image = $newImageUrl;
            }
        }

        if ($category->save()) {
            return [
                'success' => true,
                'message' => 'Category updated successfully',
                'category' => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'image' => $category->image
                ]
            ];
        } else {
            Yii::$app->response->statusCode = 422;
            return [
                'success' => false,
                'message' => 'Failed to update category',
                'errors' => $category->getFirstErrors()
            ];
        }
    }

    /**
     * DELETE /category/delete/{id} - Delete category
     */
    public function actionDelete($id)
    {
        $category = Category::findOne($id);
        if (!$category) {
            Yii::$app->response->statusCode = 404;
            return ['success' => false, 'message' => 'Category not found'];
        }

        // Delete image file if exists
        if ($category->image && file_exists(Yii::getAlias('@webroot') . $category->image)) {
            unlink(Yii::getAlias('@webroot') . $category->image);
        }

        if ($category->delete()) {
            return ['success' => true, 'message' => 'Category deleted successfully'];
        } else {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to delete category'];
        }
    }
}