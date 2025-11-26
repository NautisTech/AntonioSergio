const brandColors = {
	primary: "#A51C30",
	secondary: "#0C2D48",
	accent: "#F4A261",
};

export const AES_LANGUAGES = [
	{ code: "pt", label: "PT" },
	{ code: "en", label: "EN" },
];

export const DEFAULT_LANGUAGE = "pt";

const baseIdentity = {
	name: "Agrupamento de Escolas António Sérgio",
	shortName: "AE António Sérgio",
	location: "Vila Nova de Gaia",
	colors: brandColors,
};

const identityCopy = {
	tagline: {
		pt: "Excelência e inovação na educação",
		en: "Excellence and innovation in education",
	},
	description: {
		pt: "Promovemos percursos educativos completos e inclusivos, com foco na qualidade pedagógica, na proximidade à comunidade e na preparação de cada aluno para o futuro.",
		en: "We provide comprehensive and inclusive learning pathways, focusing on pedagogical quality, community engagement, and preparing every student for the future.",
	},
};

const navLinkEntries = [
	{
		href: "/",
		labels: { pt: "Início", en: "Home" },
	},
	{
		labels: { pt: "Escola", en: "School" },
		dropdown: [
			{
				labels: { pt: "Sobre Nós", en: "About Us" },
				isLink: true,
				href: "/sobre",
				subItems: [
					{
						labels: { pt: "Boas-vindas", en: "Welcome" },
						href: "/sobre#welcome",
					},
					{
						labels: {
							pt: "Missão e Valores",
							en: "Mission & Values",
						},
						href: "/sobre#mission-values",
					},
					{
						labels: {
							pt: "Projeto Educativo",
							en: "Educational Project",
						},
						href: "/sobre#educational-project",
					},
				],
			},
			{
				labels: { pt: "Estrutura", en: "Structure" },
				isLink: false,
				subItems: [
					{
						labels: { pt: "Instalações", en: "Facilities" },
						href: "/instalacoes",
					},
					{
						labels: {
							pt: "Regulamento Interno",
							en: "Internal Regulations",
						},
						href: "/regulamento",
					},
					{
						labels: {
							pt: "Organograma",
							en: "Organizational Chart",
						},
						href: "/organograma",
					},
				],
			},
			{
				labels: { pt: "Educação", en: "Education" },
				isLink: true,
				href: "/educacao",
				subItems: [
					{
						labels: {
							pt: "Jardim de Infância",
							en: "Kindergarten",
						},
						href: "/educacao#jardim-infancia",
					},
					{
						labels: { pt: "1º Ciclo", en: "Primary School" },
						href: "/educacao#primario",
					},
					{
						labels: { pt: "2º e 3º Ciclos", en: "Middle School" },
						href: "/educacao#basico",
					},
					{
						labels: { pt: "Ensino Secundário", en: "High School" },
						href: "/educacao#secundario",
					},
				],
			},
			{
				labels: { pt: "Associação de Pais", en: "Parents Association" },
				isLink: true,
				href: "/associacao-pais",
			},
			{
				labels: { pt: "EQAVET", en: "EQAVET" },
				isLink: true,
				href: "/eqavet",
			},
		],
	},
	{
		labels: { pt: "Secretaria", en: "Secretary" },
		dropdown: [
			{
				labels: {
					pt: "Informação Académica",
					en: "Academic Information",
				},
				isLink: false,
				subItems: [
					{
						labels: {
							pt: "Exames Nacionais",
							en: "National Exams",
						},
						href: "/exames-nacionais",
					},
					{
						labels: {
							pt: "Manuais Escolares",
							en: "School Textbooks",
						},
						href: "/manuais-escolares",
					},
					{
						labels: { pt: "Plano Escolar", en: "School Plan" },
						href: "/plano-escolar",
					},
					{
						labels: { pt: "Ementa", en: "Menu" },
						href: "/ementa",
					},
					{
						labels: {
							pt: "Regulamento de Cursos",
							en: "Course Regulations",
						},
						href: "/regulamento-cursos",
					},
				],
			},
			{
				labels: {
					pt: "Processos e Serviços",
					en: "Processes & Services",
				},
				isLink: false,
				subItems: [
					{
						labels: { pt: "Inscrições", en: "Registrations" },
						href: "/inscricoes",
					},
					{
						labels: { pt: "Legislação", en: "Legislation" },
						href: "/legislacao",
					},
					{
						labels: { pt: "Informações", en: "Information" },
						href: "/informacoes",
					},
				],
			},
			{
				labels: { pt: "Apoio ao Utilizador", en: "User Support" },
				isLink: false,
				subItems: [
					{
						labels: { pt: "Tutoriais", en: "Tutorials" },
						href: "/tutoriais",
					},
					{
						labels: { pt: "FAQ", en: "FAQ" },
						href: "/faq",
					},
				],
			},
		],
	},
	{
		labels: { pt: "Comunicação", en: "Media" },
		dropdown: [
			{
				labels: { pt: "Projetos", en: "Projects" },
				isLink: true,
				href: "/projetos",
			},
			{
				labels: { pt: "Notícias", en: "News" },
				isLink: true,
				href: "/blog",
			},
			{
				labels: { pt: "Eventos", en: "Events" },
				isLink: true,
				href: "/eventos",
			},
		],
	},
	{
		labels: { pt: "Ligações", en: "Links" },
		dropdown: [
			{
				labels: { pt: "Inovar", en: "Inovar" },
				isLink: true,
				href: "https://inovar.antoniosergio.pt/InovarAlunos/Inicial.wgx",
				subItems: [
					{
						labels: { pt: "Alunos", en: "Students" },
						href: "https://inovar.antoniosergio.pt/InovarAlunos/Inicial.wgx",
					},
					{
						labels: { pt: "Consulta", en: "Consultation" },
						href: "https://inovar.antoniosergio.pt/Inovarconsulta/app/index.html#/login",
					},
					{
						labels: { pt: "Recorrente", en: "Recurring" },
						href: "https://inovar.antoniosergio.pt/InovarRecorrente/Inicial.wgx",
					},
					{
						labels: { pt: "PAA", en: "PAA" },
						href: "https://inovar.antoniosergio.pt/InovarPAA/Inicial.wgx",
					},
					{
						labels: { pt: "SIGE", en: "SIGE" },
						href: "https://antoniosergio.unicard.pt:8090/",
					},
				],
			},
			{
				labels: { pt: "Espaço Digital", en: "Digital Space" },
				isLink: false,
				subItems: [
					{
						labels: { pt: "Biblioteca", en: "Library" },
						href: "https://sites.google.com/view/maisqueletra",
					},
					{
						labels: { pt: "Jornal", en: "Journal" },
						href: "https://true.publico.pt/antoniosergio",
					},
					{
						labels: {
							pt: "Centro Qualifica",
							en: "Qualifica Center",
						},
						href: "https://centroqualificaaeasergio.weebly.com/",
					},
				],
			},
			{
				labels: { pt: "Webmail", en: "Webmail" },
				isLink: true,
				href: "https://accounts.google.com/ServiceLogin?service=CPanel&passive=1209600&cpbps=1&continue=https%3A%2F%2Fadmin.google.com%2Fantoniosergio.pt%2FDashboard&followup=https%3A%2F%2Fadmin.google.com%2Fantoniosergio.pt%2FDashboard&skipvpage=true#identifier",
			},
			{
				labels: { pt: "Livro de Reclamações", en: "Complaint Book" },
				isLink: true,
				href: "https://www.livroreclamacoes.pt/Inicio/",
			},
			{
				labels: { pt: "E-Learning", en: "E-Learning" },
				isLink: true,
				href: "https://lab.antoniosergio.pt/",
			},
		],
	},
];

const headerCtaCopy = {
	pt: "Fala connosco",
	en: "Get in touch",
};

