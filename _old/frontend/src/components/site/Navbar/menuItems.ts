"use client";
import { useTranslation } from "react-i18next";

export const useMenuItems = (isLoggedIn: boolean = false) => {
	const { t } = useTranslation(["navigation"]);

	return [
		{
			title: t("school.title"),
			items: [
				{
					title: t("school.about_us"),
					isLink: true,
					url: "/sobre-nos",
					subItems: [
						{
							title: t("school.subItems.welcome"),
							url: "/sobre-nos#welcome",
						},
						{
							title: t("school.subItems.mission_values"),
							url: "/sobre-nos#mission-values",
						},
						{
							title: t("school.subItems.educational_project"),
							url: "/sobre-nos#educational-project",
						},
					],
				},
				{
					title: t("school.structure"),
					isLink: false,
					subItems: [
						{
							title: t("school.subItems.facilities"),
							url: "/instalacoes",
						},
						{
							title: t("school.subItems.internal_regulations"),
							url: "/regulamento",
						},
						{
							title: t("school.subItems.organizational_chart"),
							url: "/organograma",
						},
					],
				},
				{
					title: t("school.education"),
					isLink: true,
					url: "/educacao",
					subItems: [
						{
							title: t("school.subItems.kindergarten"),
							url: "/educacao#jardim-infancia",
						},
						{
							title: t("school.subItems.primary_school"),
							url: "/educacao#primario",
						},
						{
							title: t("school.subItems.middle_school"),
							url: "/educacao#basico",
						},
						{
							title: t("school.subItems.high_school"),
							url: "/educacao#secundario",
						},
					],
				},
				{
					title: t("school.parents_association"),
					isLink: true,
					url: "/associacao-pais",
				},
				{ title: t("school.eqavet"), isLink: true, url: "/eqavet" },
			],
		},
		{
			title: t("secretary.title"),
			items: [
				{
					title: t("secretary.academic_information"),
					isLink: false,
					subItems: [
						{
							title: t("secretary.subItems.national_exams"),
							url: "/exames-nacionais",
						},
						{
							title: t("secretary.subItems.school_textbooks"),
							url: "/manuais-escolares",
						},
						{
							title: t("secretary.subItems.school_plan"),
							url: "/plano-escolar",
						},
						{ title: t("secretary.subItems.menu"), url: "/ementa" },
						{
							title: t(
								"secretary.subItems.professional_courses_regulations"
							),
							url: "/regulamento-cursos",
						},
					],
				},
				{
					title: t("secretary.processes_services"),
					isLink: false,
					subItems: [
						{
							title: t("secretary.subItems.registrations"),
							url: "/inscricoes",
						},
						{
							title: t("secretary.subItems.legislation"),
							url: "/legislacao",
						},
						{
							title: t("secretary.subItems.information"),
							url: "/informacoes",
						},
					],
				},
				{
					title: t("secretary.user_support"),
					isLink: false,
					subItems: [
						{
							title: t("secretary.subItems.tutorials"),
							url: "/tutoriais",
						},
						{ title: t("secretary.subItems.faq"), url: "/faq" },
					],
				},
			],
		},
		{
			title: t("media.title"),
			items: [
				{
					title: t("media.projects"),
					isLink: true,
					url: "/projetos",
					subItems: [],
				},
				{
					title: t("media.news"),
					isLink: true,
					url: "/blog",
					subItems: [],
				},
				{
					title: t("media.events"),
					isLink: true,
					url: "/eventos",
					subItems: [],
				},
			],
		},
		{ title: t("contacts.title"), url: "/contactos" },
		{
			title: t("links.title"),
			items: [
				{
					title: t("links.inovar"),
					isLink: true,
					subItems: [
						{
							title: t("links.subItems.students"),
							url: "https://inovar.antoniosergio.pt/InovarAlunos/Inicial.wgx",
						},
						{
							title: t("links.subItems.consultation"),
							url: "https://inovar.antoniosergio.pt/Inovarconsulta/app/index.html#/login",
						},
						{
							title: t("links.subItems.recurring"),
							url: "https://inovar.antoniosergio.pt/InovarRecorrente/Inicial.wgx",
						},
						{
							title: t("links.subItems.paa"),
							url: "https://inovar.antoniosergio.pt/InovarPAA/Inicial.wgx",
						},
						{
							title: t("links.subItems.sige"),
							url: "https://antoniosergio.unicard.pt:8090/",
						},
					],
				},
				{
					title: t("links.digital_space"),
					isLink: false,
					subItems: [
						{
							title: t("links.subItems.library"),
							url: "https://sites.google.com/view/maisqueletra",
						},
						{
							title: t("links.subItems.journal"),
							url: "https://true.publico.pt/antoniosergio",
						},
						{
							title: t("links.subItems.qualifica_center"),
							url: "https://centroqualificaaeasergio.weebly.com/",
						},
					],
				},
				{
					title: t("links.webmail"),
					isLink: true,
					url: "https://accounts.google.com/ServiceLogin?service=CPanel&passive=1209600&cpbps=1&continue=https%3A%2F%2Fadmin.google.com%2Fantoniosergio.pt%2FDashboard&followup=https%3A%2F%2Fadmin.google.com%2Fantoniosergio.pt%2FDashboard&skipvpage=true#identifier",
				},
				{
					title: t("links.complaint_book"),
					isLink: true,
					url: "https://www.livroreclamacoes.pt/Inicio/",
				},
				{
					title: t("links.e_learning"),
					isLink: true,
					url: "https://lab.antoniosergio.pt/",
				},
			],
		},
		{
			title: t("reserved_area.logged_out"),
			url: "https://bo-antoniosergio.sites.microlopes.pt",
		},
	];
};

