"use client";
import { createContext, useContext, useMemo, useState } from "react";

type Draft = {
  first_name: string;
  last_name: string;
  address: string;
  phone_number: string;
  email: string;
  password: string;
};

type Plan = {
  total_month: number;
  total_cost: number;
} | null;

type SignupContextValue = {
  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;
  clear: () => void;
  selectedPlan: Plan;
  setSelectedPlan: (plan: Plan) => void;
};

const SignupContext = createContext<SignupContextValue | null>(null);

const emptyDraft: Draft = {
  first_name: "",
  last_name: "",
  address: "",
  phone_number: "",
  email: "",
  password: "",
};

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [selectedPlan, setSelectedPlan] = useState<Plan>(null);

  const updateDraft = (patch: Partial<Draft>) => {
    setDraft((curr) => ({ ...curr, ...patch }));
  };

  const clear = () => {
    setDraft(emptyDraft);
    setSelectedPlan(null);
  };

  const value = useMemo(
    () => ({
      draft,
      updateDraft,
      clear,
      selectedPlan,
      setSelectedPlan,
    }),
    [draft, selectedPlan]
  );

  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>;
}

export function useSignupStore() {
  const ctx = useContext(SignupContext);
  if (!ctx) {
    throw new Error("useSignupStore must be used within SignupProvider");
  }
  return ctx;
}
