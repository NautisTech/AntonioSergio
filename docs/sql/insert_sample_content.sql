-- ===================================================================
-- SAMPLE CONTENT DATA FOR ANTONIO SERGIO SCHOOL WEBSITE
-- ===================================================================
-- Content IDs start at 7 (since 6 records already exist)
-- ===================================================================

-- ===================================================================
-- 1. NEWS CONTENT (Notícias) - IDs 7-12
-- ===================================================================

-- PT: Novo sistema de treinamento lançado (ID: 7)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    7,
    'Novo sistema de treinamento lançado',
    'novo-sistema-treinamento-pt',
    'Confira as novas funcionalidades do sistema de treinamento corporativo',
    '<h2>Bem-vindo ao novo sistema de treinamento</h2><p>Nós temos o prazer de anunciar o lançamento do nosso novo sistema de treinamento corporativo. Com uma interface intuitiva e recursos avançados para melhorar o aprendizado dos nossos alunos.</p><p>O sistema integra-se com todas as plataformas existentes e oferece relatórios em tempo real.</p>',
    'news',
    1,
    'published',
    'public',
    'https://picsum.photos/800/400?random=1',
    2,
    '2025-11-20 10:30:00',
    1,
    1,
    'pt',
    1,
    45,
    12,
    3,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: New training system launched (ID: 8)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    8,
    'New training system launched',
    'novo-sistema-treinamento-en',
    'Check out the new features of our corporate training system',
    '<h2>Welcome to the new training system</h2><p>We are pleased to announce the launch of our new corporate training system. With an intuitive interface and advanced features to improve our students'' learning.</p><p>The system integrates with all existing platforms and offers real-time reporting.</p>',
    'news',
    1,
    'published',
    'public',
    'https://picsum.photos/800/400?random=1',
    2,
    '2025-11-20 10:30:00',
    1,
    1,
    'en',
    1,
    45,
    12,
    3,
    0,
    GETDATE(),
    GETDATE()
);

-- PT: Melhorias no sistema de suporte (ID: 9)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    9,
    'Melhorias no sistema de suporte',
    'melhorias-sistema-suporte-pt',
    'Conheça as novas funcionalidades adicionadas ao sistema de atendimento',
    '<h2>Sistema de suporte aprimorado</h2><p>Implementamos várias melhorias no sistema de suporte para oferecer uma experiência melhor aos nossos clientes. Agora você pode acompanhar seus tickets em tempo real e receber notificações automáticas de atualização.</p>',
    'news',
    1,
    'published',
    'public',
    'https://picsum.photos/800/400?random=2',
    2,
    '2025-11-18 14:15:00',
    1,
    0,
    'pt',
    1,
    32,
    8,
    2,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: Improvements in the support system (ID: 10)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    10,
    'Improvements in the support system',
    'melhorias-sistema-suporte-en',
    'Learn about the new features added to our support system',
    '<h2>Enhanced support system</h2><p>We have implemented several improvements in our support system to provide a better experience to our customers. Now you can track your tickets in real-time and receive automatic update notifications.</p>',
    'news',
    1,
    'published',
    'public',
    'https://picsum.photos/800/400?random=2',
    2,
    '2025-11-18 14:15:00',
    1,
    0,
    'en',
    1,
    32,
    8,
    2,
    0,
    GETDATE(),
    GETDATE()
);

-- PT: Plano de manutenção programada (ID: 11)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    11,
    'Plano de manutenção programada',
    'plano-manutencao-programada-pt',
    'Informações sobre a próxima janela de manutenção do sistema',
    '<h2>Manutenção programada do sistema</h2><p>Estamos planejando uma manutenção do sistema para melhorar o desempenho e a segurança. A manutenção está programada para o próximo fim de semana das 22h de sexta-feira até as 6h de segunda-feira.</p><p>Durante este período, todos os serviços estarão temporariamente indisponíveis.</p>',
    'news',
    1,
    'published',
    'public',
    'https://picsum.photos/800/400?random=3',
    2,
    '2025-11-15 09:00:00',
    1,
    0,
    'pt',
    1,
    28,
    5,
    1,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: Scheduled maintenance plan (ID: 12)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    12,
    'Scheduled maintenance plan',
    'plano-manutencao-programada-en',
    'Information about the next system maintenance window',
    '<h2>System maintenance scheduled</h2><p>We are planning a system maintenance to improve performance and security. The maintenance is scheduled for next weekend from 10pm Friday to 6am Monday.</p><p>During this period, all services will be temporarily unavailable.</p>',
    'news',
    1,
    'published',
    'public',
    'https://picsum.photos/800/400?random=3',
    2,
    '2025-11-15 09:00:00',
    1,
    0,
    'en',
    1,
    28,
    5,
    1,
    0,
    GETDATE(),
    GETDATE()
);

