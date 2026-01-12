<?php
// file: models/User.php

namespace app\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\web\IdentityInterface;

class User extends ActiveRecord implements IdentityInterface
{
    const STATUS_ACTIVE = 'Active';
    const STATUS_INACTIVE = 'Inactive';

    public static function tableName()
    {
        return 'users'; // Sesuai dengan nama tabel Anda
    }

    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::class,
                'createdAtAttribute' => 'created_at',
                'updatedAtAttribute' => false, // Karena tidak ada updated_at
                'value' => function() { 
                    return date('Y-m-d H:i:s'); 
                },
            ],
        ];
    }

    public function rules()
    {
        return [
            [['username', 'email', 'password_hash'], 'required'],
            [['username', 'email'], 'unique'],
            ['email', 'email'],
            [['role'], 'default', 'value' => 'user'],
            [['username', 'email', 'password_hash', 'access_token', 'role'], 'string', 'max' => 255],
        ];
    }

    // Untuk kompatibilitas dengan kode yang mengharapkan status
    public function getStatus()
    {
        return self::STATUS_ACTIVE; // Default active karena tidak ada kolom status
    }

    // IdentityInterface methods
    public static function findIdentity($id)
    {
        return static::findOne($id);
    }

    public static function findIdentityByAccessToken($token, $type = null)
    {
        return static::findOne(['access_token' => $token]);
    }

    public function getId()
    {
        return $this->id;
    }

    public function getAuthKey()
    {
        return $this->access_token;
    }

    public function validateAuthKey($authKey)
    {
        return $this->access_token === $authKey;
    }

    /**
     * Cari user by username (untuk kompatibilitas)
     */
    public static function findByUsername($username)
    {
        return static::findOne(['username' => $username]);
    }

    /**
     * Cari user by email
     */
    public static function findByEmail($email)
    {
        return static::findOne(['email' => $email]);
    }

    /**
     * Cari user by username ATAU email
     * Method ini digunakan di AuthController untuk login fleksibel
     */
    public static function findByIdentifier($identifier)
    {
        // Cek apakah identifier berupa email format
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            // Jika berupa email, cari by email
            return static::findOne(['email' => $identifier]);
        } else {
            // Jika bukan email, cari by username
            return static::findOne(['username' => $identifier]);
        }
    }
}