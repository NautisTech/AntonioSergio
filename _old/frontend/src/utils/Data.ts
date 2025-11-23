import { parseISO, isValid, format, isEqual, isAfter, isBefore } from "date-fns";

export function isDataBetween(date: Date, start?: Date, end?: Date): boolean {
    if (!date) return false;
    if (start && end) {
        return (isAfter(date, start) || isEqual(date, start)) && (isBefore(date, end) || isEqual(date, end));
    }
    if (start) {
        return isAfter(date, start) || isEqual(date, start);
    }
    if (end) {
        return isBefore(date, end) || isEqual(date, end);
    }
    return true;
}