-- ===================================================================
-- 2. BANNER CONTENT - IDs 13-16
-- ===================================================================

-- PT: Promoção 30% de desconto (ID: 13)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    13,
    'Promoção: 30% de desconto',
    'promocao-30-desconto-pt',
    'Aproveite nossa promoção especial com 30% de desconto',
    '<p>Promoção válida até o final do mês. Aproveite essa oportunidade especial em todos os nossos cursos!</p>',
    'banner',
    3,
    'published',
    'public',
    'https://picsum.photos/800/400?random=4',
    2,
    '2025-11-20 00:00:00',
    0,
    1,
    'pt',
    1,
    120,
    0,
    0,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: Promotion: 30% discount (ID: 14)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    14,
    'Promotion: 30% discount',
    'promocao-30-desconto-en',
    'Take advantage of our special promotion with 30% off',
    '<p>Promotion valid until the end of the month. Take advantage of this special opportunity on all our courses!</p>',
    'banner',
    3,
    'published',
    'public',
    'https://picsum.photos/800/400?random=4',
    2,
    '2025-11-20 00:00:00',
    0,
    1,
    'en',
    1,
    120,
    0,
    0,
    0,
    GETDATE(),
    GETDATE()
);

-- PT: Inscrições abertas para cursos técnicos (ID: 15)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    15,
    'Inscrições abertas para cursos técnicos',
    'inscricoes-cursos-tecnicos-pt',
    'Abra agora o formulário de inscrição para o ano letivo 2025/2026',
    '<p>Inscreva-se agora nos nossos cursos técnico-profissionais. Vagas limitadas - não perca esta oportunidade!</p>',
    'banner',
    3,
    'published',
    'public',
    'https://picsum.photos/800/400?random=5',
    2,
    '2025-11-19 08:00:00',
    0,
    1,
    'pt',
    1,
    95,
    0,
    0,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: Applications open for technical courses (ID: 16)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    16,
    'Applications open for technical courses',
    'inscricoes-cursos-tecnicos-en',
    'Open the application form for the 2025/2026 academic year',
    '<p>Enroll now in our technical and vocational courses. Limited spots - do not miss this opportunity!</p>',
    'banner',
    3,
    'published',
    'public',
    'https://picsum.photos/800/400?random=5',
    2,
    '2025-11-19 08:00:00',
    0,
    1,
    'en',
    1,
    95,
    0,
    0,
    0,
    GETDATE(),
    GETDATE()
);

-- ===================================================================
-- 3. EVENT CONTENT (Evento) - IDs 17-24
-- ===================================================================

-- PT: Semana da Ciência e Tecnologia 2025 (ID: 17)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    17,
    'Semana da Ciência e Tecnologia 2025',
    'semana-ciencia-tecnologia-2025-pt',
    'Uma semana completa de atividades de ciência, tecnologia, engenharia e matemática',
    '<h2>Semana da Ciência e Tecnologia</h2><p>Junte-se a nós para uma semana emocionante de atividades STEAM. Teremos workshops interativos, demonstrações ao vivo, competições de robótica e muito mais.</p><p>Professores e alunos de todas as escolas do agrupamento estão convidados a participar.</p>',
    'event',
    4,
    'published',
    'public',
    'https://picsum.photos/800/400?random=6',
    2,
    '2025-11-25 00:00:00',
    1,
    1,
    'pt',
    1,
    156,
    34,
    8,
    5,
    GETDATE(),
    GETDATE()
);