const heroCopy = {
	pt: {
		eyebrow: "Agrupamento de Escolas António Sérgio",
		title: "Excelência e inovação para todas as etapas de ensino.",
		description:
			"Definimo-nos como pioneiros da inovação educativa em Portugal, incentivando cada aluno a desenvolver o seu potencial e a tornar-se um cidadão ativo, consciente e resiliente.",
		primaryCta: {
			label: "Conhecer a oferta educativa",
			href: "/sobre",
		},
		secondaryCta: { label: "Contactar a secretaria", href: "/contactos" },
		videoCta: { label: "Ver o campus", videoId: "vTIIMJ9tUc8" },
		scrollLabel: "Explorar",
	},
	en: {
		eyebrow: "António Sérgio School Group",
		title: "Excellence and innovation for every learning stage.",
		description:
			"We lead educational innovation in Portugal, encouraging each student to unlock their potential and become an engaged, resilient citizen.",
		primaryCta: { label: "Explore our academic offer", href: "/sobre" },
		secondaryCta: { label: "Talk to the office", href: "/contactos" },
		videoCta: { label: "Watch the campus", videoId: "vTIIMJ9tUc8" },
		scrollLabel: "Explore",
	},
};

const heroHighlights = [
	{
		values: {
			pt: "65+ anos",
			en: "65+ years",
		},
		labels: {
			pt: "de reconhecimento e alcance internacional",
			en: "of recognition and international reach",
		},
	},
	{
		values: {
			pt: "25 espaços",
			en: "25 spaces",
		},
		labels: {
			pt: "e ferramentas digitais colaborativas",
			en: "and collaborative digital spaces",
		},
	},
	{
		values: {
			pt: "220 docentes",
			en: "220 teachers",
		},
		labels: {
			pt: "altamente qualificados e próximos",
			en: "highly qualified and close to students",
		},
	},
	{
		values: {
			pt: "3 600 alunos",
			en: "3,600 students",
		},
		labels: {
			pt: "acompanhados em cada ano letivo",
			en: "supported every school year",
		},
	},
];

const programCopy = {
	preTitle: { pt: "Projeto Educativo", en: "Educational project" },
	title: { pt: "Explore os nossos cursos", en: "Explore our programmes" },
	description: {
		pt: "Percursos técnicos e científico-humanísticos que preparam os estudantes para o ensino superior e para o mercado de trabalho moderno.",
		en: "Technical and academic pathways that prepare students for university and the modern labour market.",
	},
};

const programItems = [
	{
		image: "/assets/school/courses/course-1.jpg",
		title: { pt: "Cibersegurança e Redes", en: "Cybersecurity & Networks" },
		description: {
			pt: "Aprendizagem prática em proteção de sistemas, gestão de infraestrutura e implementação de soluções seguras.",
			en: "Hands-on learning in system protection, infrastructure management, and secure solution deployment.",
		},
	},
	{
		image: "/assets/school/courses/course-2.jpg",
		title: { pt: "Eletrónica e Hardware", en: "Electronics & Hardware" },
		description: {
			pt: "Desenvolvimento de sistemas embebidos, automação e integração de tecnologias orientadas à indústria.",
			en: "Embedded systems, automation, and industry-ready technology integration.",
		},
	},
	{
		image: "/assets/school/courses/course-3.jpg",
		title: { pt: "Programação", en: "Programming" },
		description: {
			pt: "Metodologias ágeis, linguagens modernas e pensamento computacional aplicados a desafios reais.",
			en: "Agile methods, modern languages, and computational thinking applied to real-world challenges.",
		},
	},
	{
		image: "/assets/school/courses/course-4.jpg",
		title: { pt: "Mecânica", en: "Mechanical Engineering" },
		description: {
			pt: "Formação sólida em processos industriais, desenho técnico e manutenção de equipamentos.",
			en: "Solid training in industrial processes, technical drawing, and equipment maintenance.",
		},
	},
	{
		image: "/assets/school/courses/course-5.jpg",
		title: { pt: "Eletrotecnia", en: "Electrotechnics" },
		description: {
			pt: "Instalações elétricas, manutenção preventiva e operação de sistemas energéticos complexos.",
			en: "Electrical installations, preventive maintenance, and complex energy systems.",
		},
	},
	{
		image: "/assets/school/courses/course-6.jpg",
		title: { pt: "Energias Renováveis", en: "Renewable Energies" },
		description: {
			pt: "Projetos sustentáveis que promovem eficiência energética e transição ecológica.",
			en: "Sustainable projects that drive energy efficiency and the green transition.",
		},
	},
];

const featureCopy = {
	preTitle: { pt: "Serviços Educativos", en: "Educational services" },
	title: { pt: "Descubra a nossa oferta", en: "Discover our offer" },
	description: {
		pt: "Pilares que tornam o Agrupamento de Escolas António Sérgio uma referência nacional.",
		en: "The pillars that make António Sérgio School Group a national reference.",
	},
};

const featureItems = [
	{
		icon: "mi-compass",
		title: { pt: "Formação graduada", en: "Complete learning" },
		description: {
			pt: "Percursos do pré-escolar ao ensino secundário articulados com orientação vocacional personalizada.",
			en: "Pathways from preschool to secondary school with tailored guidance.",
		},
	},
	{
		icon: "mi-pulse",
		title: { pt: "Vida académica", en: "Academic life" },
		description: {
			pt: "Atividades extracurriculares e projetos interdisciplinares que reforçam a cidadania ativa.",
			en: "Extracurricular activities and interdisciplinary projects that foster active citizenship.",
		},
	},
	{
		icon: "mi-support",
		title: { pt: "Apoio educativo", en: "Educational support" },
		description: {
			pt: "Serviços de psicologia, tutoria e ação social escolar sempre disponíveis.",
			en: "Psychology, tutoring, and social support services always available.",
		},
	},
	{
		icon: "mi-lightbulb",
		title: { pt: "Inovação pedagógica", en: "Pedagogical innovation" },
		description: {
			pt: "Metodologias modernas e tecnologia integrada para preparar os alunos para o futuro.",
			en: "Modern methodologies and integrated technology to prepare students for the future.",
		},
	},
];

const missionCopy = {
	missionLabel: { pt: "Missão", en: "Mission" },
	missionDescription: {
		pt: "Ser pioneiros na inovação educativa a nível nacional, inspirando os alunos a irem mais longe e a construírem impacto social positivo.",
		en: "To pioneer educational innovation nationwide, inspiring students to go further and create positive social impact.",
	},
	visionLabel: { pt: "Visão", en: "Vision" },
	visionDescription: {
		pt: "Somos uma comunidade escolar que trabalha em rede com famílias, parceiros científicos e empresas para garantir percursos flexíveis e relevantes.",
		en: "We are a school community working with families, researchers, and companies to guarantee flexible, relevant pathways.",
	},
	buttonLabel: { pt: "Ler a nossa missão", en: "Read our mission" },
};

const benefitsCopy = {
	caption: { pt: "Valores que nos guiam", en: "Values that guide us" },
	title: {
		pt: "Porque escolher o AE António Sérgio",
		en: "Why families choose AE António Sérgio",
	},
};

