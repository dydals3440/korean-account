import { patternTemplate as T } from "../../core/pattern-template";
import { kbank10First9, kbank14First79 } from "../rules";
import { defineInstitution } from "../../core/define-institution";

export const kbank = /* @__PURE__ */ defineInstitution({
  id: "kbank",
  code: "089",
  nameKo: "K뱅크",
  nameEn: "K Bank",
  category: "bank",
  aliases: ["K뱅크", "케이뱅크", "Kbank"],
  userBaseMillions: 15,
  patterns: [
    // PDF p.13: 12 digits = product(4)-random(4)-serial(4), printed format 3-3-6.
    {
      template: T("XXX-XXX-XXXXXX"),
      kind: "new",
      note: "개인/법인 실계좌 (3-3-6)",
    },
    {
      template: T("X-XXXXXXXXX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["9"],
      branchRule: kbank10First9,
      note: "비대면 실명인증 시 입금전용",
    },
    // PDF: 13 digits `serial(2)-phone(3-4-4)` — no specific prefix enumerated.
    {
      template: T("XXX-XXX-XXXXXXX"),
      kind: "new",
    },
    // branchRule: prefix 7/9 → easy-transfer virtual account, otherwise → loan (여신)
    {
      template: T("XXX-XXXX-XXX-XXXX"),
      kind: "virtual",
      branchRule: kbank14First79,
    },
  ],
});
