<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImageReview extends Model
{
    /** @use HasFactory<\Database\Factories\ImageReviewFactory> */
    use HasFactory;


    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'url_image',
        'review_id'
    ];

    public function review(){
        return $this->belongsTo(Review::class);
    }
}
