import { cmsServices, defineInstitution, patternTemplate } from "../../core/define";
import { kbank10First9, kbank14First79 } from "../branch-rules";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const kbank = defineInstitution({
  id: "kbank",
  code: "089",
  nameKo: "K뱅크",
  nameEn: "K Bank",
  category: "bank",
  aliases: ["K뱅크", "케이뱅크", "Kbank"],
  userBaseMillions: 15,
  patterns: [
    {
      template: patternTemplate("XXX-XXX-XXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      note: "개인/법인 실계좌 (3-3-6)",
    },
    {
      template: patternTemplate("X-XXXXXXXXX"),
      kind: "incoming-only",
      services: cmsServices("virtualAccount"),
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["9"],
      branchRule: kbank10First9,
      note: "비대면 실명인증 시 입금전용",
    },
    {
      template: patternTemplate("XX-XXX-XXXX-XXXX"),
      kind: "incoming-only",
      services: cmsServices("virtualAccount", "directCredit"),
    },
    {
      template: patternTemplate("XXX-XXXX-XXX-XXXX"),
      kind: "virtual",
      services: cmsServices("virtualAccount"),
      branchRule: kbank14First79,
    },
  ],
});
