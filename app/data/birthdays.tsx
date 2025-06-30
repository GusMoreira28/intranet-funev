// app/data/birthdays.ts

export interface Birthday {
    name: string;
    date: string;
    photo: string;
    month: string;
}

export const allBirthdays: Birthday[] = [
    { name: 'João da Silva', date: '28 de Junho', photo: 'JD', month: 'Junho' },
    { name: 'Maria Andrade', date: '05 de Julho', photo: 'MA', month: 'Julho' },
    { name: 'Pedro Souza', date: '15 de Julho', photo: 'PS', month: 'Julho' },
    { name: 'Ana Fernandes', date: '22 de Julho', photo: 'AF', month: 'Julho' },
    { name: 'Carlos Oliveira', date: '03 de Agosto', photo: 'CO', month: 'Agosto' },
    { name: 'Mariana Costa', date: '12 de Agosto', photo: 'MC', month: 'Agosto' },
    { name: 'Rafael Pereira', date: '01 de Setembro', photo: 'RP', month: 'Setembro' },
    { name: 'Paula Santos', date: '10 de Setembro', photo: 'PS', month: 'Setembro' },
    { name: 'Fernanda Lima', date: '18 de Outubro', photo: 'FL', month: 'Outubro' },
    { name: 'Gabriel Mendes', date: '03 de Novembro', photo: 'GM', month: 'Novembro' },
    { name: 'Isabela Reis', date: '29 de Dezembro', photo: 'IR', month: 'Dezembro' },
    { name: 'Lucas Santos', date: '01 de Janeiro', photo: 'LS', month: 'Janeiro' },
    { name: 'Sofia Pereira', date: '10 de Fevereiro', photo: 'SP', month: 'Fevereiro' },
    { name: 'Diego Costa', date: '20 de Março', photo: 'DC', month: 'Março' },
    { name: 'Laura Almeida', date: '05 de Abril', photo: 'LA', month: 'Abril' },
    { name: 'Bruno Gomes', date: '14 de Maio', photo: 'BG', month: 'Maio' },
];