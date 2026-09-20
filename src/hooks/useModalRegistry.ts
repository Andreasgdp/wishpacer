import { useCallback, useState } from "react";
import type { ComputedWishItem, Plan } from "../types/plan.js";

export type ModalType =
  | "createPlan"
  | "editPlan"
  | "addWish"
  | "editWish"
  | "settings"
  | "globalSettings"
  | "history"
  | "exportImport";

export interface ModalRegistryPayload {
  wishItem?: ComputedWishItem | null;
  plan?: Plan | null;
}

export interface ModalRegistry {
  activeModal: ModalType | null;
  editingWishItem: ComputedWishItem | null;
  editingPlanTarget: Plan | null;
  open: (modal: ModalType, payload?: ModalRegistryPayload) => void;
  close: () => void;
  isOpen: (modal: ModalType) => boolean;
}

export function useModalRegistry(): ModalRegistry {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [editingWishItem, setEditingWishItem] = useState<ComputedWishItem | null>(null);
  const [editingPlanTarget, setEditingPlanTarget] = useState<Plan | null>(null);

  const open = useCallback((modal: ModalType, payload?: ModalRegistryPayload) => {
    setEditingWishItem(payload?.wishItem ?? null);
    setEditingPlanTarget(payload?.plan ?? null);
    setActiveModal(modal);
  }, []);

  const close = useCallback(() => {
    setActiveModal(null);
    setEditingWishItem(null);
    setEditingPlanTarget(null);
  }, []);

  const isOpen = useCallback(
    (modal: ModalType) => {
      return activeModal === modal;
    },
    [activeModal]
  );

  return {
    activeModal,
    editingWishItem,
    editingPlanTarget,
    open,
    close,
    isOpen,
  };
}