-- EN: Science and Technology Week 2025 (ID: 18)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    18,
    'Science and Technology Week 2025',
    'semana-ciencia-tecnologia-2025-en',
    'A full week of science, technology, engineering and mathematics activities',
    '<h2>Science and Technology Week</h2><p>Join us for an exciting week of STEAM activities. We will have interactive workshops, live demonstrations, robotics competitions and much more.</p><p>Teachers and students from all schools in our group are invited to participate.</p>',
    'event',
    4,
    'published',
    'public',
    'https://picsum.photos/800/400?random=6',
    2,
    '2025-11-25 00:00:00',
    1,
    1,
    'en',
    1,
    156,
    34,
    8,
    5,
    GETDATE(),
    GETDATE()
);

-- PT: Conferência de Orientação Vocacional (ID: 19)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    19,
    'Conferência de Orientação Vocacional',
    'conferencia-orientacao-vocacional-pt',
    'Especialistas em educação e carreira discutem oportunidades futuras',
    '<h2>Orientação para o Futuro</h2><p>Uma conferência completa sobre escolhas de carreira, universidades e oportunidades de trabalho. Contaremos com a presença de profissionais de várias áreas que partilharão suas experiências.</p>',
    'event',
    4,
    'published',
    'public',
    'https://picsum.photos/800/400?random=7',
    2,
    '2025-12-01 00:00:00',
    1,
    0,
    'pt',
    1,
    98,
    22,
    4,
    2,
    GETDATE(),
    GETDATE()
);

-- EN: Vocational Guidance Conference (ID: 20)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    20,
    'Vocational Guidance Conference',
    'conferencia-orientacao-vocacional-en',
    'Education and career specialists discuss future opportunities',
    '<h2>Guidance for the Future</h2><p>A comprehensive conference on career choices, universities and job opportunities. We will have the participation of professionals from various fields who will share their experiences.</p>',
    'event',
    4,
    'published',
    'public',
    'https://picsum.photos/800/400?random=7',
    2,
    '2025-12-01 00:00:00',
    1,
    0,
    'en',
    1,
    98,
    22,
    4,
    2,
    GETDATE(),
    GETDATE()
);

-- PT: Showcasing de Projetos Finais (ID: 21)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    21,
    'Showcasing de Projetos Finais',
    'showcasing-projetos-finais-pt',
    'Apresentação dos melhores projetos desenvolvidos pelos alunos durante o ano letivo',
    '<h2>Celebrando a Criatividade e Inovação</h2><p>Venha conhecer os projetos inovadores desenvolvidos pelos nossos alunos ao longo do ano. Serão apresentados protótipos, aplicações e soluções criativas que resolvem problemas reais.</p>',
    'event',
    4,
    'published',
    'public',
    'https://picsum.photos/800/400?random=8',
    2,
    '2025-12-10 00:00:00',
    1,
    1,
    'pt',
    1,
    189,
    45,
    12,
    8,
    GETDATE(),
    GETDATE()
);

-- EN: Final Projects Showcase (ID: 22)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    22,
    'Final Projects Showcase',
    'showcasing-projetos-finais-en',
    'Presentation of the best projects developed by students during the school year',
    '<h2>Celebrating Creativity and Innovation</h2><p>Come and discover the innovative projects developed by our students throughout the year. Prototypes, applications and creative solutions that solve real problems will be presented.</p>',
    'event',
    4,
    'published',
    'public',
    'https://picsum.photos/800/400?random=8',
    2,
    '2025-12-10 00:00:00',
    1,
    1,
    'en',
    1,
    189,
    45,
    12,
    8,
    GETDATE(),
    GETDATE()
);

-- ===================================================================
-- 4. PROJECT CONTENT (Projeto) - IDs 23-28
-- ===================================================================

