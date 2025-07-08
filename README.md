# 🏥 Pharmacy Management System

A comprehensive, production-ready pharmacy management application built with Django REST Framework and React.js. This system manages medicines, inventory, sales, purchases, customers, suppliers, and provides detailed analytics and reporting.

## 🌟 Features

### 💊 Medicine Management
- **5,867 Moroccan medicines** pre-loaded database
- Advanced search and filtering capabilities
- Barcode scanning integration
- Detailed medicine specifications and information

### 📦 Inventory Management
- Real-time stock tracking and monitoring
- Low stock alerts and notifications
- Stock adjustment workflows
- Automated inventory updates from sales and purchases

### 💰 Sales & Purchase Management
- Intuitive point-of-sale interface
- Receipt generation and printing
- Purchase order management
- Supplier and customer integration

### 📊 Analytics & Reporting
- Financial dashboard with revenue/expense tracking
- Sales analytics and trends
- Inventory reports
- Customer and supplier analytics
- Export functionality for all reports

### 👥 User Management
- Role-based access control
- Staff user management
- Permission system
- User activity tracking

### 🔧 System Features
- Pharmacy profile and settings management
- Inter-pharmacy medicine exchanges
- Notification system
- Data backup and export
- Mobile-responsive design

## 🚀 Technology Stack

- **Backend**: Django REST Framework
- **Frontend**: React.js with Hooks
- **Database**: SQLite (development) / PostgreSQL (production)
- **Styling**: Tailwind CSS
- **Authentication**: JWT-based authentication
- **API**: RESTful APIs with comprehensive endpoints

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py import_medicines  # Load 5,867 medicines
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 📱 Screenshots

*Add screenshots of your application here*

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/register/` - User registration

### Core Modules
- `GET/POST /api/medicines/` - Medicine management
- `GET/POST /api/inventory/` - Inventory operations
- `GET/POST /api/sales/` - Sales transactions
- `GET/POST /api/purchases/` - Purchase orders
- `GET/POST /api/customers/` - Customer management
- `GET/POST /api/suppliers/` - Supplier management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mossaab** - [mossaab-byte](https://github.com/mossaab-byte)

## 🏆 Project Status

**Status**: Production Ready ✅  
**Completion**: 95% ✅  
**Last Updated**: January 2025 ✅

---

*Built with ❤️ for modern pharmacy management*
