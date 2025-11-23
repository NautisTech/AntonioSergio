
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';
import { Eqavet } from '@/components/site/Eqavet';

export default function EqavetPage() {
    const { t } = useTranslation("school");

    return (
        <>
            <PageTitle title={t("eqavet.title")} subtitle={t("eqavet.subtitle")} />
            <Eqavet />
        </>
    );
}