const benefitItems = [
	{
		// Education/graduation cap icon - represents complete educational pathways
		svgPath:
			"M12 3L1 9l11 6 9-4.909V17h2V9L12 3zm0 13.645l-9-4.909V17c0 1.657 4.03 3 9 3s9-1.343 9-3v-5.264l-9 4.909z",
		title: { pt: "Percursos completos", en: "Complete pathways" },
		description: {
			pt: "Do pré-escolar ao secundário, com orientação vocacional e apoio personalizado.",
			en: "From preschool to secondary, combining guidance and personalised support.",
		},
	},
	{
		// Handshake icon - represents partnerships and collaboration
		svgPath:
			"M7 8c0 2.761 2.239 5 5 5s5-2.239 5-5-2.239-5-5-5-5 2.239-5 5zm11.122 6.708c-.706-.325-1.46-.484-2.248-.484-1.493 0-2.874.676-3.874 1.837-1-.746-2.215-1.176-3.5-1.176-1.42 0-2.748.506-3.777 1.384l2.195 3.731c.476-.29 1.025-.445 1.582-.445.48 0 .953.117 1.368.339l1.882 1.006 1.076-1.076-1.382-2.072c.463-.316.993-.517 1.553-.517.827 0 1.606.336 2.195.947l3.208-3.474z",
		title: { pt: "Parcerias estratégicas", en: "Strategic partnerships" },
		description: {
			pt: "Protocolos com empresas, universidades e instituições científicas para projetos e estágios.",
			en: "Protocols with companies, universities, and research centres for projects and internships.",
		},
	},
	{
		// Heart icon - represents care, support and family well-being
		svgPath:
			"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
		title: { pt: "Apoio às famílias", en: "Family support" },
		description: {
			pt: "Serviços de psicologia, ação social e clubes que reforçam o bem-estar.",
			en: "Psychology, social services, and clubs that reinforce student and family well-being.",
		},
	},
];

const leadershipCopy = {
	quote: {
		pt: "Somos uma equipa que acredita na proximidade, na inovação e na valorização de toda a comunidade educativa.",
		en: "We are a team that believes in proximity, innovation, and valuing the entire educational community.",
	},
	referenceRole: {
		pt: "Agrupamento de Escolas António Sérgio",
		en: "António Sérgio School Group",
	},
};

const leadershipMembers = [
	{
		name: "Dra. Maria Santos",
		role: { pt: "Diretora", en: "Headteacher" },
		image: "/assets/school/team/team-sm-1.png",
		socials: [],
	},
	{
		name: "Dr. João Silva",
		role: { pt: "Subdiretor", en: "Deputy head" },
		image: "/assets/school/team/team-sm-2.png",
		socials: [],
	},
	{
		name: "Dr. António Costa",
		role: { pt: "Adjunto da Direção", en: "Assistant principal" },
		image: "/assets/school/team/team-sm-3.png",
		socials: [],
	},
	{
		name: "Dra. Ana Ferreira",
		role: { pt: "Adjunta da Direção", en: "Assistant principal" },
		image: "/assets/school/team/team-sm-4.png",
		socials: [],
	},
];

const testimonialsIntroCopy = {
	pt: "Famílias e antigos alunos confiam no AE António Sérgio para construir percursos completos.",
	en: "Families and alumni trust AE António Sérgio to build complete learning journeys.",
};

const testimonialEntries = [
	{
		avatar: "/assets/images/user-avatar.png",
		title: {
			pt: "Qualidade excecional",
			en: "Exceptional quality",
		},
		description: {
			pt: "O acompanhamento diário e os projetos diferenciadores fizeram toda a diferença no percurso do meu filho.",
			en: "Daily mentoring and distinctive projects made all the difference in my son's journey.",
		},
		author: "João Santos",
		role: { pt: "Encarregado de educação", en: "Parent" },
	},
	{
		avatar: "/assets/images/user-avatar.png",
		title: {
			pt: "Experiência transformadora",
			en: "Transformative experience",
		},
		description: {
			pt: "O rigor académico vive lado a lado com atividades criativas que despertam o melhor de cada aluno.",
			en: "Academic rigour goes hand in hand with creative activities that bring out the best in every student.",
		},
		author: "Ana Costa",
		role: { pt: "Ex-aluna", en: "Alumni" },
	},
	{
		avatar: "/assets/images/user-avatar.png",
		title: {
			pt: "Comunidade acolhedora",
			en: "Welcoming community",
		},
		description: {
			pt: "Professores, técnicos e assistentes trabalham em equipa para que ninguém fique para trás.",
			en: "Teachers and staff work as one team to make sure no one is left behind.",
		},
		author: "Carlos Silva",
		role: { pt: "Encarregado de educação", en: "Parent" },
	},
];

const partnersSectionCopy = {
	pt: "Parceiros que nos apoiam",
	en: "Partners who support us",
};

const newsletterCopy = {
	pt: {
		title: "Fique a par das nossas novidades.",
		emailLabel: "O seu email",
		emailPlaceholder: "Insira o seu email",
		buttonText: "Subscrever",
		disclaimer:
			"Respeitamos a sua privacidade e não partilhamos os seus dados.",
	},
	en: {
		title: "Stay informed about our news.",
		emailLabel: "Your email",
		emailPlaceholder: "Enter your email",
		buttonText: "Subscribe",
		disclaimer: "We respect your privacy and do not share your data.",
	},
};

const partnersEntries = [
	{
		name: "Associação Empresarial de Portugal",
		logo: "/assets/school/brand/brand-1.svg",
		category: {
			pt: "Parcerias empresariais",
			en: "Business partnerships",
		},
	},
	{
		name: "Instituto Politécnico do Porto",
		logo: "/assets/school/brand/brand-2.svg",
		category: { pt: "Ensino superior", en: "Higher education" },
	},
	{
		name: "Área Metropolitana do Porto",
		logo: "/assets/school/brand/brand-3.svg",
		category: { pt: "Administração local", en: "Local administration" },
	},
	{
		name: "Expandindústria",
		logo: "/assets/school/brand/brand-4.svg",
		category: { pt: "Empresas parceiras", en: "Industry partners" },
	},
	{
		name: "INESCTEC",
		logo: "/assets/school/brand/brand-5.svg",
		category: { pt: "Investigação", en: "Research" },
	},
];

const faqEntries = [
	{
		question: {
			pt: "Quais os níveis de ensino abrangidos?",
			en: "Which education levels are covered?",
		},
		answer: {
			pt: "Disponibilizamos educação pré-escolar, 1.º, 2.º e 3.º ciclos e ensino secundário com ofertas científico-humanísticas e profissionais.",
			en: "We offer preschool, primary, lower and upper secondary education with academic and vocational programmes.",
		},
	},
	{
		question: {
			pt: "Como funciona o apoio educativo especializado?",
			en: "How does specialised support work?",
		},
		answer: {
			pt: "Acompanhamos cada aluno através de gabinetes de psicologia, tutoria académica, intervenção precoce e ação social escolar.",
			en: "We support each student through psychology services, tutoring, early intervention, and social assistance.",
		},
	},
	{
		question: {
			pt: "Há protocolos com empresas e ensino superior?",
			en: "Are there partnerships with companies and universities?",
		},
		answer: {
			pt: "Sim. O EQAVET garante redes com empresas, municípios e instituições de ensino superior para estágios, projetos e investigação.",
			en: "Yes. EQAVET connects us with companies, local authorities, and universities for internships, projects, and research.",
		},
	},
	{
		question: {
			pt: "Como posso visitar o campus?",
			en: "How can I visit the campus?",
		},
		answer: {
			pt: "Agenda uma visita através dos contactos oficiais ou participa nos dias abertos e eventos comunitários divulgados no calendário escolar.",
			en: "Book a visit through our official contacts or join the open days and community events in the school calendar.",
		},
	},
];

