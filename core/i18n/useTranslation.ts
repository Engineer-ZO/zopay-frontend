"use client";

import { useLanguage } from "./useLanguage";

// Import translation modules
import enCommon from "@/messages/en/common.json";
import enNav from "@/messages/en/nav.json";
import enFooter from "@/messages/en/footer.json";
import enMarketing from "@/messages/en/marketing.json";

import frCommon from "@/messages/fr/common.json";
import frNav from "@/messages/fr/nav.json";
import frFooter from "@/messages/fr/footer.json";
import frMarketing from "@/messages/fr/marketing.json";

type TranslationModule = Record<string, any>;

export function useTranslation(namespace: string = "common") {
    const { language } = useLanguage();

    const getTranslations = (): TranslationModule => {
        if (language === "fr") {
            switch (namespace) {
                case "common": return frCommon;
                case "nav": return frNav;
                case "footer": return frFooter;
                case "marketing": return frMarketing;
                default: return frCommon;
            }
        } else {
            switch (namespace) {
                case "common": return enCommon;
                case "nav": return enNav;
                case "footer": return enFooter;
                case "marketing": return enMarketing;
                default: return enCommon;
            }
        }
    };

    const translations = getTranslations();

    const t = (key: string): string => {
        const keys = key.split(".");
        let value: any = translations;

        for (const k of keys) {
            if (value === undefined || value === null) break;
            value = value[k];
        }

        return typeof value === "string" ? value : key;
    };

    return { t, language };
}