-- PT: LabMaker - Laboratório de Inovação Criativa (ID: 23)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    23,
    'LabMaker - Laboratório de Inovação Criativa',
    'labmaker-laboratorio-inovacao-pt',
    'Espaço colaborativo que liga clubes de robótica, impressão 3D e programação criativa',
    '<h2>LabMaker</h2><p>O laboratório funciona em regime aberto para turmas do 2.º ciclo ao secundário, promovendo projetos STEAM com parceiros científicos. Este é um espaço onde a criatividade e a inovação se encontram para resolver desafios locais.</p><p>Oferecemos mentorias semanais, acesso a equipamento de última geração e oportunidades de colaboração com empresas e centros de investigação.</p>',
    'project',
    5,
    'published',
    'public',
    'https://picsum.photos/800/400?random=9',
    2,
    '2025-11-20 00:00:00',
    1,
    1,
    'pt',
    1,
    267,
    56,
    18,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: LabMaker - Creative Innovation Laboratory (ID: 24)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    24,
    'LabMaker - Creative Innovation Laboratory',
    'labmaker-laboratorio-inovacao-en',
    'Collaborative space linking robotics clubs, 3D printing and creative programming',
    '<h2>LabMaker</h2><p>The laboratory operates on an open basis for classes from the 2nd cycle to secondary school, promoting STEAM projects with scientific partners. This is a space where creativity and innovation meet to solve local challenges.</p><p>We offer weekly mentoring, access to state-of-the-art equipment and opportunities for collaboration with companies and research centres.</p>',
    'project',
    5,
    'published',
    'public',
    'https://picsum.photos/800/400?random=9',
    2,
    '2025-11-20 00:00:00',
    1,
    1,
    'en',
    1,
    267,
    56,
    18,
    0,
    GETDATE(),
    GETDATE()
);

-- PT: Programa de Educação Ambiental (ID: 25)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    25,
    'Programa de Educação Ambiental',
    'programa-educacao-ambiental-pt',
    'Iniciativa integrada de sustentabilidade e consciência ambiental',
    '<h2>Educação para a Sustentabilidade</h2><p>Um programa abrangente que integra educação ambiental em todas as disciplinas, com foco em ações concretas de sustentabilidade nas nossas escolas.</p><p>Os alunos aprendem sobre energia renovável, gestão de resíduos, conservação da biodiversidade e mudanças climáticas através de projetos práticos e investigação científica.</p>',
    'project',
    5,
    'published',
    'public',
    'https://picsum.photos/800/400?random=10',
    2,
    '2025-11-18 00:00:00',
    1,
    0,
    'pt',
    1,
    145,
    32,
    6,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: Environmental Education Program (ID: 26)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    26,
    'Environmental Education Program',
    'programa-educacao-ambiental-en',
    'Integrated initiative for sustainability and environmental awareness',
    '<h2>Education for Sustainability</h2><p>A comprehensive program that integrates environmental education across all disciplines, with a focus on concrete sustainability actions in our schools.</p><p>Students learn about renewable energy, waste management, biodiversity conservation and climate change through practical projects and scientific research.</p>',
    'project',
    5,
    'published',
    'public',
    'https://picsum.photos/800/400?random=10',
    2,
    '2025-11-18 00:00:00',
    1,
    0,
    'en',
    1,
    145,
    32,
    6,
    0,
    GETDATE(),
    GETDATE()
);

-- PT: Intercâmbio Internacional (ID: 27)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    27,
    'Intercâmbio Internacional',
    'intercambio-internacional-pt',
    'Programa de mobilidade estudantil com escolas parceiras na Europa',
    '<h2>Expandindo Horizontes Globais</h2><p>Um programa de intercâmbio que permite aos nossos alunos vivenciar educação em diferentes contextos culturais. Parcerias com escolas em Espanha, França e Alemanha criam oportunidades únicas de aprendizagem.</p><p>Os estudantes desenvolvem competências de comunicação intercultural e constroem amizades duradouras com colegas de outros países.</p>',
    'project',
    5,
    'published',
    'public',
    'https://picsum.photos/800/400?random=11',
    2,
    '2025-11-16 00:00:00',
    1,
    1,
    'pt',
    1,
    203,
    41,
    9,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: International Exchange (ID: 28)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    28,
    'International Exchange',
    'intercambio-internacional-en',
    'Student mobility program with partner schools in Europe',
    '<h2>Expanding Global Horizons</h2><p>An exchange program that allows our students to experience education in different cultural contexts. Partnerships with schools in Spain, France and Germany create unique learning opportunities.</p><p>Students develop intercultural communication skills and build lasting friendships with peers from other countries.</p>',
    'project',
    5,
    'published',
    'public',
    'https://picsum.photos/800/400?random=11',
    2,
    '2025-11-16 00:00:00',
    1,
    1,
    'en',
    1,
    203,
    41,
    9,
    0,
    GETDATE(),
    GETDATE()
);