const blogEntries = [
	{
		slug: "eqavet-reforca-cultura-de-qualidade",
		cover: "/assets/school/eqavet/eqavet-11.jpg",
		date: "2025-02-10",
		entities: [], // All schools
		author: {
			name: "Helena Andrade",
			role: { pt: "Coordenadora EQAVET", en: "EQAVET Coordinator" },
			avatar: "/assets/images/user-avatar.png",
		},
		tags: ["EQAVET", "Qualidade", "Parcerias"],
		title: {
			pt: "EQAVET reforça a cultura de qualidade no agrupamento",
			en: "EQAVET reinforces the quality culture across the group",
		},
		category: { pt: "Qualidade", en: "Quality" },
		readingTime: { pt: "6 min", en: "6 min read" },
		excerpt: {
			pt: "A equipa EQAVET consolidou novos protocolos e ferramentas de monitorização que elevam a qualidade pedagógica em todas as escolas do agrupamento.",
			en: "The EQAVET team consolidated new protocols and monitoring tools that elevate pedagogical quality across all schools.",
		},
		content: {
			pt: [
				"Os ciclos de melhoria contínua passaram a integrar indicadores pedagógicos e sociais recolhidos em tempo real nas diferentes escolas do agrupamento.",
				"As novas fichas de acompanhamento permitem alinhar tutores, docentes e parceiros externos, assegurando respostas rápidas às necessidades dos alunos.",
				"Para 2025 está prevista a expansão da rede de empresas acolhedoras de Formação em Contexto de Trabalho e novas ações de mentoria com o ensino superior.",
			],
			en: [
				"Continuous improvement cycles now include pedagogical and social indicators collected in real time across every school.",
				"New monitoring sheets align tutors, teachers, and external partners, ensuring swift responses to student needs.",
				"For 2025 we plan to expand the network of host companies for workplace training and to launch new mentoring actions with universities.",
			],
		},
	},
	{
		slug: "laboratorios-abertos-semana-ciencia",
		cover: "/assets/school/campus/campus-3.jpg",
		date: "2025-03-18",
		entities: ["stamarinha", "marco"], // EB2/3 Santa Marinha, EB1/JI Marco
		author: {
			name: "Rui Barbosa",
			role: { pt: "Coordenador de Ciências", en: "Science Coordinator" },
			avatar: "/assets/images/user-avatar.png",
		},
		tags: ["Semana da Ciência", "Laboratórios", "Comunidade"],
		title: {
			pt: "Laboratórios abertos marcam a Semana da Ciência",
			en: "Open labs headline the Science Week",
		},
		category: { pt: "Eventos", en: "Events" },
		readingTime: { pt: "5 min", en: "5 min read" },
		excerpt: {
			pt: "Alunos do básico ao secundário apresentaram protótipos e experiências interativas que aproximam a comunidade da investigação científica.",
			en: "Students from primary to secondary showcased prototypes and interactive experiments that bring the community closer to science.",
		},
		content: {
			pt: [
				"Os clubes de ciência viva dinamizaram workshops de robótica, programação criativa e energias renováveis.",
				"Famílias e parceiros locais puderam testar os protótipos desenvolvidos ao longo do ano letivo e propor novos desafios.",
				"O evento reforçou a importância de espaços laboratoriais abertos e colaborativos para promover vocações científicas.",
			],
			en: [
				"Science clubs led workshops on robotics, creative coding, and renewable energies.",
				"Families and local partners tested prototypes developed throughout the year and proposed new challenges.",
				"The event reinforced the importance of open, collaborative labs to promote scientific vocations.",
			],
		},
	},
	{
		slug: "oferta-profissional-2025",
		cover: "/assets/school/courses/course-3.jpg",
		date: "2025-04-05",
		entities: ["antoniosergio"], // ES António Sérgio
		author: {
			name: "Teresa Carvalho",
			role: {
				pt: "Coordenadora dos Cursos Profissionais",
				en: "Vocational Courses Lead",
			},
			avatar: "/assets/images/user-avatar.png",
		},
		tags: ["Cursos profissionais", "PTD", "Futuro"],
		title: {
			pt: "Oferta profissional 2025 com novos percursos digitais",
			en: "2025 vocational offer adds new digital pathways",
		},
		category: { pt: "Cursos", en: "Courses" },
		readingTime: { pt: "4 min", en: "4 min read" },
		excerpt: {
			pt: "O Plano de Transição Digital inspira a criação de módulos flexíveis em Cibersegurança, Energias Renováveis e Multimédia Interativa.",
			en: "The Digital Transition Plan inspired flexible modules in Cybersecurity, Renewable Energy, and Interactive Media.",
		},
		content: {
			pt: [
				"Os novos módulos foram co-construídos com empresas tecnológicas e incluem desafios reais em contexto de sala de aula.",
				"Cada turma terá um mentor digital responsável por apoiar a integração de ferramentas colaborativas e laboratórios virtuais.",
				"A comunidade educativa terá acesso a um catálogo de micro credenciais que reconhece competências adquiridas nos projetos.",
			],
			en: [
				"The new modules were co-designed with tech companies and include real challenges in the classroom.",
				"Each class will have a digital mentor to support collaborative tools and virtual labs.",
				"The school community will access a micro-credential catalogue recognising skills acquired in projects.",
			],
		},
	},
];

const projectEntries = [
	{
		slug: "laboratorio-aberto-de-tecnologia",
		cover: "/assets/school/campus/campus-5.jpg",
		entities: ["antoniosergio", "stamarinha"], // ES António Sérgio, EB2/3 Santa Marinha
		gallery: [
			"/assets/school/courses/course-2.jpg",
			"/assets/school/campus/campus-2.jpg",
		],
		partners: ["INESCTEC", "Expandindústria"],
		categories: [
			{ slug: "inovacao", label: { pt: "Inovação", en: "Innovation" } },
			{ slug: "steam", label: { pt: "STEAM", en: "STEAM" } },
		],
		title: {
			pt: "Laboratório Aberto de Tecnologia",
			en: "Open Technology Lab",
		},
		summary: {
			pt: "Espaço colaborativo que liga clubes de robótica, impressão 3D e programação criativa.",
			en: "Collaborative space linking robotics, 3D printing, and creative coding clubs.",
		},
		description: {
			pt: "O laboratório funciona em regime aberto para turmas do 2.º ciclo ao secundário, promovendo projetos STEAM com parceiros científicos.",
			en: "The lab works in open mode for middle and secondary students, promoting STEAM projects with research partners.",
		},
		status: { pt: "Em curso", en: "Ongoing" },
		goals: {
			pt: [
				"Aumentar a participação feminina em projetos tecnológicos",
				"Criar protótipos para desafios locais",
				"Partilhar recursos digitais entre escolas do agrupamento",
			],
			en: [
				"Increase female participation in technology projects",
				"Build prototypes that address local challenges",
				"Share digital resources across the group",
			],
		},
		outcomes: {
			pt: "Mais de 120 alunos envolvidos em desafios de prototipagem rápida e mentoria semanal.",
			en: "Over 120 students involved in rapid prototyping challenges and weekly mentoring.",
		},
	},
	{
		slug: "plano-digital-de-transicao",
		cover: "/assets/school/campus/campus-3.jpg",
		entities: [], // All schools
		gallery: [
			"/assets/school/icon/counter/counter-1.png",
			"/assets/school/icon/counter/counter-3.png",
		],
		partners: ["Município de Gaia", "Altice Labs"],
		categories: [
			{
				slug: "transformacao",
				label: {
					pt: "Transformação Digital",
					en: "Digital transformation",
				},
			},
		],
		title: {
			pt: "Plano Digital de Transição",
			en: "Digital Transition Plan",
		},
		summary: {
			pt: "Programa transversal que equipa salas com recursos híbridos e forma docentes em metodologias digitais.",
			en: "Cross-cutting programme equipping classrooms with hybrid resources and training teachers in digital methods.",
		},
		description: {
			pt: "Inclui kits móveis de aprendizagem, reforço da conectividade e micro formações direcionadas por grupo disciplinar.",
			en: "Includes mobile learning kits, improved connectivity, and tailored micro-trainings per subject cluster.",
		},
		status: { pt: "Implementação", en: "Implementation" },
		goals: {
			pt: [
				"Garantir acesso equitativo a equipamentos",
				"Promover metodologias blended em todas as turmas",
				"Monitorizar competências digitais através do EQAVET",
			],
			en: [
				"Guarantee equitable access to devices",
				"Promote blended methodologies in every class",
				"Monitor digital skills with EQAVET",
			],
		},
		outcomes: {
			pt: "40 salas equipadas e 180 docentes certificados nas oficinas de competências digitais.",
			en: "40 classrooms equipped and 180 teachers certified in digital skills workshops.",
		},
	},
	{
		slug: "oficinas-criativas-de-artes-e-design",
		cover: "/assets/school/breadcrumb/breadcrumb-4.jpg",
		entities: ["praia", "pedras", "qntchas"], // EB1/JI Praia, Pedras, Quinta das Chãs
		gallery: [
			"/assets/school/about/about-1.jpg",
			"/assets/school/about/about-2.jpg",
		],
		partners: ["Casa das Artes de Gaia", "AMP"],
		categories: [
			{
				slug: "comunidade",
				label: { pt: "Comunidade", en: "Community" },
			},
			{ slug: "artes", label: { pt: "Expressões", en: "Arts" } },
		],
		title: {
			pt: "Oficinas Criativas de Artes e Design",
			en: "Creative Arts & Design Studios",
		},
		summary: {
			pt: "Projeto interdisciplinar que junta artes visuais, multimédia e cidadania ativa.",
			en: "Interdisciplinary project merging visual arts, multimedia, and active citizenship.",
		},
		description: {
			pt: "As oficinas transformam espaços comuns em galerias efémeras e envolvem associações culturais locais.",
			en: "Studios turn common areas into pop-up galleries and involve local cultural associations.",
		},
		status: { pt: "Concluído", en: "Completed" },
		goals: {
			pt: [
				"Dar voz às narrativas dos alunos",
				"Combinar artes tradicionais com meios digitais",
				"Refletir sobre sustentabilidade e inclusão",
			],
			en: [
				"Give voice to student narratives",
				"Blend traditional arts with digital media",
				"Reflect on sustainability and inclusion",
			],
		},
		outcomes: {
			pt: "15 exposições itinerantes e um catálogo digital aberto à comunidade.",
			en: "15 travelling exhibitions and a digital catalogue open to the community.",
		},
	},
];

