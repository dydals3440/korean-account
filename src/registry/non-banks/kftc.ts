import { defineInstitution } from "../../core/define-institution";

export const kftc = /* @__PURE__ */ defineInstitution({
  id: "kftc",
  code: "099",
  nameKo: "금융결제원",
  nameEn: "Korea Financial Telecommunications & Clearings Institute",
  category: "clearing",
  aliases: ["금융결제원", "KFTC"],
  patterns: [],
  notes: "청산 기관 — customer-facing 계좌 없음",
});
