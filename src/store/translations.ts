export const translations = {
    PT: {
        sidebar: {
            clientName: "Ana Clara Matos",
            clientTier: "Tier Ouro • 2.610 pts",
            profName: "Studio Beleza",
            profTier: "Profissional Premium",
            nav: {
                home: "Início",
                newBooking: "Nova Reserva",
                myBookings: "Meus Agendamentos",
                favorites: "Favoritos",
                loyalty: "Fidelidade",
                //
                dashboard: "Dashboard",
                mySchedule: "Minha Agenda",
                portfolio: "Portifolio",
                ratings: "Avaliações",
                performance: "Performance",
                //
                business: "Negócio",
                team_schedule: "Agenda do Time",
                catalog: "Catálogo",
                financial: "Financeiro",
                professionals: "Profissionais",
                reports: "Relatórios",
                //
                account: "CONTA",
                settings: "Configurações",
                logout: "Sair"
            },
            brand: "Zello",
        },
        header: {
            home: "Início",
            badgeClient: "Cliente",
            badgeProf: "Profissional"
        },
        common: {
            currency: "R$",
            minutesShort: "min",
            cancel: "Cancelar",
            close: "Fechar",
            back: "Voltar",
            save: "Salvar",
            wait: "Aguarde...",
            retry: "Tentar novamente",
            genericError: "Não foi possível concluir a operação."
        },
        booking: {
            modes: {
                create: {
                    title: "Solicitar Reserva",
                    submit: "Confirmar Solicitação",
                    submitting: "Enviando...",
                    success: "Pedido enviado e aguarda aprovação"
                },
                reschedule: {
                    title: "Reagendar Atendimento",
                    submit: "Confirmar Novo Horário",
                    submitting: "Reagendando...",
                    success: "Agendamento remarcado com sucesso"
                },
                propose: {
                    title: "Propor Novo Horário",
                    submit: "Enviar Proposta",
                    submitting: "Enviando...",
                    success: "Proposta enviada ao cliente"
                }
            },
            proposeHint: "O cliente precisa aceitar a proposta. O aceite consome uma das trocas disponíveis do atendimento.",
            dateLabel: "Escolha a data",
            timeLabel: "Horários disponíveis",
            loadingSlots: "Carregando horários...",
            noSlots: "Nenhum horário disponível para esta data.",
            loadError: "Não foi possível carregar os horários.",
            missingContext: "Não foi possível identificar o serviço ou o estabelecimento desta reserva.",
            selectDateTime: "Selecione uma data e horário.",
            slotTaken: "Este horário não está mais disponível. Selecione outro horário.",
            limitReached: "Limite de reagendamentos atingido para este atendimento.",
            successTitle: "Sucesso!"
        },
        appointments: {
            title: "Meus Agendamentos",
            subtitle: "Acompanhe e gerencie as suas reservas de serviços.",
            loading: "Buscando seus agendamentos...",
            empty: "Você não possui agendamentos nesta categoria.",
            idPrefix: "ID:",
            filters: {
                all: "Todos",
                pending: "Pendentes",
                confirmed: "Confirmados",
                completed: "Concluídos",
                cancelled: "Cancelados"
            },
            status: {
                PENDING: "Aguardando Confirmação",
                CONFIRMED: "Confirmado",
                CANCELLED: "Cancelado",
                COMPLETED: "Confirmado: Presente",
                NO_SHOW: "No-Show"
            },
            /** NO_SHOW registrado pelo gestor (cancelledByRole = manager) */
            noShowByManager: "No-Show: Falta",
            reputation: {
                noShow: (count: number) => `No-Show: Você possui ${count} falta(s).`,
                noShowWarning: " Múltiplas faltas podem bloquear seus agendamentos!",
                streak: (count: number) => `Streak: ${count} agendamentos concluídos seguidos`
            },
            fallback: {
                service: "Serviço Indisponível",
                professional: "Profissional",
                business: "Estabelecimento"
            },
            reserved: "Horário Reservado",
            completed: "Serviço Concluído",
            reschedule: "Reagendar",
            remaining: (count: number, max: number) => `${count} de ${max} trocas restantes`,
            limitReachedShort: (max: number) => `Limite de ${max} trocas atingido`,
            limitReachedTitle: (max: number) => `Limite de ${max} reagendamentos atingido`,
            proposal: {
                text: (date: string, time: string) =>
                    `O estabelecimento propôs um novo horário: ${date} às ${time}`,
                hint: (max: number, count: number) =>
                    `Aceitar consome 1 das ${max} trocas deste atendimento (${count} restantes).`,
                accept: "Aceitar",
                decline: "Recusar"
            },
            cancelModal: {
                title: "Cancelar Agendamento",
                message: "Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.",
                confirm: "Confirmar Cancelamento"
            },
            cancelError: {
                title: "Aviso de Cancelamento",
                ok: "Entendido"
            },
            toasts: {
                cancelled: "Agendamento cancelado.",
                cancelError: "Erro ao cancelar agendamento.",
                proposalAccepted: "Novo horário confirmado.",
                proposalDeclined: "Proposta recusada.",
                proposalConflict: "Este horário não está mais disponível. Peça uma nova proposta.",
                respondError: "Não foi possível responder à proposta."
            }
        },
        publicProfile: {
            loading: "Carregando perfil do profissional...",
            verified: "Perfil Verificado",
            defaultSpecialty: "Especialista",
            defaultLocation: "Brasil",
            noRatings: "Sem avaliações ainda",
            ratingsSuffix: "(Avaliações)",
            bookNow: "Agendar Agora",
            noServicesTooltip: "Este profissional ainda não possui serviços disponíveis",
            about: "Sobre",
            noBio: "Nenhuma biografia disponível.",
            qualifications: "Qualificações",
            qualificationTypes: {
                diploma: "Diploma",
                specialization: "Especialização",
                course: "Curso",
                certification: "Certificação"
            },
            tabs: {
                services: "Serviços",
                portfolio: "Portfólio",
                reviews: "Avaliações"
            },
            loadingServices: "Carregando serviços...",
            noServices: "Nenhum serviço disponível no momento.",
            noBusinessWarning: "Serviço sem estabelecimento vinculado — indisponível para reserva.",
            book: "Reservar",
            noPortfolio: "Nenhuma foto no portfólio ainda.",
            portfolioAlt: "Trabalho de portfólio",
            noReviews: "Nenhuma avaliação disponível para este profissional.",
            defaultServiceName: "Serviço"
        },
        teamSchedule: {
            title: "Agenda da Equipe",
            subtitle: "Gestão de horários e agendamentos",
            pendingBadge: (count: number) => `${count} aguardando aprovação`,
            loading: "Carregando dados da agenda...",
            allProfessionals: "Todos",
            defaultProfessional: "Profissional",
            defaultClient: "Cliente",
            defaultService: "Serviço",
            tabs: {
                grid: "Grade da Equipe",
                pending: "Pendentes",
                hours: "Horário de Expediente",
                blocks: "Bloqueios"
            },
            pending: {
                loading: "Carregando pendentes...",
                empty: "Não há agendamentos pendentes no momento.",
                approve: "✓ Aprovar",
                propose: "⇄ Propor horário",
                reject: "✕ Recusar",
                refuseTitle: "Recusar Agendamento",
                refuseMessage: "Deseja realmente recusar este agendamento pendente? Esta ação não poderá ser desfeita.",
                refuseConfirm: "Confirmar Recusa",
                proposalSent: (date: string, time: string) =>
                    `Proposta enviada: ${date} às ${time} — aguardando resposta do cliente.`
            },
            details: {
                title: "Detalhes do Agendamento",
                service: "Serviço:",
                dateTime: "Data e Hora:",
                professional: "Profissional:",
                rescheduleCount: "Reagendamentos:",
                unknownProfessional: "Desconhecido",
                proposeNewTime: "Propor novo horário",
                pendingProposal: (date: string, time: string) =>
                    `Proposta pendente: ${date} às ${time}. Aguardando o cliente aceitar ou recusar.`,
                limitReached: (max: number) =>
                    `Limite de ${max} reagendamentos atingido — não é possível propor outro horário.`,
                registerNoShow: "Registrar No-Show",
                cancelWithReason: "Cancelar com Justificativa",
                penaltyApplied: "Penalidade de No-Show já aplicada ao cliente",
                autoReleased: "Horário liberado automaticamente: cliente ainda não recebeu no-show",
                revertNoShow: "Reverter No-Show",
                registerPresence: "Registrar Presença"
            },
            reputation: {
                highRisk: (count: number) => `Alto Risco: ${count} faltas seguidas`,
                recentNoShows: (count: number) => `Faltas recentes: ${count}`,
                streak: (count: number) => `Streak: ${count} agendamentos concluídos seguidos`
            },
            noShowModal: {
                mark: {
                    title: "Registrar No-Show",
                    message: "Confirmar a falta do cliente? A penalidade de No-Show será aplicada à reputação do cliente.",
                    confirm: "Confirmar No-Show"
                },
                revert: {
                    title: "Reverter No-Show",
                    message: "Deseja reverter este No-Show? A penalidade de falta será removida da reputação do cliente.",
                    confirm: "Reverter No-Show"
                },
                presence: {
                    title: "Registrar Presença",
                    message: "Deseja confirmar a presença do cliente? O agendamento será marcado como concluído e aumentará a pontuação do cliente.",
                    confirm: "Confirmar Presença"
                },
                markSuccess: "No-Show registrado.",
                markError: "Erro ao registrar No-Show.",
                revertSuccess: "No-Show revertido.",
                revertError: "Erro ao reverter No-Show."
            },
            justifiedCancel: {
                title: "Cancelamento Justificado",
                reasonLabel: "Motivo do Cancelamento",
                reasonPlaceholder: "Ex: Cliente teve emergência, erro nosso, etc.",
                affectsReputation: "Afeta a reputação do cliente? (Penaliza)",
                confirm: "Confirmar Cancelamento",
                reasonRequired: "Por favor, insira o motivo do cancelamento.",
                success: "Agendamento cancelado com justificativa.",
                error: "Erro ao cancelar."
            },
            hours: {
                title: "Horário de Funcionamento",
                daysLabel: "Dias de Funcionamento",
                days: {
                    sun: "Dom",
                    mon: "Seg",
                    tue: "Ter",
                    wed: "Qua",
                    thu: "Qui",
                    fri: "Sex",
                    sat: "Sáb"
                },
                opening: "ABERTURA",
                closing: "FECHAMENTO",
                lunchStart: "INÍCIO DO ALMOÇO",
                lunchEnd: "FIM DO ALMOÇO",
                save: "Salvar Horários",
                saving: "Salvando...",
                saved: "Horários salvos com sucesso!",
                saveError: "Erro ao salvar horários.",
                noBusiness: "Selecione uma empresa para configurar os horários."
            },
            blocks: {
                add: "+ Adicionar Bloqueio",
                empty: "Nenhum bloqueio registrado nesta data.",
                tag: "Bloqueio",
                wholeBusiness: "Todo o Estabelecimento",
                deleteTitle: "Remover Bloqueio",
                deleteMessage: "Deseja realmente remover este bloqueio de horário da agenda?",
                deleteConfirm: "Confirmar Remoção",
                deleted: "Bloqueio removido.",
                deleteError: "Erro ao apagar bloqueio.",
                modalTitle: "Novo Bloqueio",
                date: "Data",
                start: "Início",
                end: "Fim",
                reason: "Motivo",
                reasonPlaceholder: "Ex: Feriado, manutenção, almoço...",
                affects: "Afeta",
                save: "Salvar Bloqueio",
                created: "Bloqueio criado com sucesso!",
                requiredFields: "Preencha todos os campos obrigatórios.",
                createError: "Erro ao criar bloqueio.",
                confirmedConflict: "Conflito: Já existem horários confirmados neste intervalo.",
                pendingConflictTitle: "Conflito de Agendamentos Pendentes",
                pendingConflictQuestion: "Deseja forçar o bloqueio e cancelar esses agendamentos?",
                forceBlock: "Sim, forçar bloqueio",
                dontForce: "Não, cancelar"
            },
            statusUpdated: {
                approved: "Agendamento aprovado.",
                rejected: "Agendamento recusado.",
                error: "Erro ao atualizar status.",
                refuseError: "Erro ao recusar agendamento."
            }
        },
        settings: {
            title: "Configurações",
            profile: {
                title: "Perfil",
                photo: "Foto de Perfil",
                changePhoto: "Alterar foto",
                nameLabel: "NOME",
                phoneLabel: "TELEFONE",
                emailLabel: "E-MAIL",
                cityLabel: "CIDADE",
                saveBtn: "Salvar Alterações"
            },
            appearance: {
                title: "Aparência",
                language: "Idioma",
                theme: "Tema",
                lightMode: "Modo Claro",
                darkMode: "Modo Escuro"
            },
            notifications: {
                title: "Notificações",
                items: {
                    bookingConfirm: "Confirmação de agendamento",
                    reminder24h: "Lembrete 24h antes",
                    offers: "Ofertas e promoções",
                    loyaltyUpdates: "Atualizações de fidelidade",
                    appNews: "Novidades do (app)",
                    weeklySummary: "Resumo semanal por e-mail"
                }
            },
            security: {
                title: "Segurança",
                currentPassword: "SENHA ATUAL",
                newPassword: "NOVA SENHA",
                confirmPassword: "CONFIRMAR SENHA",
                changePasswordBtn: "Alterar Senha"
            }
        },
        reviews: {
            rateService: "Avaliar Atendimento",
            rateProfessional: "Avaliar Profissional",
            rateBusiness: "Avaliar Estabelecimento",
            targetType: "O que deseja avaliar?",
            professional: "Profissional",
            business: "Estabelecimento",
            commentLabel: "Deixe seu comentário (mín. 10 caracteres)",
            commentPlaceholder: "Conte como foi sua experiência...",
            submit: "Enviar Avaliação",
            success: "Avaliação enviada com sucesso!",
            error: "Erro ao enviar avaliação.",
            expired: "Prazo para avaliação expirou (30 dias).",
            readOnlyTitle: "Sua Avaliação",
            duplicateError: "Você já avaliou este item.",
            noReviews: "Nenhuma avaliação encontrada.",
            average: "Média de Avaliações",
            totalReviews: "Total de Avaliações"
        }
    },
    EN: {
        sidebar: {
            clientName: "Ana Clara Matos",
            clientTier: "Gold Tier • 2,610 pts",
            profName: "Beauty Studio",
            profTier: "Premium Professional",
            nav: {
                home: "Home",
                newBooking: "New Booking",
                myBookings: "My Bookings",
                favorites: "Favorites",
                loyalty: "Loyalty",
                //
                dashboard: "Dashboard",
                mySchedule: "My Schedule",
                portfolio: "Portifolio",
                ratings: "Ratings",
                performance: "Performance",
                //
                business: "Business",
                team_schedule: "Team Schedule",
                catalog: "Catalog",
                financial: "Financial",
                professionals: "Professionals",
                reports: "Reports",
                //
                account: "ACCOUNT",
                settings: "Settings",
                logout: "Log out"
            },
            brand: "Zello",
        },
        header: {
            home: "Home",
            badgeClient: "Client",
            badgeProf: "Professional"
        },
        common: {
            currency: "R$",
            minutesShort: "min",
            cancel: "Cancel",
            close: "Close",
            back: "Back",
            save: "Save",
            wait: "Please wait...",
            retry: "Try again",
            genericError: "The operation could not be completed."
        },
        booking: {
            modes: {
                create: {
                    title: "Request Booking",
                    submit: "Confirm Request",
                    submitting: "Sending...",
                    success: "Request sent and awaiting approval"
                },
                reschedule: {
                    title: "Reschedule Appointment",
                    submit: "Confirm New Time",
                    submitting: "Rescheduling...",
                    success: "Appointment rescheduled successfully"
                },
                propose: {
                    title: "Propose New Time",
                    submit: "Send Proposal",
                    submitting: "Sending...",
                    success: "Proposal sent to the client"
                }
            },
            proposeHint: "The client must accept the proposal. Accepting uses up one of the appointment's available changes.",
            dateLabel: "Pick a date",
            timeLabel: "Available times",
            loadingSlots: "Loading times...",
            noSlots: "No times available for this date.",
            loadError: "The available times could not be loaded.",
            missingContext: "We couldn't identify the service or the business for this booking.",
            selectDateTime: "Select a date and time.",
            slotTaken: "This time is no longer available. Please pick another one.",
            limitReached: "Reschedule limit reached for this appointment.",
            successTitle: "Success!"
        },
        appointments: {
            title: "My Appointments",
            subtitle: "Track and manage your service bookings.",
            loading: "Loading your appointments...",
            empty: "You have no appointments in this category.",
            idPrefix: "ID:",
            filters: {
                all: "All",
                pending: "Pending",
                confirmed: "Confirmed",
                completed: "Completed",
                cancelled: "Cancelled"
            },
            status: {
                PENDING: "Awaiting Confirmation",
                CONFIRMED: "Confirmed",
                CANCELLED: "Cancelled",
                COMPLETED: "Confirmed: Attended",
                NO_SHOW: "No-Show"
            },
            noShowByManager: "No-Show: Missed",
            reputation: {
                noShow: (count: number) => `No-Show: you have ${count} missed appointment(s).`,
                noShowWarning: " Repeated no-shows may block your bookings!",
                streak: (count: number) => `Streak: ${count} appointments completed in a row`
            },
            fallback: {
                service: "Service Unavailable",
                professional: "Professional",
                business: "Business"
            },
            reserved: "Time Reserved",
            completed: "Service Completed",
            reschedule: "Reschedule",
            remaining: (count: number, max: number) => `${count} of ${max} changes left`,
            limitReachedShort: (max: number) => `Limit of ${max} changes reached`,
            limitReachedTitle: (max: number) => `Limit of ${max} reschedules reached`,
            proposal: {
                text: (date: string, time: string) =>
                    `The business proposed a new time: ${date} at ${time}`,
                hint: (max: number, count: number) =>
                    `Accepting uses 1 of the ${max} changes for this appointment (${count} left).`,
                accept: "Accept",
                decline: "Decline"
            },
            cancelModal: {
                title: "Cancel Appointment",
                message: "Are you sure you want to cancel this appointment? This action cannot be undone.",
                confirm: "Confirm Cancellation"
            },
            cancelError: {
                title: "Cancellation Notice",
                ok: "Got it"
            },
            toasts: {
                cancelled: "Appointment cancelled.",
                cancelError: "Error cancelling the appointment.",
                proposalAccepted: "New time confirmed.",
                proposalDeclined: "Proposal declined.",
                proposalConflict: "This time is no longer available. Ask for a new proposal.",
                respondError: "The proposal could not be answered."
            }
        },
        publicProfile: {
            loading: "Loading professional profile...",
            verified: "Verified Profile",
            defaultSpecialty: "Specialist",
            defaultLocation: "Brazil",
            noRatings: "No ratings yet",
            ratingsSuffix: "(Ratings)",
            bookNow: "Book Now",
            noServicesTooltip: "This professional has no services available yet",
            about: "About",
            noBio: "No biography available.",
            qualifications: "Qualifications",
            qualificationTypes: {
                diploma: "Degree",
                specialization: "Specialization",
                course: "Course",
                certification: "Certification"
            },
            tabs: {
                services: "Services",
                portfolio: "Portfolio",
                reviews: "Reviews"
            },
            loadingServices: "Loading services...",
            noServices: "No services available at the moment.",
            noBusinessWarning: "Service not linked to a business — unavailable for booking.",
            book: "Book",
            noPortfolio: "No portfolio photos yet.",
            portfolioAlt: "Portfolio work",
            noReviews: "No reviews available for this professional.",
            defaultServiceName: "Service"
        },
        teamSchedule: {
            title: "Team Schedule",
            subtitle: "Manage working hours and appointments",
            pendingBadge: (count: number) => `${count} awaiting approval`,
            loading: "Loading schedule data...",
            allProfessionals: "All",
            defaultProfessional: "Professional",
            defaultClient: "Client",
            defaultService: "Service",
            tabs: {
                grid: "Team Grid",
                pending: "Pending",
                hours: "Working Hours",
                blocks: "Blocks"
            },
            pending: {
                loading: "Loading pending items...",
                empty: "There are no pending appointments right now.",
                approve: "✓ Approve",
                propose: "⇄ Propose time",
                reject: "✕ Reject",
                refuseTitle: "Reject Appointment",
                refuseMessage: "Do you really want to reject this pending appointment? This action cannot be undone.",
                refuseConfirm: "Confirm Rejection",
                proposalSent: (date: string, time: string) =>
                    `Proposal sent: ${date} at ${time} — awaiting the client's response.`
            },
            details: {
                title: "Appointment Details",
                service: "Service:",
                dateTime: "Date and Time:",
                professional: "Professional:",
                rescheduleCount: "Reschedules:",
                unknownProfessional: "Unknown",
                proposeNewTime: "Propose new time",
                pendingProposal: (date: string, time: string) =>
                    `Pending proposal: ${date} at ${time}. Awaiting the client to accept or decline.`,
                limitReached: (max: number) =>
                    `Limit of ${max} reschedules reached — a new time cannot be proposed.`,
                registerNoShow: "Register No-Show",
                cancelWithReason: "Cancel with Reason",
                penaltyApplied: "No-Show penalty already applied to the client",
                autoReleased: "Slot released automatically: the client has not received a no-show yet",
                revertNoShow: "Revert No-Show",
                registerPresence: "Register Attendance"
            },
            reputation: {
                highRisk: (count: number) => `High risk: ${count} no-shows in a row`,
                recentNoShows: (count: number) => `Recent no-shows: ${count}`,
                streak: (count: number) => `Streak: ${count} appointments completed in a row`
            },
            noShowModal: {
                mark: {
                    title: "Register No-Show",
                    message: "Confirm the client did not show up? The no-show penalty will be applied to their reputation.",
                    confirm: "Confirm No-Show"
                },
                revert: {
                    title: "Revert No-Show",
                    message: "Revert this no-show? The penalty will be removed from the client's reputation.",
                    confirm: "Revert No-Show"
                },
                presence: {
                    title: "Register Attendance",
                    message: "Confirm the client attended? The appointment will be marked as completed and improve their score.",
                    confirm: "Confirm Attendance"
                },
                markSuccess: "No-show registered.",
                markError: "Error registering the no-show.",
                revertSuccess: "No-show reverted.",
                revertError: "Error reverting the no-show."
            },
            justifiedCancel: {
                title: "Justified Cancellation",
                reasonLabel: "Cancellation reason",
                reasonPlaceholder: "E.g. client emergency, our mistake, etc.",
                affectsReputation: "Does it affect the client's reputation? (Penalises)",
                confirm: "Confirm Cancellation",
                reasonRequired: "Please enter the cancellation reason.",
                success: "Appointment cancelled with a reason.",
                error: "Error cancelling."
            },
            hours: {
                title: "Opening Hours",
                daysLabel: "Opening Days",
                days: {
                    sun: "Sun",
                    mon: "Mon",
                    tue: "Tue",
                    wed: "Wed",
                    thu: "Thu",
                    fri: "Fri",
                    sat: "Sat"
                },
                opening: "OPENING",
                closing: "CLOSING",
                lunchStart: "LUNCH START",
                lunchEnd: "LUNCH END",
                save: "Save Hours",
                saving: "Saving...",
                saved: "Hours saved successfully!",
                saveError: "Error saving the hours.",
                noBusiness: "Select a business to configure the hours."
            },
            blocks: {
                add: "+ Add Block",
                empty: "No blocks registered for this date.",
                tag: "Block",
                wholeBusiness: "Entire Business",
                deleteTitle: "Remove Block",
                deleteMessage: "Do you really want to remove this block from the schedule?",
                deleteConfirm: "Confirm Removal",
                deleted: "Block removed.",
                deleteError: "Error deleting the block.",
                modalTitle: "New Block",
                date: "Date",
                start: "Start",
                end: "End",
                reason: "Reason",
                reasonPlaceholder: "E.g. holiday, maintenance, lunch...",
                affects: "Affects",
                save: "Save Block",
                created: "Block created successfully!",
                requiredFields: "Fill in all required fields.",
                createError: "Error creating the block.",
                confirmedConflict: "Conflict: there are already confirmed appointments in this range.",
                pendingConflictTitle: "Pending Appointment Conflict",
                pendingConflictQuestion: "Do you want to force the block and cancel those appointments?",
                forceBlock: "Yes, force the block",
                dontForce: "No, cancel"
            },
            statusUpdated: {
                approved: "Appointment approved.",
                rejected: "Appointment rejected.",
                error: "Error updating the status.",
                refuseError: "Error rejecting the appointment."
            }
        },
        settings: {
            title: "Settings",
            profile: {
                title: "Profile",
                photo: "Profile Picture",
                changePhoto: "Change photo",
                nameLabel: "NAME",
                phoneLabel: "PHONE",
                emailLabel: "EMAIL",
                cityLabel: "CITY",
                saveBtn: "Save Changes"
            },
            appearance: {
                title: "Appearance",
                language: "Language",
                theme: "Theme",
                lightMode: "Light Mode",
                darkMode: "Dark Mode"
            },
            notifications: {
                title: "Notifications",
                items: {
                    bookingConfirm: "Booking confirmation",
                    reminder24h: "24h reminder",
                    offers: "Offers and promotions",
                    loyaltyUpdates: "Loyalty updates",
                    appNews: "App news",
                    weeklySummary: "Weekly summary via email"
                }
            },
            security: {
                title: "Security",
                currentPassword: "CURRENT PASSWORD",
                newPassword: "NEW PASSWORD",
                confirmPassword: "CONFIRM PASSWORD",
                changePasswordBtn: "Change Password"
            }
        },
        reviews: {
            rateService: "Rate Service",
            rateProfessional: "Rate Professional",
            rateBusiness: "Rate Business",
            targetType: "What do you want to rate?",
            professional: "Professional",
            business: "Business",
            commentLabel: "Leave a comment (min. 10 chars)",
            commentPlaceholder: "Tell us about your experience...",
            submit: "Submit Review",
            success: "Review submitted successfully!",
            error: "Error submitting review.",
            expired: "Time limit to review has expired (30 days).",
            readOnlyTitle: "Your Review",
            duplicateError: "You have already reviewed this item.",
            noReviews: "No reviews found.",
            average: "Average Rating",
            totalReviews: "Total Reviews"
        }
    }
} as const;

export type Language = keyof typeof translations;