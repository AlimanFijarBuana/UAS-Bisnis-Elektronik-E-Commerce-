<?php
// file: controllers/ProductController.php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use yii\web\UploadedFile;
use yii\filters\auth\HttpBearerAuth;
use app\models\Product;
use app\models\Category;

class ProductController extends Controller
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

        // Authentication: Hanya rute publik yang dikecualikan
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'except' => ['options', 'list', 'categories', 'view'],
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
     * GET /product/list - Get all products with categories
     */
    public function actionList()
    {
        try {
            $products = Product::find()
                ->select(['products.*', 'categories.name as category_name'])
                ->leftJoin('categories', 'products.category_id = categories.id')
                ->asArray()
                ->all();

            return [
                'success' => true,
                'products' => $products,
                'total' => count($products)
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to fetch products: ' . $e->getMessage()];
        }
    }

    /**
     * GET /product/view/{id} - Get single product details
     */
    public function actionView($id)
    {
        try {
            $product = Product::find()
                ->select(['products.*', 'categories.name as category_name'])
                ->leftJoin('categories', 'products.category_id = categories.id')
                ->where(['products.id' => $id])
                ->asArray()
                ->one();

            if (!$product) {
                Yii::$app->response->statusCode = 404;
                return ['success' => false, 'message' => 'Product not found'];
            }

            // Tambahkan Base URL ke gambar
            if ($product['image']) {
                $baseUrl = Yii::$app->request->hostInfo;
                if (!str_starts_with($product['image'], 'http')) {
                    $product['image'] = $baseUrl . $product['image'];
                }
            }

            return [
                'success' => true,
                'product' => [
                    'id' => (int)$product['id'],
                    'name' => $product['name'],
                    'description' => $product['description'],
                    'price' => (float)$product['price'],
                    'stock' => (int)$product['stock'],
                    'category_id' => (int)$product['category_id'],
                    'category_name' => $product['category_name'],
                    'image' => $product['image'],
                    'created_at' => $product['created_at'],
                    'updated_at' => $product['updated_at'],
                ]
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to fetch product details: ' . $e->getMessage()];
        }
    }

    /**
     * GET /product/categories - Get all categories
     */
    public function actionCategories()
    {
        try {
            $categories = Category::find()
                ->select(['id', 'name', 'slug', 'image', 'created_at'])
                ->asArray()
                ->all();

            return [
                'success' => true,
                'categories' => $categories
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to fetch categories'];
        }
    }

    /**
     * POST /product/create - Create new product
     */
    public function actionCreate()
    {
        try {
            $product = new Product();
            
            // ⭐ PERBAIKAN 1: Hapus parameter kosong (', ''') agar Yii2 dapat memuat data dengan prefix 'Product[...]'
            $product->load(Yii::$app->request->post()); 

            // Handle file upload
            // ⭐ PERBAIKAN 2: Ubah nama field file agar sesuai dengan yang dikirim React
            $product->image = UploadedFile::getInstanceByName('Product[imageFile]');
            
            if ($product->image) {
                $fileName = Yii::$app->security->generateRandomString() . '.' . $product->image->extension;
                $filePath = 'uploads/' . $fileName;
                if ($product->image->saveAs($filePath)) {
                    $product->image = '/' . $filePath;
                }
            } else {
                // Pastikan image di set null jika tidak ada file yang diunggah
                $product->image = null; 
            }

            if ($product->save()) {
                return [
                    'success' => true,
                    'message' => 'Product created successfully',
                    'product' => $product
                ];
            } else {
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => 'Failed to create product',
                    'errors' => $product->errors
                ];
            }
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to create product: ' . $e->getMessage()];
        }
    }

    /**
     * PUT /product/update/{id} - Update existing product
     */
    public function actionUpdate($id)
    {
        try {
            $product = Product::findOne($id);
            if (!$product) {
                Yii::$app->response->statusCode = 404;
                return ['success' => false, 'message' => 'Product not found'];
            }

            // ⭐ PERBAIKAN 1: Hapus parameter kosong (', ''')
            $product->load(Yii::$app->request->post());

            // Handle file upload
            // ⭐ PERBAIKAN 2: Ubah nama field file agar sesuai dengan yang dikirim React
            $uploadedImage = UploadedFile::getInstanceByName('Product[imageFile]');
            
            if ($uploadedImage) {
                $fileName = Yii::$app->security->generateRandomString() . '.' . $uploadedImage->extension;
                $filePath = 'uploads/' . $fileName;
                if ($uploadedImage->saveAs($filePath)) {
                    // Delete old image if exists
                    if ($product->image && file_exists(Yii::getAlias('@webroot') . $product->image)) {
                        unlink(Yii::getAlias('@webroot') . $product->image);
                    }
                    $product->image = '/' . $filePath;
                }
            }
            // Catatan: Jika tidak ada file baru diunggah, nilai $product->image akan dipertahankan dari $product->load() 
            // jika frontend mengirimkan kembali path gambar lama (Product[image]).
            // Jika frontend mengirimkan Product[image] kosong, dan tidak ada Product[imageFile], maka akan kosong (penghapusan gambar).

            if ($product->save()) {
                return [
                    'success' => true,
                    'message' => 'Product updated successfully',
                    'product' => $product
                ];
            } else {
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => 'Failed to update product',
                    'errors' => $product->errors
                ];
            }
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to update product: ' . $e->getMessage()];
        }
    }

    /**
     * DELETE /product/delete/{id} - Delete product
     */
    public function actionDelete($id)
    {
        try {
            $product = Product::findOne($id);
            if (!$product) {
                Yii::$app->response->statusCode = 404;
                return ['success' => false, 'message' => 'Product not found'];
            }

            // Delete associated image file
            if ($product->image && file_exists(Yii::getAlias('@webroot') . $product->image)) {
                unlink(Yii::getAlias('@webroot') . $product->image);
            }

            if ($product->delete()) {
                return [
                    'success' => true,
                    'message' => 'Product deleted successfully'
                ];
            } else {
                Yii::$app->response->statusCode = 400;
                return [
                    'success' => false,
                    'message' => 'Failed to delete product'
                ];
            }
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['success' => false, 'message' => 'Failed to delete product: ' . $e->getMessage()];
        }
    }
}