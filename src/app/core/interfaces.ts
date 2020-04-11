export enum RecordType {
    income = 0,
    expense = 1
}

export interface QRData {
    t?: string; // дата и время покупки
    s?: number; // итоговая сумма покупки с копейками
    fn?: string; // заводской номер фискального накопителя (ФН)
    i?: string; // номер фискальных данных (ФД)
    fp?: string; // фискальный признак данных (ФПД)
    n?: number; // номер чека в фискальном накопителе
}

export interface Receipt {
    dateTime: string;
    totalSum: number;
    retailPlaceAddress: string;
    nds10: number;
    nds18: number;
    items: ReceiptItem[];
}

export interface ReceiptItem {
    quantity: number;
    price: number;
    sum?: number;
    name: string;
}

export interface FnsAccount {
    phone: string;
    email?: string;
    name?: string;
    password: string;
}
