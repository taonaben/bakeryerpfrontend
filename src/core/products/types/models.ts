export interface product{
    id: string;
    sku: string;
    name: string;
    company: string;
    category: string;
    unit_of_measure: string;
    unit_of_measure_display: string;
    created_at: string;
}

export interface productDTO{
    name: string;
    category: string;
    unit_of_measure: string;
}