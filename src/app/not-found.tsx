'use client';

import { motion } from 'framer-motion';
import { HomeIcon } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="flex flex-col items-center">
                {/* Гигантская цифра 404 — появляется первой */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="text-[10rem] md:text-[15rem] leading-none font-bold tracking-tighter uppercase font-jane text-zinc-300 dark:text-zinc-800 select-none"
                >
                    404
                </motion.h1>

                {/* Декоративная линия — задержка 1s */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="w-80 h-1.5 bg-amber-500 my-8 rounded-full"
                />

                {/* Заголовок — задержка 1.2s */}
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                    className="text-3xl md:text-4xl font-bold tracking-widest uppercase mb-4 font-jane"
                >
                    Item Not Found
                </motion.h2>

                {/* Описание — задержка 1.4s */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.4 }}
                    className="text-muted-foreground text-lg md:text-xl max-w-md mb-12"
                >
                    Looks like this page is sold out, moved, or never existed in
                    our collection.
                </motion.p>

                {/* Кнопка — задержка 1.6s */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.4 }}
                >
                    <Link
                        href="/"
                        className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-xl uppercase tracking-widest font-bold text-lg transition-all duration-300 hover:bg-amber-600 shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1s_forwards] skew-x-12" />
                        <HomeIcon className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">
                            Back to Collection
                        </span>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
