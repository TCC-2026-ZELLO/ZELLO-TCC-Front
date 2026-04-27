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
                ratings: "Avaliações",
                performance: "Performance",
                account: "ACCOUNT",
                //
                business: "Business",
                team_schedule: "Team Schedule",
                catalog: "Catalog",
                financial: "Financial",
                professionals: "Professionals",
                reports: "Reports",
                //
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
        }
    }
} as const;

export type Language = keyof typeof translations;