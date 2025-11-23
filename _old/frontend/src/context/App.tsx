"use client";

import React from "react";
import { ToastProvider, EntidadeProvider, LanguageProvider } from ".";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/context/I18n";

const queryClient = new QueryClient();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<LanguageProvider>
			<QueryClientProvider client={queryClient}>
				<EntidadeProvider>{children}</EntidadeProvider>
				<ToastProvider />
			</QueryClientProvider>
		</LanguageProvider>
	);
};
