# 💻 Computer Store Web App

A simple and practical web application designed to help small businesses showcase and sell **laptops and desktop computers online**.
The main goal is to make it easier to reach more customers from anywhere, while keeping everything **simple, clear, and easy to manage**.

---

## 🚀 Features

### 🛍️ Customer Side

* Browse available laptops and desktop computers
* View product details
* Contact the store via WhatsApp to place orders

### 🔐 Admin Side

* Secure login system
* Add new products
* Edit product information (price, stock, description)
* Delete products
* Manage inventory easily

---

## 🧱 Tech Stack

* **Backend:** FastAPI (Python)
* **Database:** SQLite
* **Frontend:** HTML, CSS, JavaScript

---

## ⚙️ How to Run

### 1. Setup backend

```bash

pip install -r requirements.txt

uvicorn main:app --reload

```

Backend runs on:

```

http://127.0.0.1:8000

```

---

### 2. Open frontend

Open:

```

frontend/pages/index.html

```

in your browser

---

## 🔑 Admin Access

```

username: admin  

password: 1234  

```

---

## 📦 Project Structure

```

project/

│

├── backend/

│   ├── main.py

│   ├── routers/

│   ├── models/

│   └── database.db

│

├── frontend/

│   ├── pages/

│   └── assets/

│

└── README.md

```

---

## 📱 Order Flow

1. Customer browses available products
2. Selects a laptop or desktop
3. Clicks "Order"
4. WhatsApp opens with a prefilled message
5. Store owner confirms and handles the order manually

---

## 🎯 Purpose

This project is built specifically for **small businesses** that want to:

* Reach more customers beyond their physical location
* Have an online presence without high costs
* Manage their products in a simple and efficient way

It focuses on **simplicity and usability**, avoiding unnecessary complexity.

---

## 💾 Important Notes

* The database file (`.db`) contains all products → **make backups regularly**
* This is a simple MVP (Minimum Viable Product)
* No online payment system is included (orders handled via WhatsApp)

---

## ✨ Future Improvements

* Online payment integration
* More advanced product filtering
* Improved UI/UX
* Deployment with custom domain
* Basic analytics (sales, popular products)

---

## 📬 Contact

For any questions or improvements, feel free to reach out.

---

**Built to help small businesses grow online in a simple and effective way.**
