CREATE TYPE "HubStatus" AS ENUM ('active', 'inactive', 'unavailable');
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'unavailable');
CREATE TYPE "UserRole" AS ENUM ('admin', 'dispatcher', 'driver', 'business_manager');
CREATE TYPE "DeliveryStatus" AS ENUM ('delivered', 'planned', 'delivering', 'cancelled', 'blocked', 'delayed');
CREATE TYPE "InvoiceServiceType" AS ENUM ('express', 'standard', 'freight');
CREATE TYPE "InvoicePriority" AS ENUM ('urgent', 'high', 'standard', 'low');
CREATE TYPE "InvoiceStatus" AS ENUM ('quotation', 'purchase_order', 'invoice');
CREATE TYPE "EventType" AS ENUM ('note', 'info', 'warning', 'critical', 'fatal');
CREATE TYPE "EventStatus" AS ENUM ('waiting', 'resolved', 'information');
CREATE TYPE "CustomerStatus" AS ENUM ('active', 'inactive');

CREATE TABLE "Address" (
    "id" UUID NOT NULL,
    "address" TEXT,
    "street" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Hub" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "manager_id" UUID,
    "address_id" UUID,
    "name" TEXT,
    "phone_number" TEXT,
    "capacity_parcels_day" INTEGER,
    "status" "HubStatus",
    CONSTRAINT "Hub_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "hub_id" UUID,
    "firstname" TEXT,
    "lastname" TEXT,
    "phone_number" TEXT,
    "work_phone_number" TEXT,
    "email" TEXT,
    "work_email" TEXT,
    "hash_password" TEXT,
    "status" "UserStatus",
    "role" "UserRole",
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vehicle" (
    "id" UUID NOT NULL,
    "hub_id" UUID,
    "reference" TEXT NOT NULL,
    "type" TEXT,
    "license_plate" TEXT,
    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Driver" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "vehicle_id" UUID,
    "rating" DOUBLE PRECISION,
    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "hub_id" UUID,
    "address_id" UUID,
    "customer_name" TEXT,
    "customer_type" TEXT,
    "contact_firstname" TEXT,
    "contact_lastname" TEXT,
    "phone_number" TEXT,
    "email" TEXT,
    "status" "CustomerStatus",
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Invoice" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "hub_id" UUID NOT NULL,
    "pickup_address_id" UUID NOT NULL,
    "delivery_address_id" UUID NOT NULL,
    "business_manager_id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "service_type" "InvoiceServiceType",
    "priority" "InvoicePriority" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "payment_date" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "InvoiceStatus",
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Delivery" (
    "id" UUID NOT NULL,
    "invoices_id" UUID NOT NULL,
    "driver_id" UUID,
    "reference" TEXT NOT NULL,
    "status" "DeliveryStatus",
    "notes" TEXT,
    "position_history" JSONB,
    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Parcel" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryEvent" (
    "id" UUID NOT NULL,
    "delivery_id" UUID NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "type" "EventType" NOT NULL DEFAULT 'note',
    "status" "EventStatus" NOT NULL,
    "resolution_description" TEXT,
    "created_at" TIMESTAMP(3),
    "resolution_date" TIMESTAMP(3),
    CONSTRAINT "DeliveryEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Hub" ADD CONSTRAINT "Hub_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "Hub"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "Hub"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Driver_user_id_key" ON "Driver"("user_id");
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "Hub"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "Hub"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_pickup_address_id_fkey" FOREIGN KEY ("pickup_address_id") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_delivery_address_id_fkey" FOREIGN KEY ("delivery_address_id") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_business_manager_id_fkey" FOREIGN KEY ("business_manager_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_invoices_id_fkey" FOREIGN KEY ("invoices_id") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeliveryEvent" ADD CONSTRAINT "DeliveryEvent_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "Delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
