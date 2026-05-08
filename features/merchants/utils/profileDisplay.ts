import type {
    IndividualMerchantProfile,
    InstitutionMerchantProfile,
    Merchant,
    MerchantKind,
} from "@/features/merchants/types/index";

function str(v: unknown): string | undefined {
    if (v === null || v === undefined) return undefined;
    const s = String(v).trim();
    return s === "" ? undefined : s;
}

/** Normalize API object (camelCase or snake_case) into IndividualMerchantProfile */
export function normalizeIndividual(raw: unknown): IndividualMerchantProfile {
    if (!raw || typeof raw !== "object") return {};
    const o = raw as Record<string, unknown>;
    return {
        firstName: str(o.firstName ?? o.first_name),
        lastName: str(o.lastName ?? o.last_name),
        dateOfBirth: str(o.dateOfBirth ?? o.date_of_birth),
        gender: str(o.gender),
        phone: str(o.phone),
        address: str(o.address),
        idType: str(o.idType ?? o.id_type),
        idNumber: str(o.idNumber ?? o.id_number),
        niu: str(o.niu),
        doingBusinessAs: str(o.doingBusinessAs ?? o.doing_business_as),
    };
}

/** Normalize API object into InstitutionMerchantProfile */
export function normalizeInstitution(raw: unknown): InstitutionMerchantProfile {
    if (!raw || typeof raw !== "object") return {};
    const o = raw as Record<string, unknown>;
    return {
        institutionName: str(o.institutionName ?? o.institution_name),
        registrationNumber: str(o.registrationNumber ?? o.registration_number),
        dateOfCreation: str(o.dateOfCreation ?? o.date_of_creation),
        niu: str(o.niu),
        managerName: str(o.managerName ?? o.manager_name),
        managerContact: str(o.managerContact ?? o.manager_contact),
        managerAddress: str(o.managerAddress ?? o.manager_address),
        address: str(o.address),
        contactPhone: str(o.contactPhone ?? o.contact_phone),
        contactEmail: str(o.contactEmail ?? o.contact_email),
    };
}

export function resolveMerchantKind(m: Merchant): MerchantKind {
    const bt = (m.businessType || "").toUpperCase().trim();
    if (bt === "INDIVIDUAL") return "INDIVIDUAL";
    if (bt === "COMPANY") return "COMPANY";
    if (bt === "ASSOCIATION") return "ASSOCIATION";
    if (bt === "GROUP") return "GROUP";

    if (m.individual && typeof m.individual === "object" && Object.keys(m.individual).length > 0) {
        return "INDIVIDUAL";
    }
    if (m.institution && typeof m.institution === "object" && Object.keys(m.institution).length > 0) {
        const bt2 = (m.businessType || "").toUpperCase().trim();
        if (bt2 === "ASSOCIATION") return "ASSOCIATION";
        if (bt2 === "GROUP") return "GROUP";
        return "COMPANY";
    }
    return "LEGACY";
}

export function merchantKindLabel(kind: MerchantKind): string {
    switch (kind) {
        case "INDIVIDUAL":
            return "Individual";
        case "COMPANY":
            return "Company";
        case "ASSOCIATION":
            return "Association";
        case "GROUP":
            return "Group";
        default:
            return "Merchant";
    }
}

export function isInstitutionKind(kind: MerchantKind): boolean {
    return kind === "COMPANY" || kind === "ASSOCIATION" || kind === "GROUP";
}
