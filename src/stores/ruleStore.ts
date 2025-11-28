import { defineStore } from "pinia";

export const useRuleStore = defineStore("rules", () => {
  const startDateRules = (value: unknown) => {
    const v = value as string | Date | null;
    if (!v) return "La fecha de inicio es requerida";
    const date = v instanceof Date ? v : new Date(v as string);
    if (isNaN(date.getTime())) return "Fecha de inicio inválida";
    const now = new Date();
    if (date < now)
      return "La fecha de inicio no puede ser anterior a la actual";
    return true;
  };

  const validateEndDate = (value: unknown, startDate: string | Date | null) => {
    const v = value as string | Date | null;
    if (!v) return "La fecha de fin es requerida";
    const end = v instanceof Date ? v : new Date(v as string);
    if (isNaN(end.getTime())) return "Fecha de fin inválida";

    if (!startDate) return "Selecciona la fecha de inicio primero";
    const start =
      startDate instanceof Date ? startDate : new Date(startDate as string);
    if (isNaN(start.getTime())) return "Fecha de inicio inválida";

    if (end <= start)
      return "La fecha de fin debe ser mayor que la fecha de inicio";
    return true;
  };

  return {
    startDateRules,
    validateEndDate,
  };
});