const homeSectionsCopy = {
	about: {
		caption: { pt: "Quem somos", en: "Who we are" },
		title: {
			pt: "Conheça o Agrupamento de Escolas António Sérgio.",
			en: "Get to know António Sérgio School Group.",
		},
		actionLabel: {
			pt: "História, missão e campus",
			en: "History, mission, and campus",
		},
	},
	stats: {
		title: { pt: "Impacto em números", en: "Impact in numbers" },
		description: {
			pt: "Uma comunidade educativa que cresce com projetos europeus, redes empresariais e inovação pedagógica.",
			en: "An educational community growing through European projects, business networks, and pedagogical innovation.",
		},
		ctaLabel: { pt: "Agendar visita", en: "Book a visit" },
	},
	portfolio: {
		caption: { pt: "Projetos em destaque", en: "Featured projects" },
		title: {
			pt: "Inovação, ciência e comunidade em ação.",
			en: "Innovation, science, and community in action.",
		},
		filterAllLabel: { pt: "Todos os projetos", en: "All projects" },
	},
	faq: {
		caption: {
			pt: "Perguntas frequentes",
			en: "Frequently asked questions",
		},
		title: {
			pt: "Informação útil para famílias e alunos.",
			en: "Useful information for families and students.",
		},
		actionLabel: {
			pt: "Falar com a secretaria",
			en: "Talk to the office",
		},
	},
	blog: {
		caption: { pt: "Blog", en: "Blog" },
		title: {
			pt: "Histórias e projetos em destaque.",
			en: "Stories and projects in the spotlight.",
		},
		actionLabel: {
			pt: "Ler todas as notícias",
			en: "Read all news",
		},
	},
	partners: {
		title: {
			pt: "Rede de parceiros institucionais",
			en: "Network of institutional partners",
		},
	},
};

const contactBase = {
	address: "Av. Nuno Álvares, 4400-233 Vila Nova de Gaia",
	email: "esas.gaia@antoniosergio.pt",
	phone: "+351 223 752 199",
	fax: "+351 223 757 058",
	socials: [
		{
			label: "Facebook",
			href: "https://www.facebook.com/AgrupamentoAntonioSergio",
		},
		{
			label: "Instagram",
			href: "https://www.instagram.com/agrupamentoantoniosergio",
		},
	],
};

const contactInfoCopy = {
	title: { pt: "Contactos", en: "Contacts" },
	subtitle: {
		pt: "Estamos disponíveis para ajudar",
		en: "We are here to help",
	},
	officeHours: {
		pt: "Dias úteis · 09:00 - 18:30",
		en: "Weekdays · 09:00 - 18:30",
	},
};

const contactCopyLocales = {
	pt: {
		officeCardTitle: "Secretaria",
		locationCardTitle: "Localização",
		form: {
			nameLabel: "Nome",
			namePlaceholder: "O teu nome",
			emailLabel: "Email",
			emailPlaceholder: "Escreve o teu email",
			messageLabel: "Mensagem",
			messagePlaceholder: "Como podemos ajudar?",
			buttonLabel: "Enviar mensagem",
			helperText:
				"Todos os campos são obrigatórios. Ao submeter aceitas a nossa",
			privacyLabel: "Política de Privacidade",
		},
		privacyHref: "/politica-de-privacidade",
	},
	en: {
		officeCardTitle: "School office",
		locationCardTitle: "Location",
		form: {
			nameLabel: "Name",
			namePlaceholder: "Your full name",
			emailLabel: "Email",
			emailPlaceholder: "Enter your email",
			messageLabel: "Message",
			messagePlaceholder: "How can we help?",
			buttonLabel: "Send message",
			helperText: "All fields are required. By submitting you accept our",
			privacyLabel: "Privacy Policy",
		},
		privacyHref: "/politica-de-privacidade",
	},
};

const footerCopyLocales = {
	pt: {
		navigationTitle: "Navegação",
		socialTitle: "Redes sociais",
		schoolTitle: "Escola",
		schoolLinks: [
			{ href: "/sobre", label: "Sobre Nós" },
			{ href: "/instalacoes", label: "Instalações" },
			{ href: "/educacao", label: "Educação" },
			{ href: "/organograma", label: "Organograma" },
			{ href: "/eqavet", label: "EQAVET" },
		],
		servicesTitle: "Serviços",
		servicesLinks: [
			{ href: "/inscricoes", label: "Inscrições" },
			{ href: "/informacoes", label: "Informações" },
			{ href: "/tutoriais", label: "Tutoriais" },
			{ href: "/faq", label: "FAQ" },
		],
		communicationTitle: "Comunicação",
		communicationLinks: [
			{ href: "/projetos", label: "Projetos" },
			{ href: "/blog", label: "Notícias" },
			{ href: "/eventos", label: "Eventos" },
		],
		legalTitle: "Legal",
		legalLinks: [
			{ href: "/regulamento", label: "Regulamento Interno" },
			{ href: "/legislacao", label: "Legislação" },
			{
				href: "/politica-de-privacidade",
				label: "Política de Privacidade",
			},
		],
		locationNote: "Baseados em Vila Nova de Gaia, Portugal.",
	},
	en: {
		navigationTitle: "Navigation",
		socialTitle: "Social media",
		schoolTitle: "School",
		schoolLinks: [
			{ href: "/sobre", label: "About Us" },
			{ href: "/instalacoes", label: "Facilities" },
			{ href: "/educacao", label: "Education" },
			{ href: "/organograma", label: "Organizational Chart" },
			{ href: "/eqavet", label: "EQAVET" },
		],
		servicesTitle: "Services",
		servicesLinks: [
			{ href: "/inscricoes", label: "Registrations" },
			{ href: "/informacoes", label: "Information" },
			{ href: "/tutoriais", label: "Tutorials" },
			{ href: "/faq", label: "FAQ" },
		],
		communicationTitle: "Communication",
		communicationLinks: [
			{ href: "/projetos", label: "Projects" },
			{ href: "/blog", label: "News" },
			{ href: "/eventos", label: "Events" },
		],
		legalTitle: "Legal",
		legalLinks: [
			{ href: "/regulamento", label: "Internal Regulations" },
			{ href: "/legislacao", label: "Legislation" },
			{ href: "/politica-de-privacidade", label: "Privacy Policy" },
		],
		locationNote: "Based in Vila Nova de Gaia, Portugal.",
	},
};

