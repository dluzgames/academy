import json
import requests

def fetch_taco():
    url = "https://raw.githubusercontent.com/marcelosanto/tabela_taco/master/tabela_alimentos.json"
    response = requests.get(url)
    data = response.json()
    
    foods = []
    for item in data:
        foods.append({
            "id": f"taco-{item['id']}",
            "name": item['description'],
            "calories": item.get('energy_kcal', 0),
            "protein": item.get('protein_g', 0),
            "carbs": item.get('carbohydrate_g', 0),
            "fats": item.get('lipid_g', 0)
        })
    return foods

def fetch_tbca():
    url = "https://raw.githubusercontent.com/raul-rznd/web-scraping-tbca/main/alimentos.txt"
    response = requests.get(url)
    text = response.text
    
    foods = []
    
    # Try as standard JSON list
    try:
        data = json.loads(text)
        if isinstance(data, list):
            for i, item in enumerate(data):
                foods.append(process_tbca_item(i, item))
            return foods
    except:
        pass
    
    # Try as line-by-line JSON (or similar)
    lines = text.strip().split('\n')
    for i, line in enumerate(lines):
        try:
            line = line.strip()
            if not line: continue
            # If line ends with comma and we are not in a list, remove it
            if line.endswith(','): line = line[:-1]
            
            item = json.loads(line)
            foods.append(process_tbca_item(i, item))
        except Exception as e:
            # Maybe it's just concatenated objects? Very hard to parse without a proper separator
            # But let's try to find potential JSON start/end if needed.
            # Usually split('\n') or split('}{') helps.
            continue
            
    return foods

def process_tbca_item(i, item):
    return {
        "id": f"tbca-{i}",
        "name": item.get('nome', item.get('Nome', 'Desconhecido')),
        "calories": item.get('energia_kcal', item.get('Energia', 0)),
        "protein": item.get('proteina_g', item.get('Proteína', 0)),
        "carbs": item.get('carboidrato_disponivel_g', item.get('Carboidrato', 0)),
        "fats": item.get('lipideos_g', item.get('Lipídeos', 0))
    }

def fetch_noizwaves():
    url = "https://raw.githubusercontent.com/noizwaves/nutrition/master/data/food.json"
    response = requests.get(url)
    data = response.json()
    foods = []
    for item in data:
        nut = item.get('nutrition-per-100g', item.get('nutrition-per-100ml', {}))
        if not nut: continue
        
        # Energy in noizwaves is usually kJ, but let's check
        energy_kj = nut.get('energy', 0)
        calories = round(float(energy_kj) / 4.184, 1) if energy_kj else 0
        
        foods.append({
            "id": f"global-{item['id']}",
            "name": item['name'],
            "calories": calories,
            "protein": nut.get('protein', 0),
            "carbs": nut.get('carbohydrate', 0),
            "fats": nut.get('fat', 0)
        })
    return foods

def main():
    print("Fetching TACO...")
    taco_foods = fetch_taco()
    print(f"Found {len(taco_foods)} foods in TACO.")
    
    print("Fetching TBCA...")
    tbca_foods = fetch_tbca()
    print(f"Found {len(tbca_foods)} foods in TBCA.")
    
    print("Fetching Global (Noizwaves)...")
    global_foods = fetch_noizwaves()
    print(f"Found {len(global_foods)} global foods.")
    
    all_foods = taco_foods + tbca_foods + global_foods
    
    # Cleaning data: replace "NA", "Tr", etc with 0
    clean_foods = []
    for food in all_foods:
        for key in ['calories', 'protein', 'carbs', 'fats']:
            val = food[key]
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
                
        # Round values for neatness
        food['calories'] = round(float(food['calories']), 1)
        food['protein'] = round(float(food['protein']), 2)
        food['carbs'] = round(float(food['carbs']), 2)
        food['fats'] = round(float(food['fats']), 2)
        
        clean_foods.append(food)

    print(f"Total foods: {len(clean_foods)}")
    
    with open('lib/foods.json', 'w', encoding='utf-8') as f:
        json.dump(clean_foods, f, ensure_ascii=False, indent=2)
    print("Saved to lib/foods.json")

if __name__ == "__main__":
    main()
