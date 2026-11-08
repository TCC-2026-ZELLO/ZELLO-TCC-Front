import { container } from "../core/container";

export const businessService = {
    getById: (id: string) => container.businessRepo.getById(id),

    getTeam: (id: string) => container.businessTeamRepo.listByBusiness(id),

    getCatalog: (id: string) => container.catalogRepo.listByBusiness(id),

    getProfile: (id: string) => container.businessRepo.getById(id),

    getGallery: (id: string) => container.businessRepo.getGallery(id),

    updateProfile: (id: string, data: Record<string, unknown>) =>
        container.businessRepo.updateProfile(id, data),

    updatePhoto: (id: string, file: File) => container.businessRepo.updatePhoto(id, file),

    updateBanner: (id: string, file: File) => container.businessRepo.updateBanner(id, file),

    addGalleryImage: (id: string, file: File) =>
        container.businessRepo.addGalleryImage(id, file),

    deleteGalleryImage: (businessId: string, imageId: string) =>
        container.businessRepo.deleteGalleryImage(businessId, imageId),
};