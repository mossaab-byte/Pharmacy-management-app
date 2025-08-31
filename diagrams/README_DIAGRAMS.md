# Pharmacy Management System - UML Diagrams Documentation

This document provides explanations for all UML diagrams in the pharmacy management system.

## Use Case Diagrams

### 1. User Authentication Use Cases (`use_case_auth.puml`)
**Brief Explanation:** This diagram shows the authentication and authorization use cases for different user roles. It illustrates how customers, pharmacists, and managers interact with the authentication system, including registration, login, logout, and profile management functionalities.

**Key Features:**
- Role-based access control
- Common authentication flows for all users
- Manager-specific permission management

### 2. Medicine Management Use Cases (`use_case_medicine.puml`)
**Brief Explanation:** This diagram depicts the medicine and inventory management capabilities available to different user roles. It shows how users can search, view, and manage medicines, with pharmacists and managers having additional privileges for adding, updating, and deleting medicines.

**Key Features:**
- Customer read-only access to medicines
- Pharmacist inventory management capabilities
- Manager full CRUD operations on medicines

### 3. Sales Management Use Cases (`use_case_sales.puml`)
**Brief Explanation:** This diagram illustrates the sales and order management processes. It shows how customers can place orders, how pharmacists process sales, and how managers can access comprehensive sales reporting and analytics.

**Key Features:**
- Customer order placement and tracking
- Pharmacist sales processing capabilities
- Manager reporting and analytics access

### 4. Supplier Management Use Cases (`use_case_supplier.puml`)
**Brief Explanation:** This diagram shows the supplier and purchase management functionalities available to pharmacists and managers. It demonstrates the complete supplier lifecycle from registration to payment processing.

**Key Features:**
- Supplier relationship management
- Purchase order creation and tracking
- Financial management and reporting

## Class Diagrams

### 1. Core Domain Classes (`class_core.puml`)
**Brief Explanation:** This diagram shows the fundamental domain entities of the pharmacy system including users, pharmacy, medicines, and suppliers. It represents the core business objects and their relationships that form the foundation of the system.

**Key Relationships:**
- Users belong to a specific pharmacy
- Medicines are supplied by suppliers
- Medicines are stocked in pharmacies

### 2. Sales Domain Classes (`class_sales.puml`)
**Brief Explanation:** This diagram illustrates the sales-related entities and their relationships. It shows how sales are composed of sale items, generate invoices, and process payments, providing a complete view of the sales transaction lifecycle.

**Key Features:**
- Sale composition with multiple items
- Invoice generation and management
- Payment processing and tracking

### 3. Purchase Domain Classes (`class_purchase.puml`)
**Brief Explanation:** This diagram depicts the purchase management entities including purchases, purchase items, supplier transactions, and inventory tracking. It shows how the system manages the procurement process and maintains inventory levels.

**Key Features:**
- Purchase order management
- Supplier financial transactions
- Inventory level tracking and alerts

## Sequence Diagrams

### 1. User Authentication Sequence (`sequence_auth.puml`)
**Brief Explanation:** This diagram shows the step-by-step process of user authentication, including credential validation, permission retrieval, and JWT token generation. It demonstrates the security flow from login attempt to successful authentication.

**Key Steps:**
- Credential submission and validation
- Permission and role verification
- Token generation and response

### 2. Medicine Search Sequence (`sequence_medicine_search.puml`)
**Brief Explanation:** This diagram illustrates how users search for medicines in the system. It shows the interaction between the frontend, API, and database to retrieve and display medicine information with real-time stock levels.

**Key Features:**
- Dynamic search functionality
- Stock level integration
- Result filtering and display

### 3. Sales Process Sequence (`sequence_sales.puml`)
**Brief Explanation:** This diagram depicts the complete sales transaction process from item selection to receipt generation. It shows how the system ensures stock availability, processes payments, and updates inventory in a transactional manner.

**Key Features:**
- Transaction integrity with rollback capability
- Real-time stock verification
- Automated inventory updates

### 4. Purchase Order Sequence (`sequence_purchase.puml`)
**Brief Explanation:** This diagram shows the purchase order creation process, including supplier selection, item specification, and financial transaction recording. It demonstrates how the system manages supplier relationships and inventory procurement.

**Key Features:**
- Supplier selection and management
- Purchase order creation and tracking
- Financial transaction recording

### 5. Inventory Management Sequence (`sequence_inventory.puml`)
**Brief Explanation:** This diagram illustrates the inventory management process, including stock level monitoring, low stock alerts, and manual inventory updates. It shows how the system maintains optimal stock levels and prevents stockouts.

**Key Features:**
- Automated low stock detection
- Alert generation and notification
- Manual stock adjustment capabilities

## Diagram Usage in Report

Each diagram is designed to be:
- **Self-contained**: Can be understood independently
- **Appropriately sized**: Suitable for inclusion in academic reports
- **Well-documented**: Includes clear explanations for context
- **Technically accurate**: Reflects the actual system implementation

## File Organization

All diagrams are stored in the `/diagrams` folder with descriptive names:
- Use case diagrams: `use_case_*.puml`
- Class diagrams: `class_*.puml`
- Sequence diagrams: `sequence_*.puml`

These diagrams can be rendered using PlantUML tools and included directly in your academic report with the provided explanations.
