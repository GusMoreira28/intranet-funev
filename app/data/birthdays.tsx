// Interface para o formato de dado que o componente BirthdayCard e a lógica esperam
export interface Birthday {
    name: string;   // Nome completo (ex: "DENER PEREIRA CIRINO")
    date: string;   // Data formatada (ex: "04 de Julho")
    photo: string;  // Iniciais (ex: "DC")
    month: string;  // Nome do mês (ex: "Julho")
    role: string;   // Cargo (ex: "Analista de Sistemas")
}

// Interface para o formato de dado retornado diretamente pela sua API
export interface RawApiBirthday {
    nome: string; // Nome do aniversariante da API
    data: string; // Data do aniversariante da API (formato "DD/MM/YYYY")
    cargo: string; // Cargo do aniversariante da API
}
