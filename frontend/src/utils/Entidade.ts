export const EntidadeEnum = {
	ESAntonioSergio: "antoniosergio",
	EB1Marco: "marco",
	EB1Praia: "praia",
	EB1Pedras: "pedras",
	EB1ProfDrMarques: "marquessantos",
	EB1QntChas: "qntchas",
	EB23StaMarinha: "stamarinha",
} as const;

export type EntidadeKey = keyof typeof EntidadeEnum;
export type EntidadeValue = (typeof EntidadeEnum)[EntidadeKey];

export interface Entidade {
	key: EntidadeKey;
	value: EntidadeValue;
	displayName: string;
}

export const ENTIDADES: Entidade[] = [
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

/**
 * Get entidade by value (lowercase identifier)
 */
export const getEntidadeByValue = (value: string): Entidade | undefined => {
	return ENTIDADES.find(e => e.value === value);
};

/**
 * Get entidade by key
 */
export const getEntidadeByKey = (key: EntidadeKey): Entidade | undefined => {
	return ENTIDADES.find(e => e.key === key);
};

/**
 * Get display name by value
 */
export const getEntidadeDisplayName = (value: string): string => {
	const entidade = getEntidadeByValue(value);
	return entidade?.displayName || value;
};