const buildNavLinks = lang =>
	navLinkEntries.map(link => ({ ...link, label: link.labels[lang] }));

const buildHeroContent = lang => ({
	...heroCopy[lang],
	highlights: heroHighlights.map(item => ({
		value: item.values[lang],
		label: item.labels[lang],
	})),
});

const buildProgramHighlights = lang => ({
	preTitle: programCopy.preTitle[lang],
	title: programCopy.title[lang],
	description: programCopy.description[lang],
	items: programItems.map(item => ({
		image: item.image,
		title: item.title[lang],
		description: item.description[lang],
	})),
});

const buildFeatureHighlights = lang => ({
	preTitle: featureCopy.preTitle[lang],
	title: featureCopy.title[lang],
	description: featureCopy.description[lang],
	items: featureItems.map(item => ({
		icon: item.icon,
		title: item.title[lang],
		description: item.description[lang],
	})),
});

const buildMissionBlock = lang => ({
	missionLabel: missionCopy.missionLabel[lang],
	missionDescription: missionCopy.missionDescription[lang],
	visionLabel: missionCopy.visionLabel[lang],
	visionDescription: missionCopy.visionDescription[lang],
	button: { label: missionCopy.buttonLabel[lang], href: "/sobre-nos" },
});

const buildBenefitsContent = lang => ({
	caption: benefitsCopy.caption[lang],
	title: benefitsCopy.title[lang],
	items: benefitItems.map(item => ({
		svgPath: item.svgPath,
		title: item.title[lang],
		description: item.description[lang],
	})),
});

const buildLeadership = lang => ({
	quote: leadershipCopy.quote[lang],
	reference: {
		name: "Direção do Agrupamento",
		role: leadershipCopy.referenceRole[lang],
	},
	members: leadershipMembers.map(member => ({
		...member,
		role: member.role[lang],
	})),
});

const buildTestimonials = lang =>
	testimonialEntries.map(testimonial => ({
		avatar: testimonial.avatar,
		title: testimonial.title[lang],
		description: testimonial.description[lang],
		author: testimonial.author,
		role: testimonial.role[lang],
	}));

const buildPartners = lang =>
	partnersEntries.map(partner => ({
		name: partner.name,
		logo: partner.logo,
		category: partner.category[lang],
	}));

const buildFaqItems = lang =>
	faqEntries.map(item => ({
		question: item.question[lang],
		answer: item.answer[lang],
	}));

const buildBlogPosts = lang =>
	blogEntries.map(post => ({
		slug: post.slug,
		cover: post.cover,
		date: post.date,
		tags: post.tags,
		entities: post.entities,
		title: post.title[lang],
		category: post.category[lang],
		readingTime: post.readingTime[lang],
		excerpt: post.excerpt[lang],
		content: post.content[lang],
		author: {
			name: post.author.name,
			role: post.author.role[lang],
			avatar: post.author.avatar,
		},
	}));

const buildProjects = lang =>
	projectEntries.map(project => ({
		slug: project.slug,
		cover: project.cover,
		gallery: project.gallery,
		partners: project.partners,
		entities: project.entities,
		categories: project.categories.map(category => ({
			slug: category.slug,
			label: category.label[lang],
		})),
		title: project.title[lang],
		summary: project.summary[lang],
		description: project.description[lang],
		status: project.status[lang],
		goals: project.goals[lang],
		outcomes: project.outcomes[lang],
	}));

const buildHomeSections = lang => ({
	about: {
		caption: homeSectionsCopy.about.caption[lang],
		title: homeSectionsCopy.about.title[lang],
		actionLabel: homeSectionsCopy.about.actionLabel[lang],
	},
	stats: {
		title: homeSectionsCopy.stats.title[lang],
		description: homeSectionsCopy.stats.description[lang],
		ctaLabel: homeSectionsCopy.stats.ctaLabel[lang],
	},
	portfolio: {
		caption: homeSectionsCopy.portfolio.caption[lang],
		title: homeSectionsCopy.portfolio.title[lang],
		filterAllLabel: homeSectionsCopy.portfolio.filterAllLabel[lang],
	},
	faq: {
		caption: homeSectionsCopy.faq.caption[lang],
		title: homeSectionsCopy.faq.title[lang],
		actionLabel: homeSectionsCopy.faq.actionLabel[lang],
	},
	blog: {
		caption: homeSectionsCopy.blog.caption[lang],
		title: homeSectionsCopy.blog.title[lang],
		actionLabel: homeSectionsCopy.blog.actionLabel[lang],
	},
	partners: {
		title: homeSectionsCopy.partners.title[lang],
	},
});

const buildContactInfo = lang => ({
	...contactBase,
	title: contactInfoCopy.title[lang],
	subtitle: contactInfoCopy.subtitle[lang],
	officeHours: contactInfoCopy.officeHours[lang],
});

const notFoundCopy = {
	description: {
		pt: "A página que procura não existe ou foi movida.",
		en: "The page you were looking for does not exist or has been moved.",
	},
	button: {
		pt: "Voltar à Página Inicial",
		en: "Back To Home Page",
	},
};

const buildNotFound = lang => ({
	description: notFoundCopy.description[lang],
	button: notFoundCopy.button[lang],
});

const buildLocaleContent = lang => ({
	schoolIdentity: {
		...baseIdentity,
		tagline: identityCopy.tagline[lang],
		description: identityCopy.description[lang],
	},
	navLinks: buildNavLinks(lang),
	headerCtaLabel: headerCtaCopy[lang],
	heroContent: buildHeroContent(lang),
	programHighlights: buildProgramHighlights(lang),
	featureHighlights: buildFeatureHighlights(lang),
	missionBlock: buildMissionBlock(lang),
	benefitsContent: buildBenefitsContent(lang),
	leadership: buildLeadership(lang),
	testimonialsIntro: testimonialsIntroCopy[lang],
	testimonials: buildTestimonials(lang),
	partnersSectionTitle: partnersSectionCopy[lang],
	partners: buildPartners(lang),
	newsletter: newsletterCopy[lang],
	faqItems: buildFaqItems(lang),
	blogPosts: buildBlogPosts(lang),
	projects: buildProjects(lang),
	homeSections: buildHomeSections(lang),
	contactInfo: buildContactInfo(lang),
	contactCopy: contactCopyLocales[lang],
	footerCopy: footerCopyLocales[lang],
	notFound: buildNotFound(lang),
});

const localizedContentByLanguage = AES_LANGUAGES.reduce((acc, { code }) => {
	acc[code] = buildLocaleContent(code);
	return acc;
}, {});

export const aesContent = localizedContentByLanguage;

const defaultLocaleContent =
	aesContent[DEFAULT_LANGUAGE] ?? buildLocaleContent(DEFAULT_LANGUAGE);

export const schoolIdentity = defaultLocaleContent.schoolIdentity;
export const navLinks = defaultLocaleContent.navLinks;
export const headerCtaLabel = defaultLocaleContent.headerCtaLabel;
export const heroContent = defaultLocaleContent.heroContent;
export const programHighlights = defaultLocaleContent.programHighlights;
export const featureHighlights = defaultLocaleContent.featureHighlights;
export const missionBlock = defaultLocaleContent.missionBlock;
export const benefitsContent = defaultLocaleContent.benefitsContent;
export const leadership = defaultLocaleContent.leadership;
export const testimonialsIntro = defaultLocaleContent.testimonialsIntro;
export const testimonials = defaultLocaleContent.testimonials;
export const partnersSectionTitle = defaultLocaleContent.partnersSectionTitle;
export const partners = defaultLocaleContent.partners;
export const faqItems = defaultLocaleContent.faqItems;
export const blogPosts = defaultLocaleContent.blogPosts;
export const projects = defaultLocaleContent.projects;
export const homeSections = defaultLocaleContent.homeSections;
export const contactInfo = defaultLocaleContent.contactInfo;
export const contactCopy = defaultLocaleContent.contactCopy;
export const footerCopy = defaultLocaleContent.footerCopy;

