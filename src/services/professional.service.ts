import { container } from "../core/container";

export const professionalService = {
    getPublicProfile: (id: string) => container.professionalRepo.getPublicProfile(id),

    getServices: (id: string) => container.professionalRepo.getServices(id),

    getPortfolio: (id: string) => container.professionalRepo.getPortfolio(id),

    updateProfile: (data: { bio?: string; specialty?: string; visibilityStatus?: boolean }) =>
        container.professionalRepo.updateProfile(data),

    updateAvatar: (file: File) => container.professionalRepo.updateAvatar(file),

    updateBanner: (file: File) => container.professionalRepo.updateBanner(file),

    uploadPortfolio: (file: File) => container.professionalRepo.uploadPortfolioImage(file),

    deletePortfolioImage: (id: string) => container.professionalRepo.deletePortfolioImage(id),

    getQualifications: (id: string) => container.professionalRepo.getQualifications(id),

    addQualification: (data: {
        file: File;
        title: string;
        institution?: string;
        approvement?: number;
        type?: string;
        year?: number;
    }) => container.professionalRepo.addQualification(data),

    updateQualification: (
        id: string,
        data: {
            file?: File;
            title?: string;
            institution?: string;
            approvement?: number;
            type?: string;
            year?: number;
        },
    ) => container.professionalRepo.updateQualification(id, data),

    deleteQualification: (id: string) => container.professionalRepo.deleteQualification(id),
};