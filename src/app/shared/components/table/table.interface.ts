export interface TableColumn {
    field: string;
    header: string;
    format?: (value: any, index?: number, row?: any) => string | number;
}
