import React from 'react';
import { motion } from 'framer-motion';

const TruckLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col items-center">
        {/* Truck Container */}
        <motion.div
          animate={{
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Truck Body */}
          <svg
            width="120"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600"
          >
            {/* Cargo Box */}
            <rect x="1" y="3" width="15" height="13" />
            {/* Cabin */}
            <path d="M16 8h4l3 3v5h-7V8z" />
            {/* Wheels */}
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>

          {/* Speed Lines */}
          <motion.div 
            className="absolute -left-8 top-4 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], x: [0, -20] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="h-1 w-6 bg-gray-300 rounded-full" />
            <div className="h-1 w-4 bg-gray-300 rounded-full" />
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <p className="mt-4 font-mono text-sm tracking-widest text-gray-400 uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default TruckLoader;