// For compatibility, export a non-hook factory that accepts a translator function
export const menuItemsData = (
	t: (key: string) => string,
	isLoggedIn: boolean = false
) => {
	return [
		{
			title: t("school.title"),
			items: [
				{
					title: t("school.about_us"),
					isLink: true,
					url: "/sobre-nos",
					subItems: [
						{
							title: t("school.subItems.welcome"),
							url: "/sobre-nos#welcome",
						},
						{
							title: t("school.subItems.mission_values"),
							url: "/sobre-nos#mission-values",
						},
						{
							title: t("school.subItems.educational_project"),
							url: "/sobre-nos#educational-project",
						},
					],
				},
				{
					title: t("school.structure"),
					isLink: false,
					subItems: [
						{
							title: t("school.subItems.facilities"),
							url: "/instalacoes",
						},
						{
							title: t("school.subItems.internal_regulations"),
							url: "/regulamento",
						},
						{
							title: t("school.subItems.organizational_chart"),
							url: "/organograma",
						},
					],
				},
				{
					title: t("school.digital_space"),
					isLink: false,
					subItems: [
						{
							title: t("school.subItems.library"),
							url: "https://sites.google.com/view/maisqueletra",
						},
						{
							title: t("school.subItems.journal"),
							url: "https://true.publico.pt/antoniosergio",
						},
						{
							title: t("school.subItems.qualifica_center"),
							url: "https://centroqualificaaeasergio.weebly.com/",
						},
					],
				},
				{
					title: t("school.education"),
					isLink: true,
					url: "/educacao",
					subItems: [
						{
							title: t("school.subItems.kindergarten"),
							url: "/educacao#jardim-infancia",
						},
						{
							title: t("school.subItems.primary_school"),
							url: "/educacao#primario",
						},
						{
							title: t("school.subItems.middle_school"),
							url: "/educacao#basico",
						},
						{
							title: t("school.subItems.high_school"),
							url: "/educacao#secundario",
						},
					],
				},
				{
					title: t("school.parents_association"),
					isLink: true,
					url: "/associacao-pais",
				},
				{ title: t("school.eqavet"), isLink: true, url: "/eqavet" },
			],
		},
		{
			title: t("secretary.title"),
			items: [
				{
					title: t("secretary.academic_information"),
					isLink: false,
					subItems: [
						{
							title: t("secretary.subItems.national_exams"),
							url: "/exames-nacionais",
						},
						{
							title: t("secretary.subItems.school_textbooks"),
							url: "/manuais-escolares",
						},
						{
							title: t("secretary.subItems.school_plan"),
							url: "/plano-escolar",
						},
						{ title: t("secretary.subItems.menu"), url: "/ementa" },
						{
							title: t(
								"secretary.subItems.professional_courses_regulations"
							),
							url: "/regulamento-cursos",
						},
					],
				},
				{
					title: t("secretary.processes_services"),
					isLink: false,
					subItems: [
						{
							title: t("secretary.subItems.registrations"),
							url: "/inscricoes",
						},
						{
							title: t("secretary.subItems.legislation"),
							url: "/legislacao",
						},
						{
							title: t("secretary.subItems.complaint_book"),
							url: "https://www.livroreclamacoes.pt/Inicio/",
						},
						{
							title: t("secretary.subItems.information"),
							url: "/informacoes",
						},
					],
				},
				{
					title: t("secretary.user_support"),
					isLink: false,
					subItems: [
						{
							title: t("secretary.subItems.tutorials"),
							url: "/tutoriais",
						},
						{ title: t("secretary.subItems.faq"), url: "/faq" },
					],
				},
			],
		},
		{
			title: t("media.title"),
			items: [
				{
					title: t("media.projects"),
					isLink: true,
					url: "/projetos",
					subItems: [],
				},
				{
					title: t("media.news"),
					isLink: true,
					url: "/blog",
					subItems: [],
				},
				{
					title: t("media.events"),
					isLink: true,
					url: "/eventos",
					subItems: [],
				},
			],
		},
		{ title: t("contacts.title"), url: "/contactos" },
		{
			title: t("reserved_area.logged_out"),
			url: "https://bo-antoniosergio.sites.microlopes.pt",
		},
	];
};
