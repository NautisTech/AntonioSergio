"use client";

import React, {
	createContext,
	useContext,
	useMemo,
	useCallback,
	useState,
	useEffect,
} from "react";
import { Entidade, ENTIDADES } from "@/utils/Entidade";

export interface EntidadeContextProps {
	entidades: Entidade[];
	selectedEntidade: Entidade | null;
	setSelectedEntidade: (entidade: Entidade | null) => void;
	loading: boolean;
	error: string | null;
	isEntidadeSelected: boolean;
}

const EntidadeContext = createContext<EntidadeContextProps>(
	{} as EntidadeContextProps
);

export const useEntidadeContext = () => useContext(EntidadeContext);

const STORAGE_KEY = "selectedEntidade";

export const EntidadeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [selectedEntidade, setSelectedEntidadeState] =
		useState<Entidade | null>(null);
	const [isStorageLoaded, setIsStorageLoaded] = useState(false);

	const entidades = ENTIDADES;
	const loading = false;
	const fetchError = null;

	useEffect(() => {
		const storedEntidadeValue = localStorage.getItem(STORAGE_KEY);
		if (storedEntidadeValue) {
			try {
				// Find entidade by value
				const entidade = entidades.find(
					e => e.value === storedEntidadeValue
				);
				if (entidade) {
					setSelectedEntidadeState(entidade);
				} else {
					localStorage.removeItem(STORAGE_KEY);
				}
			} catch (error) {
				localStorage.removeItem(STORAGE_KEY);
			}
		}
		setIsStorageLoaded(true);
	}, [entidades]);

	const setSelectedEntidade = useCallback((entidade: Entidade | null) => {
		setSelectedEntidadeState(entidade);
		if (entidade) {
			// Store the value (lowercase identifier) instead of the full object
			localStorage.setItem(STORAGE_KEY, entidade.value);
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, []);

	const error = fetchError
		? `Erro ao carregar entidades: ${fetchError}`
		: null;

	const value = useMemo(
		() => ({
			entidades,
			selectedEntidade,
			setSelectedEntidade,
			loading: !isStorageLoaded || loading,
			error,
			isEntidadeSelected: !!selectedEntidade,
		}),
		[
			entidades,
			selectedEntidade,
			setSelectedEntidade,
			loading,
			error,
			isStorageLoaded,
		]
	);

	return (
		<EntidadeContext.Provider value={value}>
			{children}
		</EntidadeContext.Provider>
	);
};
