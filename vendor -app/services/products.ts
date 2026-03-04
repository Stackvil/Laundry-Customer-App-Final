export interface Product {
    id: string;
    name: string;
    category: string;
    description?: string;
    image_url: string;
    price_per_kg?: number | string;
    weight?: string;
    weight_in_kg?: number;
    original_price?: number;
    discount_percentage?: number;
    is_available?: boolean;
}

export const getAllProducts = async (): Promise<Product[]> => {
    return [
        {
            id: '1',
            name: 'Shirt (Standard Wash)',
            category: 'Standard',
            description: 'Standard wash for shirts',
            image_url: 'https://via.placeholder.com/150',
            price_per_kg: 50,
            weight_in_kg: 0.3,
            is_available: true,
        },
        {
            id: '2',
            name: 'Pants (Standard Wash)',
            category: 'Standard',
            description: 'Standard wash for pants',
            image_url: 'https://via.placeholder.com/150',
            price_per_kg: 60,
            weight_in_kg: 0.5,
            is_available: true,
        },
    ];
};

export const getShopProducts = async (shopId: string): Promise<Product[]> => {
    return [];
};

export const getVendorShopId = async (): Promise<string | null> => {
    return 'shop_123';
};

export const syncProductToShop = async (
    shopId: string,
    productId: string,
    isAvailable: boolean,
    price: number
): Promise<{ success: boolean; error?: string }> => {
    console.log(`Syncing product ${productId} for shop ${shopId}: available=${isAvailable}, price=${price}`);
    return { success: true };
};
