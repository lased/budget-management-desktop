export interface TableColumn {
    field: string;
    header: string;
    span?: number;
    sortable?: boolean;
    format?: (value: any, index?: number, row?: any) => string | number;
}