-- ===================================================================
-- 5. FAQ CONTENT - IDs 29-36
-- ===================================================================

-- PT: Como funciona o processo de matrícula? (ID: 29)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    29,
    'Como funciona o processo de matrícula?',
    'como-funciona-processo-matricula-pt',
    'Esclarecemos os passos para se inscrever no agrupamento',
    '<h2>Processo de Matrícula</h2><p>O processo de matrícula é simples e direto. Os encarregados de educação devem preencher o formulário online no portal de candidaturas, durante o período de inscrições definido anualmente.</p><p>Após a submissão, receberá uma confirmação por email com os próximos passos e documentos necessários. O prazo médio de processamento é de 2 a 3 semanas.</p>',
    'faq',
    6,
    'published',
    'public',
    NULL,
    2,
    '2025-11-10 00:00:00',
    0,
    0,
    'pt',
    1,
    512,
    0,
    0,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: How does the enrollment process work? (ID: 30)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    30,
    'How does the enrollment process work?',
    'como-funciona-processo-matricula-en',
    'We clarify the steps to enroll in our school group',
    '<h2>Enrollment Process</h2><p>The enrollment process is simple and straightforward. Parents/guardians must complete the online form on the application portal during the annual application period.</p><p>After submission, you will receive an email confirmation with the next steps and required documents. Average processing time is 2 to 3 weeks.</p>',
    'faq',
    6,
    'published',
    'public',
    NULL,
    2,
    '2025-11-10 00:00:00',
    0,
    0,
    'en',
    1,
    512,
    0,
    0,
    0,
    GETDATE(),
    GETDATE()
);

-- PT: Quais são os horários de funcionamento da escola? (ID: 31)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    31,
    'Quais são os horários de funcionamento da escola?',
    'quais-horarios-funcionamento-escola-pt',
    'Informações sobre o calendário escolar e horários de aula',
    '<h2>Horários de Funcionamento</h2><p>O Agrupamento de Escolas António Sérgio funciona de segunda a sexta-feira, das 8h às 18h. Os horários das aulas variam conforme o ciclo educativo, geralmente entre 8h30 e 17h30.</p><p>Pode consultar o calendário escolar detalhado no portal do aluno ou contactar-nos diretamente para informações específicas sobre a turma do seu filho.</p>',
    'faq',
    6,
    'published',
    'public',
    NULL,
    2,
    '2025-11-10 00:00:00',
    0,
    0,
    'pt',
    1,
    478,
    0,
    0,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: What are the school's operating hours? (ID: 32)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    32,
    'What are the school''s operating hours?',
    'quais-horarios-funcionamento-escola-en',
    'Information about the school calendar and class schedules',
    '<h2>School Operating Hours</h2><p>António Sérgio School Group operates Monday to Friday, 8am to 6pm. Class schedules vary depending on the educational cycle, usually between 8:30am and 5:30pm.</p><p>You can check the detailed school calendar on the student portal or contact us directly for specific information about your child''s class.</p>',
    'faq',
    6,
    'published',
    'public',
    NULL,
    2,
    '2025-11-10 00:00:00',
    0,
    0,
    'en',
    1,
    478,
    0,
    0,
    0,
    GETDATE(),
    GETDATE()
);

-- PT: Que programas educativos são oferecidos? (ID: 33)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    33,
    'Que programas educativos são oferecidos?',
    'que-programas-educativos-oferecidos-pt',
    'Conheça a oferta educativa completa do agrupamento',
    '<h2>Programas Educativos Oferecidos</h2><p>Oferecemos programas educativos completos desde o pré-escolar até ao ensino secundário, incluindo cursos técnico-profissionais e programas de educação especial.</p><p>Todos os programas seguem as diretrizes curriculares nacionais e incorporam metodologias pedagógicas inovadoras e centradas no aluno, com foco no desenvolvimento de competências do século XXI.</p>',
    'faq',
    6,
    'published',
    'public',
    NULL,
    2,
    '2025-11-10 00:00:00',
    0,
    0,
    'pt',
    1,
    421,
    0,
    0,
    0,
    GETDATE(),
    GETDATE()
);

