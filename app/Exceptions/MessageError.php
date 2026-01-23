<?php

namespace App\Exceptions;

class MessageError
{
    /***
     * Not found
     */
    public const USER_NOT_FOUND = 'Tài khoản không tồn tại hoặc bị khoá !';
    public const PERMISSION_NOT_FOUND = 'Permission not found';
    public const PRODUCT_NOT_FOUND = 'Product not found';
    public const URL_NOT_FOUND = 'Url not found';
    public const ROLE_NOT_FOUND = 'Role not found';
    public const CATEGORY_NOT_FOUND = 'Category not found';
    public const PRODUCT_VARIANT_NOT_FOUND = 'Product variant not found';
    public const ORDER_NOT_FOUND = 'Order not found';
    public const VOUCHER_NOT_FOUND = 'Voucher not found';

    /***
     * Not blank
     */
    public const GENDER_NOT_BLANK = 'Gender must be not blank';
    public const FULLNAME_NOT_BLANK = 'Fullname must be not blank';
    public const EMAIL_NOT_BLANK = 'Email must be not blank';
    public const PHONE_NOT_BLANK = 'Phone must be not blank';
    public const PASSWORD_NOT_BLANK = 'Password must be not blank';
    public const USERNAME_NOT_BLANK = 'Username must be not blank';
    public const ADDRESS_NOT_BLANK = 'Address must be not blank';

    public const TOKEN_NOT_BLANK = 'Token không được để trống';

    /***
     * Existed
     */
    public const USERNAME_EXISTED = 'Username existed';

    /***
     * Invalid
     */
    public const EMAIL_INVALID = 'Email invalid';
    public const DOB_INVALID = 'Date of birth must be least {min}';
    public const TOKEN_INVALID = 'Token is invalid';

    /***
     * Auth
     */
    public const UNAUTHENTICATED = 'Unauthenticated';
    public const UNAUTHORIZED = "You don't have permission";

    /***
     * Not Empty
     */
    public const ROLE_NOT_EMPTY = 'Role must be not empty';
}
