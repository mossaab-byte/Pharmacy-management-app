# Complete Setup Guide: Stock Management & Sales Fix

## 🚨 Priority Issues to Fix

### 1. **Backend Server Status**
The backend Django server needs to be running for both inventory and sales to work.

**To Start Backend:**
```bash
# Navigate to backend directory
cd "C:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend"

# Activate virtual environment and start server
..\venv\Scripts\activate
python manage.py runserver 8000
```

**Verify Server is Running:**
- Check: `http://localhost:8000/admin/`
- Should see Django admin login page

### 2. **Stock Management Setup** 

#### A) Add Test Inventory (Essential for Testing)
Run this script to add test medicines to your inventory:
```bash
# In backend directory with activated venv
python setup_test_inventory.py
```

This creates:
- 5 test medicines (Paracetamol, Aspirin, Ibuprofen, Amoxicillin, Vitamin C)
- Various stock levels (including low stock for testing)
- Proper pricing and minimum stock levels

#### B) Access Stock Management
- Go to: `http://localhost:3000/inventory`
- New simplified interface with debugging
- Features:
  - View all inventory items
  - Add/Remove stock with reasons
  - See low stock warnings
  - Debug information panel

### 3. **Sales Management Fix**

#### Issue: "Failed to load sales" Error
**Root Cause**: Backend API endpoint not responding properly

**Debugging Steps:**
1. **Check Backend Server**: Ensure `python manage.py runserver 8000` is running
2. **Test API Directly**: Visit `http://localhost:8000/sales/sales/` in browser
3. **Check Authentication**: Ensure you're logged in

#### Quick Fix for Sales Page:
The sales management page (`/sales`) should work once backend is running. If it doesn't:

**Check Console Errors:**
- Open browser Developer Tools (F12)
- Check Console tab for errors
- Look for network errors in Network tab

### 4. **Complete Workflow Test**

Once both backend and frontend are running:

#### Step 1: Add Inventory
1. Go to `/inventory`
2. Verify test medicines are loaded
3. Add stock to any medicine with 0 quantity
4. Test both "Add Stock" and "Remove Stock" functions

#### Step 2: Test Sales
1. Go to `/sales/stable` (working sales form)
2. Try to create a sale with medicines that have stock > 0
3. Verify sale completes and stock reduces automatically

## 🔧 Technical Details

### Frontend Changes Made:
- **SimpleInventoryPage.js**: New streamlined inventory management
- **Router Updated**: Points to SimpleInventoryPage for `/inventory`
- **Debug Logging**: Comprehensive logging in inventory operations
- **SimpleCustomerCreateModal.js**: Debug version for customer creation

### Backend APIs Used:
- **Inventory**: `/pharmacy/pharmacy-medicines/`
- **Add Stock**: `/pharmacy/pharmacy-medicines/{id}/add_stock/`
- **Remove Stock**: `/pharmacy/pharmacy-medicines/{id}/reduce_stock/`
- **Sales**: `/sales/sales/`

### Database Models:
- **PharmacyMedicine**: Links pharmacy to medicines with stock quantities
- **InventoryLog**: Tracks all stock movements (in/out/adjustments)
- **Medicine**: Base medicine information
- **Sale/SaleItem**: Sales transactions

## 🎯 Immediate Action Plan

### Phase 1: Get Backend Running ⚡
```bash
# Terminal 1: Backend
cd "C:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend"
..\venv\Scripts\activate
python manage.py runserver 8000
```

### Phase 2: Add Test Data ⚡
```bash
# Terminal 2: Setup data (while server running in Terminal 1)
cd "C:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend"
..\venv\Scripts\activate
python setup_test_inventory.py
```

### Phase 3: Test Frontend ⚡
```bash
# Terminal 3: Frontend (if not already running)
cd "C:\Users\mohammed\Documents\APPLICATION_PHARMACIE\frontend"
npm start
```

### Phase 4: Verify Everything Works ⚡
1. **Inventory Test**: `localhost:3000/inventory` - Should show medicines with stock
2. **Sales Test**: `localhost:3000/sales/stable` - Should load and allow creating sales
3. **Stock Adjustment Test**: Use +/- buttons in inventory to adjust stock
4. **Sales Creation Test**: Create a sale and verify stock decreases

## 🐛 Troubleshooting

### If Inventory Shows "No items found":
- Check backend server is running (`localhost:8000`)
- Run `setup_test_inventory.py` to add test data
- Check browser console for API errors

### If Sales Page Shows "Failed to load":
- Verify backend server running
- Check `localhost:8000/sales/sales/` responds with data
- Clear browser cache and reload

### If Stock Adjustments Don't Work:
- Check debug log panel in inventory page
- Verify medicine IDs are correct
- Check backend logs for API errors

## 📋 Features Available

### Stock Management:
✅ View all inventory items
✅ Add stock (with reasons: Purchase, Transfer In, Manual Adjustment)
✅ Remove stock (with reasons: Sale, Expired, Damaged, Transfer Out)
✅ Low stock warnings (red badges)
✅ Search functionality
✅ Debug logging
✅ Real-time stock updates

### Sales Integration:
✅ Stock automatically reduces on sale
✅ Inventory logs track all movements
✅ Prevent sales when stock is 0
✅ Customer creation within sales workflow

## 🎉 Success Criteria

You'll know everything is working when:
1. **Inventory page** shows medicines with quantities
2. **Add/Remove stock buttons** work and update quantities immediately
3. **Sales page** loads without errors
4. **Creating a sale** reduces stock automatically
5. **Debug panels** show successful API calls

---

**Next Step**: Start the backend server and run the inventory setup script. This will give you a working foundation for both stock management and sales testing!
