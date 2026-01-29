export interface Warehouse {
    id: string;
    company: string;
    company_name: string;
    name: string;
    status: boolean;
    wh_type: 'storage' | 'production' | 'distribution' | 'returns';
    created_at: string;
}

export interface WarehouseDTO {
    company: string;
    name: string;
    wh_type: 'storage' | 'production' | 'distribution' | 'returns';
    status: boolean;
}

