DROP DATABASE IF EXISTS inventory_app;
CREATE DATABASE inventory_app;
USE inventory_app;

CREATE TABLE Products (
  prod_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Warehouses (
  wh_id INT AUTO_INCREMENT PRIMARY KEY,
  location VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Inventory (
  inv_id INT AUTO_INCREMENT PRIMARY KEY,
  prod_id INT NOT NULL,
  wh_id INT NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0,
  safety_stock INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (prod_id) REFERENCES Products(prod_id) ON DELETE RESTRICT,
  FOREIGN KEY (wh_id) REFERENCES Warehouses(wh_id) ON DELETE CASCADE
);

CREATE TABLE Suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  rating TINYINT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT,
  prod_id INT NOT NULL,
  qty INT NOT NULL,
  order_date DATE DEFAULT (CURRENT_DATE()),
  expected_date DATE,
  status ENUM('Placed','Shipped','Delivered','Completed','Cancelled') DEFAULT 'Placed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id) ON DELETE SET NULL,
  FOREIGN KEY (prod_id) REFERENCES Products(prod_id) ON DELETE RESTRICT
);

CREATE TABLE Sales (
  sale_id INT AUTO_INCREMENT PRIMARY KEY,
  prod_id INT NOT NULL,
  wh_id INT NOT NULL,
  sale_qty INT NOT NULL,
  sale_date DATE DEFAULT (CURRENT_DATE()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prod_id) REFERENCES Products(prod_id) ON DELETE RESTRICT,
  FOREIGN KEY (wh_id) REFERENCES Warehouses(wh_id) ON DELETE RESTRICT
);

CREATE TABLE Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','client') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ClientOrders (
  corder_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  prod_id INT NOT NULL,
  wh_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  order_date DATE DEFAULT (CURRENT_DATE()),
  status ENUM('Placed','Shipped','Delivered','Cancelled') DEFAULT 'Placed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (prod_id) REFERENCES Products(prod_id) ON DELETE RESTRICT,
  FOREIGN KEY (wh_id) REFERENCES Warehouses(wh_id) ON DELETE RESTRICT
);

DELIMITER $$
CREATE TRIGGER trg_after_client_order
AFTER INSERT ON ClientOrders
FOR EACH ROW
BEGIN
  INSERT INTO Sales(prod_id, wh_id, sale_qty, sale_date)
  VALUES (NEW.prod_id, NEW.wh_id, NEW.qty, NEW.order_date);

  UPDATE Inventory
  SET stock_qty = stock_qty - NEW.qty,
      last_updated = CURRENT_TIMESTAMP
  WHERE prod_id = NEW.prod_id AND wh_id = NEW.wh_id;
END$$
DELIMITER ;

CREATE INDEX idx_inventory_prod_wh ON Inventory(prod_id, wh_id);
CREATE INDEX idx_sales_prod_date ON Sales(prod_id, sale_date);

INSERT INTO Warehouses (location) VALUES ('Main Warehouse'), ('Secondary Warehouse');
INSERT INTO Products (name, category, unit_price) VALUES ('Widget A','Widgets',10.00),('Gadget B','Gadgets',15.50);
INSERT INTO Inventory (prod_id, wh_id, stock_qty, safety_stock) VALUES (1,1,100,20),(2,1,50,10),(1,2,30,10);
INSERT INTO Suppliers (company_name, rating) VALUES ('Acme Supplies',4),('Global Parts',3);
