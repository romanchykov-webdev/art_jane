import localFont from 'next/font/local';

// Инициализируем локальный шрифт
export const janeFont = localFont({
    src: '../../fonts/rush_zone.otf', //  точное имя твоего файла
    variable: '--font-jane', // Эта CSS-переменная пойдет в Tailwind
    display: 'swap', // Защита от невидимого текста при медленном интернете
    weight: '900', //  вес твоего шрифта (Black обычно 900)
    style: 'normal',
});
