import type { LanguageCode } from "../../domain/entities/models";

type LocalizedTriplet = Record<LanguageCode, string>;

function normalizeKey(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

const CATEGORY_MAP: Record<string, LocalizedTriplet> = {
    todos: { PT: "Todos", EN: "All", ES: "Todos" },
    cabelo: { PT: "Cabelo", EN: "Hair", ES: "Cabello" },
    barba: { PT: "Barba", EN: "Beard", ES: "Barba" },
    barbearia: { PT: "Barbearia", EN: "Barbershop", ES: "Barbería" },
    estetica: { PT: "Estética", EN: "Aesthetics", ES: "Estética" },
    "estetica facial": { PT: "Estética Facial", EN: "Facial Aesthetics", ES: "Estética Facial" },
    "estetica corporal": { PT: "Estética Corporal", EN: "Body Aesthetics", ES: "Estética Corporal" },
    unhas: { PT: "Unhas", EN: "Nails", ES: "Uñas" },
    maquiagem: { PT: "Maquiagem", EN: "Makeup", ES: "Maquillaje" },
    massagem: { PT: "Massagem", EN: "Massage", ES: "Masaje" },
    depilacao: { PT: "Depilação", EN: "Hair Removal", ES: "Depilación" },
    sobrancelhas: { PT: "Sobrancelhas", EN: "Eyebrows", ES: "Cejas" },
};

const SPECIALTY_MAP: Record<string, LocalizedTriplet> = {
    "cabeleireiro(a)": { PT: "Cabeleireiro(a)", EN: "Hairstylist", ES: "Peluquero(a)" },
    cabeleireiro: { PT: "Cabeleireiro", EN: "Hairstylist", ES: "Peluquero" },
    cabeleireira: { PT: "Cabeleireira", EN: "Hairstylist", ES: "Peluquera" },
    "barbeiro(a)": { PT: "Barbeiro(a)", EN: "Barber", ES: "Barbero(a)" },
    barbeiro: { PT: "Barbeiro", EN: "Barber", ES: "Barbero" },
    "manicure/pedicure": { PT: "Manicure/Pedicure", EN: "Nail Technician", ES: "Manicurista/Pedicurista" },
    manicure: { PT: "Manicure", EN: "Manicurist", ES: "Manicurista" },
    esteticista: { PT: "Esteticista", EN: "Aesthetician", ES: "Esteticista" },
    "maquiador(a)": { PT: "Maquiador(a)", EN: "Makeup Artist", ES: "Maquillador(a)" },
    "designer de sobrancelhas": {
        PT: "Designer de Sobrancelhas",
        EN: "Eyebrow Designer",
        ES: "Diseñador(a) de Cejas",
    },
    "depilador(a)": { PT: "Depilador(a)", EN: "Waxing Specialist", ES: "Especialista en Depilación" },
    massagista: { PT: "Massagista", EN: "Massage Therapist", ES: "Masajista" },
    especialista: { PT: "Especialista", EN: "Specialist", ES: "Especialista" },
    outro: { PT: "Outro", EN: "Other", ES: "Otro" },
};

const SEGMENT_MAP: Record<string, LocalizedTriplet> = {
    "estetica e bem-estar": {
        PT: "Estética e Bem-estar",
        EN: "Beauty & Wellness",
        ES: "Estética y Bienestar",
    },
    "salao de beleza": { PT: "Salão de Beleza", EN: "Beauty Salon", ES: "Salón de Belleza" },
    barbearia: { PT: "Barbearia", EN: "Barbershop", ES: "Barbería" },
    clinica: { PT: "Clínica de Estética", EN: "Aesthetics Clinic", ES: "Clínica Estética" },
    spa: { PT: "Spa", EN: "Spa", ES: "Spa" },
};

const QUALIFICATION_MAP: Record<string, LocalizedTriplet> = {
    diploma: { PT: "Diploma", EN: "Degree", ES: "Diploma" },
    specialization: { PT: "Especialização", EN: "Specialization", ES: "Especialización" },
    course: { PT: "Curso", EN: "Course", ES: "Curso" },
    certification: { PT: "Certificação", EN: "Certification", ES: "Certificación" },
};

const ROLE_MAP: Record<string, LocalizedTriplet> = {
    client: { PT: "Cliente", EN: "Client", ES: "Cliente" },
    cliente: { PT: "Cliente", EN: "Client", ES: "Cliente" },
    professional: { PT: "Profissional", EN: "Professional", ES: "Profesional" },
    profissional: { PT: "Profissional", EN: "Professional", ES: "Profesional" },
    manager: { PT: "Gestor", EN: "Manager", ES: "Gestor" },
    estabelecimento: { PT: "Estabelecimento", EN: "Establishment", ES: "Establecimiento" },
};

const SERVICE_PHRASE_MAP: Array<[RegExp, LocalizedTriplet]> = [
    [/^corte masculino$/i, { PT: "Corte Masculino", EN: "Men's Haircut", ES: "Corte Masculino" }],
    [/^corte feminino$/i, { PT: "Corte Feminino", EN: "Women's Haircut", ES: "Corte Femenino" }],
    [/^corte infantil$/i, { PT: "Corte Infantil", EN: "Kids' Haircut", ES: "Corte Infantil" }],
    [/^corte e barba$/i, { PT: "Corte e Barba", EN: "Haircut & Beard", ES: "Corte y Barba" }],
    [/^corte$/i, { PT: "Corte", EN: "Haircut", ES: "Corte" }],
    [/^escova$/i, { PT: "Escova", EN: "Blowout", ES: "Cepillado" }],
    [/^coloracao$|^coloração$/i, { PT: "Coloração", EN: "Hair Coloring", ES: "Coloración" }],
    [/^hidratacao$|^hidratação$/i, { PT: "Hidratação", EN: "Deep Conditioning", ES: "Hidratación" }],
    [/^barba completa$/i, { PT: "Barba Completa", EN: "Full Beard Trim", ES: "Barba Completa" }],
    [/^barba terapia$|^barboterapia$/i, { PT: "Barboterapia", EN: "Hot Towel Beard Therapy", ES: "Barboterapia" }],
    [/^barba$/i, { PT: "Barba", EN: "Beard Trim", ES: "Arreglo de Barba" }],
    [/^limpeza de pele$/i, { PT: "Limpeza de Pele", EN: "Deep Facial Cleansing", ES: "Limpieza Facial" }],
    [/^design de sobrancelhas?$/i, { PT: "Design de Sobrancelhas", EN: "Eyebrow Shaping", ES: "Diseño de Cejas" }],
    [/^manicure e pedicure$/i, { PT: "Manicure e Pedicure", EN: "Manicure & Pedicure", ES: "Manicura y Pedicura" }],
    [/^manicure$/i, { PT: "Manicure", EN: "Manicure", ES: "Manicura" }],
    [/^pedicure$/i, { PT: "Pedicure", EN: "Pedicure", ES: "Pedicura" }],
    [/^maquiagem social$/i, { PT: "Maquiagem Social", EN: "Event Makeup", ES: "Maquillaje Social" }],
    [/^massagem relaxante$/i, { PT: "Massagem Relaxante", EN: "Relaxing Massage", ES: "Masaje Relajante" }],
    [/^drenagem linfatica$|^drenagem linfática$/i, { PT: "Drenagem Linfática", EN: "Lymphatic Drainage", ES: "Drenaje Linfático" }],
];

const API_ERROR_MAP: Array<[RegExp, LocalizedTriplet]> = [
    [
        /credenciais inv[aá]lidas|invalid credentials|unauthorized/i,
        {
            PT: "E-mail ou senha inválidos.",
            EN: "Invalid email or password.",
            ES: "Correo o contraseña inválidos.",
        },
    ],
    [
        /sess[aã]o expirada|session expired/i,
        {
            PT: "Sua sessão expirou. Faça login novamente.",
            EN: "Your session has expired. Please sign in again.",
            ES: "Tu sesión ha expirado. Inicia sesión nuevamente.",
        },
    ],
    [
        /hor[aá]rio n[aã]o est[aá] mais dispon[ií]vel|conflito|already booked/i,
        {
            PT: "Este horário não está mais disponível. Selecione outro horário.",
            EN: "This time slot is no longer available. Please choose another time.",
            ES: "Este horario ya no está disponible. Elige otro horario.",
        },
    ],
    [
        /e-?mail j[aá] cadastrado|already exists/i,
        {
            PT: "Este dado já está cadastrado no sistema.",
            EN: "This record is already registered in the system.",
            ES: "Este dato ya está registrado en el sistema.",
        },
    ],
];

const DAYS_SHORT: Record<LanguageCode, readonly string[]> = {
    PT: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    EN: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ES: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
};

export const DomainDataLocalizer = {
    category(raw: string | undefined | null, lang: LanguageCode): string {
        if (!raw) return "";
        const entry = CATEGORY_MAP[normalizeKey(raw)];
        return entry ? entry[lang] : raw;
    },

    specialty(raw: string | undefined | null, lang: LanguageCode): string {
        if (!raw) return SPECIALTY_MAP.especialista[lang];
        const entry = SPECIALTY_MAP[normalizeKey(raw)];
        return entry ? entry[lang] : raw;
    },

    segment(raw: string | undefined | null, lang: LanguageCode): string {
        if (!raw) return SEGMENT_MAP["estetica e bem-estar"][lang];
        const entry = SEGMENT_MAP[normalizeKey(raw)];
        return entry ? entry[lang] : raw;
    },

    qualificationType(raw: string | undefined | null, lang: LanguageCode): string {
        if (!raw) return QUALIFICATION_MAP.certification[lang];
        const entry = QUALIFICATION_MAP[normalizeKey(raw)];
        return entry ? entry[lang] : raw;
    },

    role(raw: string | undefined | null, lang: LanguageCode): string {
        if (!raw) return ROLE_MAP.cliente[lang];
        const entry = ROLE_MAP[normalizeKey(raw)];
        return entry ? entry[lang] : raw;
    },

    dayShort(dayOfWeekZeroSunday: number, lang: LanguageCode): string {
        const safe = ((dayOfWeekZeroSunday % 7) + 7) % 7;
        return DAYS_SHORT[lang][safe];
    },

    serviceName(raw: string | undefined | null, lang: LanguageCode): string {
        if (!raw) return "";
        if (lang === "PT") return raw;
        const trimmed = raw.trim();
        for (const [pattern, triplet] of SERVICE_PHRASE_MAP) {
            if (pattern.test(trimmed)) return triplet[lang];
        }
        if (trimmed.includes("+")) {
            return trimmed
                .split("+")
                .map((part) => DomainDataLocalizer.serviceName(part.trim(), lang))
                .join(" + ");
        }
        return raw;
    },

    serviceList(commaSeparated: string | undefined | null, lang: LanguageCode): string {
        if (!commaSeparated) return "";
        if (lang === "PT") return commaSeparated;
        return commaSeparated
            .split(",")
            .map((part) => DomainDataLocalizer.serviceName(part.trim(), lang))
            .join(", ");
    },

    apiError(rawMessage: string | undefined | null, lang: LanguageCode, fallback = ""): string {
        if (!rawMessage) return fallback;
        for (const [pattern, triplet] of API_ERROR_MAP) {
            if (pattern.test(rawMessage)) return triplet[lang];
        }
        return rawMessage;
    },
};