export const events = [
	{
		slug: "feira-das-profissoes-2025",
		title: "Feira das Profissões 2025",
		date: "2025-05-15",
		location: "Pavilhão António Sérgio",
		entities: ["antoniosergio"], // ES António Sérgio
		summary:
			"Empresas, universidades e antigos alunos apresentam percursos académicos e profissionais.",
		description:
			"Sessões de networking, experiências hands-on e painéis temáticos sobre competências do futuro.",
		cover: "/assets/school/breadcrumb/breadcrumb-2.jpg",
		agenda: [
			{
				time: "09:00",
				title: "Abertura oficial e painel de antigos alunos",
			},
			{ time: "11:00", title: "Pitch de empresas parceiras" },
			{ time: "14:30", title: "Workshops de orientação vocacional" },
		],
		registration: {
			label: "Inscrever turma",
			href: "/eventos/feira-das-profissoes-2025",
		},
	},
	{
		slug: "semana-da-ciencia-e-tecnologia",
		title: "Semana da Ciência e Tecnologia",
		date: "2025-11-04",
		location: "Laboratórios e auditório principal",
		entities: [], // All schools
		summary:
			"Mostra interativa de projetos STEAM, residências científicas e encontros com investigadores.",
		description:
			"Inclui hackathons, maratonas de robótica e desafios de energia sustentável abertos à comunidade.",
		cover: "/assets/school/breadcrumb/breadcrumb-1.jpg",
		agenda: [
			{ time: "10:00", title: "Sessão experimental aberta" },
			{ time: "13:30", title: "Hackathon Energia Positiva" },
			{ time: "16:00", title: "Entrega de prémios" },
		],
		registration: {
			label: "Participar",
			href: "/eventos/semana-da-ciencia-e-tecnologia",
		},
	},
	{
		slug: "encontro-comunidade-educativa",
		title: "Encontro da Comunidade Educativa",
		date: "2025-01-27",
		location: "Auditório AE António Sérgio",
		entities: [], // All schools
		summary:
			"Partilha de boas práticas, apresentação do plano anual e momentos culturais dinamizados pelos alunos.",
		description:
			"Reúne pais, associações, parceiros e equipas pedagógicas para alinhar prioridades e projetos.",
		cover: "/assets/school/breadcrumb/breadcrumb-3.jpg",
		agenda: [
			{ time: "18:30", title: "Receção e mostra de projetos" },
			{ time: "19:30", title: "Debate sobre sucesso escolar" },
			{ time: "21:00", title: "Concerto solidário" },
		],
		registration: {
			label: "Confirmar presença",
			href: "/eventos/encontro-comunidade-educativa",
		},
	},
];

