import { useSyncExternalStore } from 'react';

// Пустая функция-подписка, так как состояние монтирования не меняется со временем
const emptySubscribe = () => () => {};

export function useHasMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true, // Возвращаем true, если мы в браузере (Client)
        () => false // Возвращаем false, если мы на сервере (SSR)
    );
}
