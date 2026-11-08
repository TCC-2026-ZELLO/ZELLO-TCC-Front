import type { Appointment } from "../../domain/entities/models";
import type { IAppointmentRepository } from "../../domain/ports";

export type BookingMode = "create" | "reschedule" | "propose";

export interface BookingExecutionContext {
    appointmentId?: string;
    businessId: string;
    serviceId: string;
    professionalId?: string;
    date: string;
    startTime: string;
}

export interface BookingSubmissionStrategy {
    readonly mode: BookingMode;
    validateContext(ctx: BookingExecutionContext): boolean;
    execute(repo: IAppointmentRepository, ctx: BookingExecutionContext): Promise<Appointment>;
}

export class CreateBookingStrategy implements BookingSubmissionStrategy {
    readonly mode = "create" as const;

    validateContext(ctx: BookingExecutionContext): boolean {
        return Boolean(ctx.businessId && ctx.serviceId && ctx.date && ctx.startTime);
    }

    execute(repo: IAppointmentRepository, ctx: BookingExecutionContext): Promise<Appointment> {
        return repo.create({
            businessId: ctx.businessId,
            serviceId: ctx.serviceId,
            professionalId: ctx.professionalId,
            date: ctx.date,
            startTime: ctx.startTime,
        });
    }
}

export class RescheduleBookingStrategy implements BookingSubmissionStrategy {
    readonly mode = "reschedule" as const;

    validateContext(ctx: BookingExecutionContext): boolean {
        return Boolean(ctx.appointmentId && ctx.date && ctx.startTime);
    }

    execute(repo: IAppointmentRepository, ctx: BookingExecutionContext): Promise<Appointment> {
        return repo.reschedule(ctx.appointmentId as string, {
            date: ctx.date,
            startTime: ctx.startTime,
        });
    }
}

export class ProposeBookingStrategy implements BookingSubmissionStrategy {
    readonly mode = "propose" as const;

    validateContext(ctx: BookingExecutionContext): boolean {
        return Boolean(ctx.appointmentId && ctx.date && ctx.startTime);
    }

    execute(repo: IAppointmentRepository, ctx: BookingExecutionContext): Promise<Appointment> {
        return repo.proposeReschedule(ctx.appointmentId as string, {
            date: ctx.date,
            startTime: ctx.startTime,
        });
    }
}

const STRATEGIES: Record<BookingMode, BookingSubmissionStrategy> = {
    create: new CreateBookingStrategy(),
    reschedule: new RescheduleBookingStrategy(),
    propose: new ProposeBookingStrategy(),
};

export class SubmitBookingUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    getStrategy(mode: BookingMode): BookingSubmissionStrategy {
        return STRATEGIES[mode] ?? STRATEGIES.create;
    }

    async execute(mode: BookingMode, context: BookingExecutionContext): Promise<Appointment> {
        const strategy = this.getStrategy(mode);
        if (!strategy.validateContext(context)) {
            throw new Error("BOOKING_INVALID_CONTEXT");
        }
        return strategy.execute(this.appointmentRepo, context);
    }
}
