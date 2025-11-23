import { IdiomaInterface, AVAILABLE_LANGUAGES } from "@/models";

export const useLanguageHook = () => {
    return {
        data: AVAILABLE_LANGUAGES,
        isLoading: false,
        error: null
    };
};