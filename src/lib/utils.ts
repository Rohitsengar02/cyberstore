
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type DocumentData, Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const toJSON = (data: DocumentData): any => {
    // Convert Firestore Timestamps to strings
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            data[key] = toJSON(data[key]);
        }
    }
    return data;
};
