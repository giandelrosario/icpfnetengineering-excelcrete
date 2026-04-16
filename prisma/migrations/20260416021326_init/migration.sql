-- CreateTable
CREATE TABLE "SSSTable" (
    "id" SERIAL NOT NULL,
    "salary_range_from" DOUBLE PRECISION NOT NULL,
    "salary_range_to" DOUBLE PRECISION NOT NULL,
    "msc_ss" DOUBLE PRECISION NOT NULL,
    "msc_mpf" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "er_ss" DOUBLE PRECISION NOT NULL,
    "er_mpf" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "er_ec" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ee_ss" DOUBLE PRECISION NOT NULL,
    "ee_mpf" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "SSSTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerShare" (
    "id" SERIAL NOT NULL,
    "sss_share" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "philhealth_share" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "pagibig_share" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployerShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "civil_status" TEXT NOT NULL,
    "citizenship" TEXT NOT NULL,
    "religion" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "birth_place" TEXT,
    "email" TEXT,
    "contact_no" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "hire_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeRelative" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "first_name" TEXT,
    "middle_name" TEXT,
    "last_name" TEXT,
    "relationship" TEXT,
    "contact_no" TEXT,
    "address" TEXT,
    "occupation" TEXT NOT NULL DEFAULT 'UNEMLOYED',
    "birth_date" TIMESTAMP(3),
    "birth_place" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeRelative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryHistory" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSSSettings" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "sss_no" TEXT,
    "ee_share" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SSSSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhilhealthSettings" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "philhealth_no" TEXT,
    "ee_share" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhilhealthSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagIBIGSettings" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "pagibig_no" TEXT,
    "ee_share" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagIBIGSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BIRSettings" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "tin_no" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BIRSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollLogs" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "gross_pay" DOUBLE PRECISION NOT NULL,
    "net_pay" DOUBLE PRECISION NOT NULL,
    "pay_period" TEXT NOT NULL,
    "payroll_month" TEXT NOT NULL,
    "payroll_year" INTEGER NOT NULL,
    "process_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollLogsBenefits" (
    "id" SERIAL NOT NULL,
    "payroll_logs_id" INTEGER NOT NULL,
    "benefit_title" TEXT NOT NULL,
    "benefit_key" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollLogsBenefits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SSSSettings_employee_id_key" ON "SSSSettings"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "PhilhealthSettings_employee_id_key" ON "PhilhealthSettings"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "PagIBIGSettings_employee_id_key" ON "PagIBIGSettings"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "BIRSettings_employee_id_key" ON "BIRSettings"("employee_id");

-- AddForeignKey
ALTER TABLE "EmployeeRelative" ADD CONSTRAINT "EmployeeRelative_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryHistory" ADD CONSTRAINT "SalaryHistory_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSSSettings" ADD CONSTRAINT "SSSSettings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhilhealthSettings" ADD CONSTRAINT "PhilhealthSettings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagIBIGSettings" ADD CONSTRAINT "PagIBIGSettings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BIRSettings" ADD CONSTRAINT "BIRSettings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollLogs" ADD CONSTRAINT "PayrollLogs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollLogsBenefits" ADD CONSTRAINT "PayrollLogsBenefits_payroll_logs_id_fkey" FOREIGN KEY ("payroll_logs_id") REFERENCES "PayrollLogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
