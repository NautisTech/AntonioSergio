/**
 * Newsletter API Module
 * Public exports for newsletter functionality
 */

export type { SubscribeNewsletterInput, NewsletterResponse } from "./types";
export { publicNewsletterAPI } from "./api";
export { useNewsletterSubscribe } from "./hooks";