-- EN: What educational programs are offered? (ID: 34)
INSERT INTO content (id, title, slug, excerpt, content, type, content_type_id, status, visibility, featured_image, author_id, published_at, allow_comments, is_featured, language, version, view_count, like_count, share_count, comment_count, created_at, updated_at)
VALUES (
    34,
    'What educational programs are offered?',
    'que-programas-educativos-oferecidos-en',
    'Discover the complete educational offerings of our school group',
    '<h2>Educational Programs Offered</h2><p>We offer complete educational programs from pre-school to secondary education, including technical-vocational courses and special education programs.</p><p>All programs follow national curriculum guidelines and incorporate innovative, student-centered pedagogical methodologies with a focus on developing 21st-century skills.</p>',
    'faq',
    6,
    'published',
    'public',
    NULL,
    2,
    '2025-11-10 00:00:00',
    0,
    0,
    'en',
    1,
    421,
    0,
    0,
    0,
    GETDATE(),
    GETDATE()
);

-- ===================================================================
-- CUSTOM FIELD VALUES - EVENT
-- ===================================================================

-- EVENT: Semana da Ciência - Custom Fields (content_id 17)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, value_date, created_at, updated_at)
VALUES
(30, 'event', 17, NULL, '2025-12-02 09:00:00', GETDATE(), GETDATE()),  -- data_inicio
(31, 'event', 17, NULL, '2025-12-06 17:00:00', GETDATE(), GETDATE()),  -- data_fim
(32, 'event', 17, 'Campus Principal', NULL, GETDATE(), GETDATE()),     -- local
(33, 'event', 17, '09:00 - 17:00', NULL, GETDATE(), GETDATE());       -- horario

-- EVENT: Conferência de Orientação Vocacional (content_id 19)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, value_date, created_at, updated_at)
VALUES
(30, 'event', 19, NULL, '2025-12-01 14:00:00', GETDATE(), GETDATE()),  -- data_inicio
(31, 'event', 19, NULL, '2025-12-01 18:00:00', GETDATE(), GETDATE()),  -- data_fim
(32, 'event', 19, 'Auditório Principal - EB2/3 Santa Marinha', NULL, GETDATE(), GETDATE()), -- local
(33, 'event', 19, '14:00 - 18:00', NULL, GETDATE(), GETDATE());       -- horario

-- EVENT: Showcasing de Projetos Finais (content_id 21)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, value_date, created_at, updated_at)
VALUES
(30, 'event', 21, NULL, '2025-12-10 10:00:00', GETDATE(), GETDATE()),  -- data_inicio
(31, 'event', 21, NULL, '2025-12-10 16:00:00', GETDATE(), GETDATE()),  -- data_fim
(32, 'event', 21, 'Ginásio Multiusos - Campus Principal', NULL, GETDATE(), GETDATE()), -- local
(33, 'event', 21, '10:00 - 16:00', NULL, GETDATE(), GETDATE());       -- horario

-- ===================================================================
-- CUSTOM FIELD VALUES - PROJECT
-- ===================================================================

-- PROJECT: LabMaker (content_id 23)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, created_at, updated_at)
VALUES
(34, 'project', 23, 'Em curso', GETDATE(), GETDATE()),                 -- status_projeto
(35, 'project', 23, 'INESCTEC, Expandindústria', GETDATE(), GETDATE()), -- parceiros
(36, 'project', 23, 'Aumentar a participação feminina em projetos tecnológicos', GETDATE(), GETDATE()), -- objetivos_p1
(37, 'project', 23, 'Criar protótipos para desafios locais', GETDATE(), GETDATE()), -- objetivos_p2
(38, 'project', 23, 'Partilhar recursos digitais entre escolas do agrupamento', GETDATE(), GETDATE()), -- objetivos_p3
(40, 'project', 23, 'Mais de 120 alunos envolvidos em desafios de prototipagem rápida e mentoria semanal.', GETDATE(), GETDATE()); -- resultados

