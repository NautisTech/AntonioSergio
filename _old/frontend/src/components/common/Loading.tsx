"use client";

import { useEffect, useState } from "react";

export const Loading = () => {
  return (
    <div className="flex justify-center flex-col items-center h-full min-h-[100px]">
      <div className="w-8 h-8 border-4 border-[#ef4444] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">A carregar...</p>
    </div>
  );
};