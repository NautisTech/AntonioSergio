"use client";
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
	useCallback,
} from "react";

export interface Entity {
	key: string;
	value: string;
	displayName: string;
}

export const ENTITIES = [
	{
		key: "ESAntonioSergio",
		value: "antoniosergio",
		displayName: "ES António Sérgio",
	},
	{
		key: "EB1Marco",
		value: "marco",
		displayName: "EB1/JI Marco",
	},
	{
		key: "EB1Praia",
		value: "praia",
		displayName: "EB1/JI Praia",
	},
	{
		key: "EB1Pedras",
		value: "pedras",
		displayName: "EB1/JI Pedras",
	},
	{
		key: "EB1ProfDrMarques",
		value: "marquessantos",
		displayName: "EB1/JI Prof. Dr. Marques dos Santos",
	},
	{
		key: "EB1QntChas",
		value: "qntchas",
		displayName: "EB1/JI Quinta das Chãs",
	},
	{
		key: "EB23StaMarinha",
		value: "stamarinha",
		displayName: "EB2/3 Santa Marinha",
	},
];

interface EntityContextType {
	entities: Entity[];
	selectedEntity: Entity | null;
	setSelectedEntity: (entity: Entity | null) => void;
	isEntitySelected: boolean;
}

const EntityContext = createContext<EntityContextType | undefined>(undefined);

const STORAGE_KEY = "selectedEntity";

export function EntityProvider({ children }: { children: React.ReactNode }) {
	const [selectedEntity, setSelectedEntityState] = useState<Entity | null>(
		null
	);
	const [isStorageLoaded, setIsStorageLoaded] = useState(false);

	// Load from localStorage on mount
	useEffect(() => {
		const storedEntityValue = localStorage.getItem(STORAGE_KEY);
		if (storedEntityValue) {
			const entity = ENTITIES.find(e => e.value === storedEntityValue);
			if (entity) {
				setSelectedEntityState(entity);
			} else {
				localStorage.removeItem(STORAGE_KEY);
			}
		}
		setIsStorageLoaded(true);
	}, []);

	const setSelectedEntity = useCallback((entity: Entity | null) => {
		setSelectedEntityState(entity);
		if (entity) {
			localStorage.setItem(STORAGE_KEY, entity.value);
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, []);

	const value = useMemo(
		() => ({
			entities: ENTITIES,
			selectedEntity,
			setSelectedEntity,
			isEntitySelected: !!selectedEntity,
		}),
		[selectedEntity, setSelectedEntity]
	);

	if (!isStorageLoaded) {
		return null;
	}

	return (
		<EntityContext.Provider value={value}>
			{children}
		</EntityContext.Provider>
	);
}

export function useEntity() {
	const context = useContext(EntityContext);
	if (context === undefined) {
		throw new Error("useEntity must be used within an EntityProvider");
	}
	return context;
}

// Helper function to filter content by entity
export function filterByEntity<T extends { entities?: string[] }>(
	items: T[],
	selectedEntity: Entity | null
): T[] {
	if (!selectedEntity) {
		return items;
	}

	return items.filter(
		item =>
			!item.entities ||
			item.entities.length === 0 ||
			item.entities.includes(selectedEntity.value)
	);
}
