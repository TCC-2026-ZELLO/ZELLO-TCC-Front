import { SubmitBookingUseCase } from "./application/booking/BookingStrategies";
import { CustomizeScreenUseCase } from "./application/customization/CustomizeScreenUseCase";
import { getLocaleStrategy } from "./application/i18n/LocaleFormattingStrategy";
import { RegisterAccountUseCase } from "./application/registration/RegistrationStrategies";
import { eventBus, exchangeRateGateway, storage } from "./bootstrap";
import type { ILocaleProvider, ITokenProvider } from "./domain/ports";
import { CachedAvailabilityRepository } from "./infrastructure/decorators/CachedAvailabilityRepository";
import { ThrottledGeocodingGateway } from "./infrastructure/decorators/ThrottledGeocodingGateway";
import {
    BrowserGeolocationAdapter,
    CnpjLookupGateway,
    NominatimGeocodingAdapter,
    ViaCepGateway,
} from "./infrastructure/gateways/ExternalGateways";
import {
    AcceptLanguageInterceptor,
    AuthTokenInterceptor,
    ContentTypeInterceptor,
    FetchHttpClient,
    UnauthorizedResponseInterceptor,
    UuidGuardInterceptor,
} from "./infrastructure/http/HttpClient";
import {
    HttpAppointmentRepository,
    HttpAuthRepository,
    HttpAvailabilityRepository,
    HttpBusinessRepository,
    HttpBusinessTeamRepository,
    HttpCatalogRepository,
    HttpProfessionalRepository,
    HttpSearchRepository,
    HttpUserRepository,
} from "./infrastructure/repositories/ApiRepositories";
import { accessToken, API, idioma } from "../store/appState";

const localeProvider: ILocaleProvider = {
    getLanguage: () => idioma(),
    getBcp47Locale: () => getLocaleStrategy(idioma()).bcp47,
};

const tokenProvider: ITokenProvider = {
    getAccessToken: () => accessToken(),
};

const httpClient = new FetchHttpClient(API, [
    new UuidGuardInterceptor(),
    new AcceptLanguageInterceptor(localeProvider),
    new AuthTokenInterceptor(tokenProvider),
    new ContentTypeInterceptor(),
    new UnauthorizedResponseInterceptor(eventBus),
]);

const authRepo = new HttpAuthRepository(httpClient);
const userRepo = new HttpUserRepository(httpClient);
const appointmentRepo = new HttpAppointmentRepository(httpClient);
const rawAvailabilityRepo = new HttpAvailabilityRepository(httpClient);
const availabilityRepo = new CachedAvailabilityRepository(rawAvailabilityRepo);
const businessRepo = new HttpBusinessRepository(httpClient);
const businessTeamRepo = new HttpBusinessTeamRepository(httpClient);
const catalogRepo = new HttpCatalogRepository(httpClient);
const professionalRepo = new HttpProfessionalRepository(httpClient);
const searchRepo = new HttpSearchRepository(httpClient);

const contactEmail = import.meta.env.VITE_NOMINATIM_EMAIL as string | undefined;
const geocodingGateway = new ThrottledGeocodingGateway(
    new NominatimGeocodingAdapter(localeProvider, contactEmail),
    1000,
);
const geolocationGateway = new BrowserGeolocationAdapter();
const viaCepGateway = new ViaCepGateway();
const cnpjLookupGateway = new CnpjLookupGateway(httpClient);

const submitBookingUseCase = new SubmitBookingUseCase(appointmentRepo);
const registerAccountUseCase = new RegisterAccountUseCase(userRepo);
const customizeScreenUseCase = new CustomizeScreenUseCase(storage);

export const container = {
    eventBus,
    storage,
    localeProvider,
    tokenProvider,
    httpClient,
    exchangeRateGateway,
    geocodingGateway,
    geolocationGateway,
    viaCepGateway,
    cnpjLookupGateway,
    authRepo,
    userRepo,
    appointmentRepo,
    availabilityRepo,
    businessRepo,
    businessTeamRepo,
    catalogRepo,
    professionalRepo,
    searchRepo,
    submitBookingUseCase,
    registerAccountUseCase,
    customizeScreenUseCase,
} as const;