// Page translations
export const pageTranslations = {
	// About Page
	about: {
		meta: {
			title: {
				pt: `Sobre Nós | ${baseIdentity.name}`,
				en: `About Us | ${baseIdentity.name}`,
			},
			description: {
				pt: "Conheça o Agrupamento de Escolas António Sérgio. Uma instituição dedicada à excelência educativa e ao desenvolvimento integral dos nossos alunos.",
				en: "Learn about António Sérgio School Group. An institution dedicated to educational excellence and the holistic development of our students.",
			},
		},
		hero: {
			title: {
				pt: "Agrupamento de Escolas António Sérgio",
				en: "António Sérgio School Group",
			},
			subtitle: {
				pt: "Uma instituição dedicada à excelência educativa, à inovação e ao desenvolvimento integral dos nossos alunos.",
				en: "An institution dedicated to educational excellence, innovation and the holistic development of our students.",
			},
		},
		marquee: {
			text1: {
				pt: "Agrupamento de Escolas",
				en: "School Group",
			},
			text2: {
				pt: "António Sérgio",
				en: "António Sérgio",
			},
		},
		mission: {
			title: {
				pt: "A Nossa Missão",
				en: "Our Mission",
			},
			content: {
				pt: "O Agrupamento de Escolas António Sérgio tem como missão proporcionar uma educação de excelência, preparando os nossos alunos para os desafios do futuro. Através de instalações renovadas e metodologias inovadoras, criamos um ambiente propício ao desenvolvimento integral de cada estudante.",
				en: "António Sérgio School Group's mission is to provide excellent education, preparing our students for future challenges. Through renovated facilities and innovative methodologies, we create an environment conducive to the holistic development of each student.",
			},
		},
		vision: {
			title: {
				pt: "A Nossa Visão",
				en: "Our Vision",
			},
			content: {
				pt: "Aspiramos ser uma referência educativa, reconhecida pela qualidade do ensino, pelo compromisso com a comunidade e pela capacidade de inspirar e formar cidadãos conscientes, críticos e preparados para construir um futuro melhor.",
				en: "We aspire to be an educational reference, recognized for teaching quality, community commitment and the ability to inspire and educate conscious, critical citizens prepared to build a better future.",
			},
		},
		facts: {
			title: {
				pt: "Os Nossos Números",
				en: "Our Numbers",
			},
			subtitle: {
				pt: "Dados que refletem o nosso compromisso com a excelência educativa.",
				en: "Data reflecting our commitment to educational excellence.",
			},
			button: {
				pt: "Agendar Visita",
				en: "Schedule Visit",
			},
		},
		facilities: {
			title: {
				pt: "Como Trabalhamos?",
				en: "How We Work?",
			},
			button: {
				pt: "Contactar",
				en: "Contact Us",
			},
		},
	},
	// Contact Page
	contact: {
		meta: {
			title: {
				pt: `Contactos | ${baseIdentity.name}`,
				en: `Contact | ${baseIdentity.name}`,
			},
			description: {
				pt: "Entre em contacto com o Agrupamento de Escolas António Sérgio. Estamos prontos para responder às suas questões e acompanhar o seu percurso educativo.",
				en: "Contact António Sérgio School Group. We're ready to answer your questions and support your educational journey.",
			},
		},
		hero: {
			eyebrow: {
				pt: "Contactos",
				en: "Contact",
			},
			title: {
				pt: "Estamos aqui para ajudar no seu percurso educativo",
				en: "We're here to help with your educational journey",
			},
		},
		form: {
			name: {
				label: {
					pt: "Nome",
					en: "Name",
				},
				placeholder: {
					pt: "Insira o seu nome",
					en: "Enter your name",
				},
			},
			email: {
				label: {
					pt: "Email",
					en: "Email",
				},
				placeholder: {
					pt: "Insira o seu email",
					en: "Enter your email",
				},
			},
			message: {
				label: {
					pt: "Mensagem",
					en: "Message",
				},
				placeholder: {
					pt: "Escreva a sua mensagem",
					en: "Enter your message",
				},
			},
			tip: {
				pt: "Todos os campos são obrigatórios. Ao enviar o formulário, concorda com os",
				en: "All fields are required. By sending the form you agree to the",
			},
			terms: {
				pt: "Termos e Condições",
				en: "Terms & Conditions",
			},
			privacy: {
				pt: "Política de Privacidade",
				en: "Privacy Policy",
			},
			submit: {
				pt: "Enviar Mensagem",
				en: "Send Message",
			},
		},
		faq: {
			title: {
				pt: "Perguntas Frequentes",
				en: "Frequently Asked Questions",
			},
			content: {
				pt: "Tem dúvidas sobre matrículas, horários ou programas educativos? Consulte as nossas perguntas mais frequentes ou entre em contacto connosco diretamente.",
				en: "Have questions about enrollment, schedules or educational programs? Check our frequently asked questions or contact us directly.",
			},
		},
	},
	// Ticket Page
	ticket: {
		meta: {
			title: {
				pt: `Reportar Problema | ${baseIdentity.name}`,
				en: `Report Issue | ${baseIdentity.name}`,
			},
			description: {
				pt: "Reporte problemas técnicos ou outras questões através do nosso sistema de tickets. Estamos aqui para ajudar.",
				en: "Report technical issues or other problems through our ticket system. We're here to help.",
			},
		},
		hero: {
			eyebrow: {
				pt: "Suporte",
				en: "Support",
			},
			title: {
				pt: "Como podemos ajudar?",
				en: "How can we help?",
			},
			subtitle: {
				pt: "Preencha o formulário abaixo para reportar um problema. A nossa equipa entrará em contacto consigo o mais brevemente possível.",
				en: "Fill out the form below to report an issue. Our team will contact you as soon as possible.",
			},
		},
		form: {
			fullName: {
				label: {
					pt: "Nome Completo",
					en: "Full Name",
				},
				placeholder: {
					pt: "Insira o seu nome completo",
					en: "Enter your full name",
				},
			},
			email: {
				label: {
					pt: "Email",
					en: "Email",
				},
				placeholder: {
					pt: "seuemail@exemplo.com",
					en: "youremail@example.com",
				},
			},
			phone: {
				label: {
					pt: "Telefone",
					en: "Phone Number",
				},
				placeholder: {
					pt: "+351 912 345 678",
					en: "+351 912 345 678",
				},
			},
			title: {
				label: {
					pt: "Título",
					en: "Title",
				},
				placeholder: {
					pt: "Resumo do problema",
					en: "Issue summary",
				},
			},
			description: {
				label: {
					pt: "Descrição",
					en: "Description",
				},
				placeholder: {
					pt: "Descreva o problema em detalhe...",
					en: "Describe the issue in detail...",
				},
			},
			ticketType: {
				label: {
					pt: "Tipo de Problema",
					en: "Issue Type",
				},
				placeholder: {
					pt: "Selecione o tipo",
					en: "Select type",
				},
			},
			priority: {
				label: {
					pt: "Prioridade",
					en: "Priority",
				},
				options: {
					low: {
						pt: "Baixa",
						en: "Low",
					},
					medium: {
						pt: "Média",
						en: "Medium",
					},
					high: {
						pt: "Alta",
						en: "High",
					},
					urgent: {
						pt: "Urgente",
						en: "Urgent",
					},
					critical: {
						pt: "Crítica",
						en: "Critical",
					},
				},
			},
			location: {
				label: {
					pt: "Localização",
					en: "Location",
				},
				placeholder: {
					pt: "Ex: Sala 101, Pavilhão A",
					en: "E.g: Room 101, Building A",
				},
			},
			equipment: {
				label: {
					pt: "Equipamentos",
					en: "Equipment",
				},
				serialNumber: {
					label: {
						pt: "Número de Série",
						en: "Serial Number",
					},
					placeholder: {
						pt: "SN123456",
						en: "SN123456",
					},
				},
				description: {
					label: {
						pt: "Descrição",
						en: "Description",
					},
					placeholder: {
						pt: "Ex: Computador Dell, Monitor",
						en: "E.g: Dell Computer, Monitor",
					},
				},
				addButton: {
					pt: "Adicionar Equipamento",
					en: "Add Equipment",
				},
				removeButton: {
					pt: "Remover",
					en: "Remove",
				},
				noEquipment: {
					pt: "Nenhum equipamento adicionado",
					en: "No equipment added",
				},
			},
			submit: {
				pt: "Enviar Ticket",
				en: "Submit Ticket",
			},
			submitting: {
				pt: "A enviar...",
				en: "Submitting...",
			},
			success: {
				title: {
					pt: "Ticket Criado com Sucesso!",
					en: "Ticket Created Successfully!",
				},
				message: {
					pt: "O seu ticket foi registado. Receberá uma resposta em breve.",
					en: "Your ticket has been registered. You will receive a response soon.",
				},
				ticketNumber: {
					pt: "Número do Ticket",
					en: "Ticket Number",
				},
				accessCode: {
					pt: "Código de Acesso",
					en: "Access Code",
				},
				instruction: {
					pt: "Guarde este código para consultar o estado do seu ticket.",
					en: "Save this code to check your ticket status.",
				},
			},
			error: {
				title: {
					pt: "Erro ao Criar Ticket",
					en: "Error Creating Ticket",
				},
				message: {
					pt: "Ocorreu um erro ao criar o ticket. Por favor, tente novamente.",
					en: "An error occurred while creating the ticket. Please try again.",
				},
			},
			validation: {
				required: {
					pt: "Este campo é obrigatório",
					en: "This field is required",
				},
				emailInvalid: {
					pt: "Email inválido",
					en: "Invalid email",
				},
			},
		},
	},
	// Blog Page
	blog: {
		meta: {
			title: {
				pt: `Notícias | ${baseIdentity.name}`,
				en: `Blog | ${baseIdentity.name}`,
			},
			description: {
				pt: "Acompanhe as últimas notícias, novidades e acontecimentos do Agrupamento de Escolas António Sérgio.",
				en: "Follow the latest news, updates and events from António Sérgio School Group.",
			},
		},
		hero: {
			eyebrow: {
				pt: "Notícias",
				en: "Blog",
			},
			title: {
				pt: "Últimas Notícias e Novidades",
				en: "Latest Blogs and News",
			},
		},
	},
	// Eventos Page
	eventos: {
		meta: {
			title: {
				pt: `Eventos | ${baseIdentity.name}`,
				en: `Events | ${baseIdentity.name}`,
			},
			description: {
				pt: "Descubra os próximos eventos e atividades do Agrupamento de Escolas António Sérgio.",
				en: "Discover upcoming events and activities from António Sérgio School Group.",
			},
		},
		hero: {
			eyebrow: {
				pt: "Eventos",
				en: "Events",
			},
			title: {
				pt: "Próximos Eventos e Atividades",
				en: "Next Events and Activities",
			},
		},
	},
	// Projetos Page
	projetos: {
		meta: {
			title: {
				pt: `Projetos | ${baseIdentity.name}`,
				en: `Projects | ${baseIdentity.name}`,
			},
			description: {
				pt: "Conheça os projetos desenvolvidos no Agrupamento de Escolas António Sérgio.",
				en: "Discover the projects developed at António Sérgio School Group.",
			},
		},
		hero: {
			eyebrow: {
				pt: "Projetos",
				en: "Projects",
			},
			title: {
				pt: "Projetos e Iniciativas",
				en: "Projects and Initiatives",
			},
		},
	},
	// FAQ Page
	faq: {
		meta: {
			title: {
				pt: `Perguntas Frequentes | ${baseIdentity.name}`,
				en: `FAQ | ${baseIdentity.name}`,
			},
			description: {
				pt: "Encontre respostas às perguntas mais frequentes sobre o Agrupamento de Escolas António Sérgio. Informações sobre matrículas, horários e muito mais.",
				en: "Find answers to frequently asked questions about António Sérgio School Group. Information about enrollment, schedules and more.",
			},
		},
		hero: {
			eyebrow: {
				pt: "Perguntas Frequentes",
				en: "FAQ",
			},
			title: {
				pt: "Encontre as respostas que precisa",
				en: "Find the answers you need",
			},
		},
		search: {
			placeholder: {
				pt: "Pesquisar...",
				en: "Search...",
			},
			button: {
				pt: "Pesquisar",
				en: "Search",
			},
		},
		cta: {
			title: {
				pt: "Não encontrou a resposta?",
				en: "Didn't find the answer?",
			},
			text: {
				pt: "Entre em contacto connosco e teremos todo o gosto em ajudar.",
				en: "Contact us and we'll be happy to help.",
			},
			button: {
				pt: "Contactar",
				en: "Contact Us",
			},
		},
	},
};
