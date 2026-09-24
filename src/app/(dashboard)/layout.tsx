"use client";

import React from "react";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ToastContainer } from "@/components/ui/ToastContainer";

import { InvoiceModal } from "@/components/modals/InvoiceModal";
import { DeliveryNoteModal } from "@/components/modals/DeliveryNoteModal";
import { ReceptionNoteModal } from "@/components/modals/ReceptionNoteModal";
import { AddStockInModal } from "@/components/modals/AddStockInModal";
import { AddStockOutModal } from "@/components/modals/AddStockOutModal";
import { TransferStockModal } from "@/components/modals/TransferStockModal";
import { AddPurchaseModal } from "@/components/modals/AddPurchaseModal";
import { AddSupplierModal } from "@/components/modals/AddSupplierModal";
import { EditSupplierModal } from "@/components/modals/EditSupplierModal";
import { AddClientModal } from "@/components/modals/AddClientModal";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { DebtSettlementModal } from "@/components/modals/DebtSettlementModal";
import { ClientDetailsModal } from "@/components/modals/ClientDetailsModal";
import { NewInventoryModal } from "@/components/modals/NewInventoryModal";
import { InventoryDetailsModal } from "@/components/modals/InventoryDetailsModal";
import { ManageCategoriesModal } from "@/components/modals/ManageCategoriesModal";
import { CashAuditModal } from "@/components/modals/CashAuditModal";
import { CashJournalModal } from "@/components/modals/CashJournalModal";
import { AddDepotModal } from "@/components/modals/AddDepotModal";
import { EditDepotModal } from "@/components/modals/EditDepotModal";
import { AddEmployeeModal } from "@/components/modals/AddEmployeeModal";
import { EditEmployeeModal } from "@/components/modals/EditEmployeeModal";
import { EmployeeDetailsModal } from "@/components/modals/EmployeeDetailsModal";
import { AddAdvanceModal } from "@/components/modals/AddAdvanceModal";
import { PayslipModal } from "@/components/modals/PayslipModal";
import { AddUserModal } from "@/components/modals/AddUserModal";
import { EditUserModal } from "@/components/modals/EditUserModal";
import { ResetPasswordModal } from "@/components/modals/ResetPasswordModal";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { EditProductModal } from "@/components/modals/EditProductModal";
import { EditPurchaseModal } from "@/components/modals/EditPurchaseModal";
import { PrintFinancialReportModal } from "@/components/modals/PrintFinancialReportModal";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

import { useApp } from "@/context/AppContext";
import { useRouter, usePathname } from "next/navigation";
import { hasPermission } from "@/lib/utils";

function ProtectedDashboardContent({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading, showToast, sidebarCollapsed } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/");
      return;
    }

    if (!isLoading && currentUser) {
      const moduleKey = pathname.replace('/', '').split('/')[0];
      if (moduleKey && moduleKey !== 'dashboard' && !hasPermission(currentUser, moduleKey)) {
        let redirectTarget = '/pos';
        if (hasPermission(currentUser, 'dashboard')) redirectTarget = '/dashboard';
        else if (hasPermission(currentUser, 'pos')) redirectTarget = '/pos';
        else if (hasPermission(currentUser, 'ventes')) redirectTarget = '/ventes';

        showToast(`Accès restreint : Le rôle "${currentUser.role.toUpperCase()}" n'a pas l'autorisation d'accéder au module "${moduleKey}".`, "error");
        router.push(redirectTarget);
      }
    }
  }, [currentUser, isLoading, pathname, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#050811] text-white flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Vérification de la session d'accès ERP...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans relative overflow-x-hidden">
      <Sidebar />
      <div className={`flex flex-col min-h-screen w-full min-w-0 transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[270px]"}`}>
        <Header />
        <main className="p-4 sm:p-7 flex-1 flex flex-col gap-6 w-full min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      <ToastContainer />
      <InvoiceModal />
      <DeliveryNoteModal />
      <ReceptionNoteModal />
      <AddStockInModal />
      <AddStockOutModal />
      <TransferStockModal />
      <AddPurchaseModal />
      <AddSupplierModal />
      <EditSupplierModal />
      <AddClientModal />
      <EditClientModal />
      <DebtSettlementModal />
      <ClientDetailsModal />
      <NewInventoryModal />
      <InventoryDetailsModal />
      <ManageCategoriesModal />
      <CashAuditModal />
      <CashJournalModal />
      <AddDepotModal />
      <EditDepotModal />
      <AddEmployeeModal />
      <EditEmployeeModal />
      <EmployeeDetailsModal />
      <AddAdvanceModal />
      <PayslipModal />
      <PrintFinancialReportModal />
      <AddUserModal />
      <EditUserModal />
      <ResetPasswordModal />
      <UserProfileModal />
      <EditProductModal />
      <EditPurchaseModal />
      <ConfirmModal />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedDashboardContent>
      {children}
    </ProtectedDashboardContent>
  );
}
