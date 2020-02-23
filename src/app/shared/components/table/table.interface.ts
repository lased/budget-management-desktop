export interface TableColumn {
    field: string;
    header: string;
    sortable?: boolean;
    format?: (value: any, index?: number, row?: any) => string | number;
}
