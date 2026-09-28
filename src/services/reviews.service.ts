import { http } from "./api";

export interface Review {
    id: string;
    rating: number;
    comment: string;
    targetType: 'PROFESSIONAL' | 'BUSINESS';
    createdAt: string;
    client?: {
        name: string;
        photoUrl?: string;
    };
    professional?: {
        id: string;
        user?: {
            name: string;
        };
    };
    business?: {
        id: string;
        tradeName?: string;
    };
    // RF26 - Resposta do gestor/profissional ao comentário do cliente.
    responseText?: string | null;
    responseAuthor?: {
        id: string;
        name?: string;
    } | null;
    respondedAt?: string | null;
    responseUpdatedAt?: string | null;
}

export interface CreateReviewData {
    appointmentId: string;
    rating: number;
    comment: string;
    targetType: 'PROFESSIONAL' | 'BUSINESS';
}

export interface ReviewResponseData {
    text: string;
}

export const createReview = async (data: CreateReviewData): Promise<Review> => {
    return http.post<Review>("/reviews", data);
};

export const getReviewsByProfessional = async (professionalId: string): Promise<Review[]> => {
    return http.get<Review[]>(`/reviews/professional/${professionalId}`);
};

export const getReviewsByBusiness = async (businessId: string): Promise<Review[]> => {
    return http.get<Review[]>(`/reviews/business/${businessId}`);
};

export const getReviewsByAppointment = async (appointmentId: string): Promise<Review[]> => {
    return http.get<Review[]>(`/reviews/appointment/${appointmentId}`);
};

export const getMySentReviews = async (): Promise<Review[]> => {
    return http.get<Review[]>("/reviews/me/sent");
};

export const getMyReceivedReviews = async (): Promise<Review[]> => {
    return http.get<Review[]>("/reviews/me/received");
};

export const getBusinessReceivedReviews = async (businessId: string): Promise<Review[]> => {
    return http.get<Review[]>(`/reviews/business/${businessId}/received`);
};

// ==========================================================================
// RF26 - Responder aos comentários e avaliações dos clientes
// ==========================================================================

export const respondToReview = async (reviewId: string, data: ReviewResponseData): Promise<Review> => {
    return http.post<Review>(`/reviews/${reviewId}/response`, data);
};

export const updateReviewResponse = async (reviewId: string, data: ReviewResponseData): Promise<Review> => {
    return http.patch<Review>(`/reviews/${reviewId}/response`, data);
};

export const deleteReviewResponse = async (reviewId: string): Promise<Review> => {
    return http.delete<Review>(`/reviews/${reviewId}/response`);
};