-- PROJECT: Programa de Educação Ambiental (content_id 25)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, created_at, updated_at)
VALUES
(34, 'project', 25, 'Em curso', GETDATE(), GETDATE()),                 -- status_projeto
(35, 'project', 25, 'Câmara Municipal, Instituto de Conservação da Natureza', GETDATE(), GETDATE()), -- parceiros
(36, 'project', 25, 'Integrar educação ambiental em todas as disciplinas', GETDATE(), GETDATE()), -- objetivos_p1
(37, 'project', 25, 'Implementar ações concretas de sustentabilidade nas escolas', GETDATE(), GETDATE()), -- objetivos_p2
(38, 'project', 25, 'Sensibilizar a comunidade para questões climáticas', GETDATE(), GETDATE()), -- objetivos_p3
(39, 'project', 25, 'Desenvolver projetos de energias renováveis', GETDATE(), GETDATE()), -- objetivos_p4
(40, 'project', 25, 'Redução de 40% no consumo de energia. Plantação de 500 árvores no campus. 8 projetos de investigação científica concluídos.', GETDATE(), GETDATE()); -- resultados

-- PROJECT: Intercâmbio Internacional (content_id 27)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, created_at, updated_at)
VALUES
(34, 'project', 27, 'Planeado', GETDATE(), GETDATE()),                 -- status_projeto
(35, 'project', 27, 'IES García Lorca (Espanha), Lycée Molière (França), Gymnasium Freiburg (Alemanha)', GETDATE(), GETDATE()), -- parceiros
(36, 'project', 27, 'Proporcionar experiências educativas em contextos culturais diferentes', GETDATE(), GETDATE()), -- objetivos_p1
(37, 'project', 27, 'Desenvolver competências de comunicação intercultural', GETDATE(), GETDATE()), -- objetivos_p2
(38, 'project', 27, 'Criar redes de colaboração internacional duradouras', GETDATE(), GETDATE()), -- objetivos_p3
(39, 'project', 27, 'Fortalecer a identidade europeia dos alunos', GETDATE(), GETDATE()), -- objetivos_p4
(40, 'project', 27, '85 alunos participantes. 4 semestres de intercâmbio confirmados. Protocolos de cooperação renovados por 3 anos.', GETDATE(), GETDATE()); -- resultados

-- ===================================================================
-- CONTENT TAGS JUNCTION (Only for Portuguese content)
-- ===================================================================

-- NEWS Tags (content_ids 7, 9, 11 - PT versions only)
INSERT INTO content_tags_junction (content_id, tag_id) VALUES
(7, 1), (7, 2), (7, 5),
(9, 1), (9, 2),
(11, 1), (11, 4);

-- EVENT Tags (content_ids 17, 19, 21 - PT versions only)
INSERT INTO content_tags_junction (content_id, tag_id) VALUES
(17, 2), (17, 3), (17, 5),
(19, 2), (19, 4),
(21, 2), (21, 3), (21, 5);

-- PROJECT Tags (content_ids 23, 25, 27 - PT versions only)
INSERT INTO content_tags_junction (content_id, tag_id) VALUES
(23, 3), (23, 5), (23, 6),
(25, 4), (25, 7),
(27, 4), (27, 6), (27, 8);

-- ===================================================================
-- CONTENT CATEGORIES JUNCTION (Only for Portuguese content)
-- ===================================================================

-- NEWS Categories (content_ids 7, 9, 11 - PT versions only)
INSERT INTO content_categories_junction (content_id, category_id) VALUES
(7, 1), (9, 1), (11, 1);

-- BANNER Categories (content_ids 13, 15 - PT versions only)
INSERT INTO content_categories_junction (content_id, category_id) VALUES
(13, 5), (15, 5);

-- EVENT Categories (content_ids 17, 19, 21 - PT versions only)
INSERT INTO content_categories_junction (content_id, category_id) VALUES
(17, 2), (19, 2), (21, 2);

-- PROJECT Categories (content_ids 23, 25, 27 - PT versions only)
INSERT INTO content_categories_junction (content_id, category_id) VALUES
(23, 3), (25, 3), (27, 3);

-- FAQ Categories (content_ids 29, 31, 33 - PT versions only)
INSERT INTO content_categories_junction (content_id, category_id) VALUES
(29, 4), (31, 4), (33, 4);

-- ===================================================================
-- END OF INSERT SCRIPT
-- ===================================================================
