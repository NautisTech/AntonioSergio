
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';
import { FAQ } from "@/components/site/FAQ";

export default function FAQPage() {
    const { t } = useTranslation("secretary");

    return (
        <>
            <PageTitle title={t("faq.title")} subtitle={t("faq.subtitle")} />
            <FAQ />
        </>
    );
}