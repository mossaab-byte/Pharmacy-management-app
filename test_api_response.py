import requests

response = requests.get('http://localhost:8000/api/purchases/purchases/')
print('Status:', response.status_code)

if response.status_code == 200:
    data = response.json()
    print('Response type:', type(data))
    
    if isinstance(data, dict) and 'results' in data:
        purchases = data['results']
        print(f'Found {len(purchases)} purchases')
        
        for i, p in enumerate(purchases[:3]):
            print(f'\nPurchase {i+1}:')
            print(f'  ID: {p.get("id")}')
            print(f'  total: {p.get("total")}')
            print(f'  total_amount: {p.get("total_amount")}')
            print(f'  supplier_name: {p.get("supplier_name")}')
            print(f'  items_count: {p.get("items_count")}')
            print(f'  status: {p.get("status")}')
            print(f'  date: {p.get("date")}')
    else:
        print('Unexpected response format')
        print('Keys:', list(data.keys()) if isinstance(data, dict) else 'Not a dict')
        
else:
    print('Error:', response.text)
