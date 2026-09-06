export type CheckoutErrorCode =
    | 'UNAUTHORIZED'
    | 'VALIDATION_ERROR'
    | 'CART_CHANGED'
    | 'EMPTY_CART'
    | 'PRODUCT_UNAVAILABLE'
    | 'STRIPE_ERROR'
    | 'PROCESSING_ERROR'
    | 'INTERNAL_ERROR';

/**
 * Почему товар нельзя купить прямо сейчас.
 *
 * Разница принципиальна для текста ошибки: SOLD — это навсегда, вещь существует
 * в единственном экземпляре; RESERVED — чужая бронь, которая освободится
 * максимум через 40 минут, если тот покупатель не оплатит.
 */
export type UnavailableReason = 'RESERVED' | 'SOLD';

export type UnavailableProduct = {
    id: string;
    reason: UnavailableReason;
};

export type CheckoutResult =
    | { ok: true; url: string }
    | {
          ok: false;
          code: CheckoutErrorCode;
          message: string;
          unavailableProducts?: UnavailableProduct[];
          errorId?: string;
      };

// Извлекаем только "ошибочную" часть ответа для стора
export type CheckoutFailure = Extract<CheckoutResult, { ok: false }>;
