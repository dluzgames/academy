"""
Merge all food databases into a single unified foods.json.
Sources:
  1. Existing foods.json (TACO + TBCA: ~6,265 items)
  2. global-foods.json (curated international foods: 300 items)
"""
import json
import os

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    lib_dir = os.path.join(base_dir, 'lib')
    
    # Load existing Brazilian foods
    existing_path = os.path.join(lib_dir, 'foods.json')
    with open(existing_path, 'r', encoding='utf-8') as f:
        existing_foods = json.load(f)
    print(f"Existing foods (TACO + TBCA): {len(existing_foods)}")
    
    # Load curated global foods
    global_path = os.path.join(lib_dir, 'global-foods.json')
    with open(global_path, 'r', encoding='utf-8') as f:
        global_foods = json.load(f)
    print(f"Global foods (curated): {len(global_foods)}")
    
    # Check for duplicate IDs
    existing_ids = {f['id'] for f in existing_foods}
    new_global = [f for f in global_foods if f['id'] not in existing_ids]
    print(f"New global foods (no duplicates): {len(new_global)}")
    
    # Merge all
    all_foods = existing_foods + new_global
    
    # Clean all values
    for food in all_foods:
        for key in ['calories', 'protein', 'carbs', 'fats']:
            val = food.get(key, 0)
            if isinstance(val, str):
                if val in ["NA", "Tr", "", "N/A"]:
                    food[key] = 0
                else:
                    try:
                        food[key] = float(val.replace(',', '.'))
                    except:
                        food[key] = 0
            elif val is None:
                food[key] = 0
            food[key] = round(float(food[key]), 2)
    
    print(f"\nTotal unified foods: {len(all_foods)}")
    
    # Save unified database
    output_path = os.path.join(lib_dir, 'foods.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_foods, f, ensure_ascii=False, indent=2)
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    main()
