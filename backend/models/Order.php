<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "orders".
 *
 * @property int $id
 * @property int $user_id
 * @property string $order_number
 * @property string $shipping_info
 * @property string $payment_method
 * @property string $shipping_method
 * @property float $total_amount
 * @property float $shipping_cost
 * @property int $total_weight
 * @property string $status
 * @property string $payment_status
 * @property string $created_at
 * @property string $updated_at
 *
 * @property User $user
 * @property OrderItem[] $orderItems
 */
class Order extends ActiveRecord
{
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPED = 'shipped';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';

    const PAYMENT_STATUS_PENDING = 'pending';
    const PAYMENT_STATUS_PAID = 'paid';
    const PAYMENT_STATUS_FAILED = 'failed';

    public static function tableName()
    {
        return 'orders';
    }

    public function rules()
    {
        return [
            [['user_id', 'order_number', 'shipping_info', 'payment_method', 'shipping_method', 'total_amount', 'shipping_cost'], 'required'],
            [['user_id', 'total_weight'], 'integer'],
            [['shipping_info'], 'string'],
            [['total_amount', 'shipping_cost'], 'number'],
            [['created_at', 'updated_at'], 'safe'],
            [['order_number'], 'string', 'max' => 50],
            [['payment_method', 'shipping_method'], 'string', 'max' => 20],
            [['status', 'payment_status'], 'string', 'max' => 15],
            [['order_number'], 'unique'],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['user_id' => 'id']],
            ['status', 'default', 'value' => self::STATUS_PENDING],
            ['payment_status', 'default', 'value' => self::PAYMENT_STATUS_PENDING],
            ['total_weight', 'default', 'value' => 0],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'order_number' => 'Order Number',
            'shipping_info' => 'Shipping Info',
            'payment_method' => 'Payment Method',
            'shipping_method' => 'Shipping Method',
            'total_amount' => 'Total Amount',
            'shipping_cost' => 'Shipping Cost',
            'total_weight' => 'Total Weight',
            'status' => 'Status',
            'payment_status' => 'Payment Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function getOrderItems()
    {
        return $this->hasMany(OrderItem::class, ['order_id' => 'id']);
    }

    public function beforeSave($insert)
    {
        if (parent::beforeSave($insert)) {
            if ($this->isNewRecord) {
                $this->created_at = date('Y-m-d H:i:s');
            }
            $this->updated_at = date('Y-m-d H:i:s');
            return true;
        }
        return false;
    }

    public static function generateOrderNumber()
    {
        return 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    }

    public function getShippingInfoArray()
    {
        return json_decode($this->shipping_info, true) ?: [];
    }
}