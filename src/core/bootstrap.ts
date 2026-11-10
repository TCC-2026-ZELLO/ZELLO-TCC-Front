import { TypedEventBus } from "./infrastructure/events/EventBus";
import { ExchangeRateAdapter } from "./infrastructure/gateways/ExternalGateways";
import { LocalStorageAdapter } from "./infrastructure/storage/StorageAdapters";

export const eventBus = new TypedEventBus();
export const storage = new LocalStorageAdapter();
export const exchangeRateGateway = new ExchangeRateAdapter(storage);
