"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Modal({ open, close }) {
  const [value, setValue] = useState(null);

  const handleSubmit = () => {
    if (value) {
      localStorage.setItem("username", value);
      close();
    } else {
      alert("Please enter your name");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex fixed inset-0 min-h-screen justify-center items-center z-[9999] overflow-y-hidden pointer-events-auto"
        >
          <div onClick={close} className="fixed inset-0 bg-black/70 z-[1]" />
          <div
            className={`p-10 bg-white shadow-lg rounded-lg z-[2] mx-4 desktop:mx-0 overflow-y-auto relative flex flex-col gap-6`}
          >
            <div className="flex items-center flex-col gap-3">
              <img src="/logo-01.png" alt="logo" className="w-32 h-32" />
              <p className="text-2xl font-medium">
                Hello kiddo! please enter your name
              </p>
            </div>
            <input
              type="text"
              value={value}
              placeholder="What is your name?"
              onChange={(e) => setValue(e.target.value)}
              className="rounded-[10px] py-3 px-4 border-2 focus:outline-none focus:border-primary focus:ring-primary resize-none transition-all "
            />
            <button
              onClick={handleSubmit}
              className="bg-primary py-3 rounded-md font-medium hover:bg-primary/80 transition-all"
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
