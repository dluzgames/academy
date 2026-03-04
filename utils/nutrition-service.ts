import foodsData from '@/lib/foods.json';

export interface Food {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export const searchFood = (query: string): Food[] => {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return (foodsData as Food[]).filter(food => {
        const normalizedName = food.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedName.includes(normalizedQuery);
    }).slice(0, 10); // Return top 10 matches for better selection
};
