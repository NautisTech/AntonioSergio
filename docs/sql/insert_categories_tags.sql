-- ===================================================================
-- INSERT CATEGORIES
-- ===================================================================

INSERT INTO content_categories (id, name, slug, description, parent_id, icon, color, display_order, visible, created_at, updated_at)
VALUES
(1, 'Notícias', 'noticias', 'Notícias gerais da escola', NULL, 'mi-newspaper', '#3B82F6', 1, 1, GETDATE(), GETDATE()),
(2, 'Eventos', 'eventos', 'Eventos escolares e atividades', NULL, 'mi-calendar', '#10B981', 2, 1, GETDATE(), GETDATE()),
(3, 'Projetos', 'projetos', 'Projetos de investigação e inovação', NULL, 'mi-folder', '#F59E0B', 3, 1, GETDATE(), GETDATE()),
(4, 'FAQ', 'faq', 'Perguntas frequentes', NULL, 'mi-help-circle', '#8B5CF6', 4, 1, GETDATE(), GETDATE()),
(5, 'Banners', 'banners', 'Banners promocionais', NULL, 'mi-image', '#EC4899', 5, 1, GETDATE(), GETDATE());

-- ===================================================================
-- INSERT TAGS
-- ===================================================================

INSERT INTO [tag] (id, name, slug, color, description, tag_group, usage_count, created_at, updated_at, deleted_at)
VALUES
(1, 'STEAM', 'steam', '#3B82F6', 'Ciência, Tecnologia, Engenharia e Matemática', 'educacao', 3, GETDATE(), GETDATE(), NULL),
(2, 'Ciência', 'ciencia', '#10B981', 'Actividades de Ciência', 'educacao', 4, GETDATE(), GETDATE(), NULL),
(3, 'Tecnologia', 'tecnologia', '#F59E0B', 'Tecnologia e Inovação', 'educacao', 3, GETDATE(), GETDATE(), NULL),
(4, 'Orientação', 'orientacao', '#8B5CF6', 'Orientação Vocacional', 'carreira', 2, GETDATE(), GETDATE(), NULL),
(5, 'Inovação', 'inovacao', '#EC4899', 'Projetos Inovadores', 'educacao', 3, GETDATE(), GETDATE(), NULL),
(6, 'Sustentabilidade', 'sustentabilidade', '#14B8A6', 'Sustentabilidade Ambiental', 'ambiente', 2, GETDATE(), GETDATE(), NULL),
(7, 'Energia', 'energia', '#06B6D4', 'Energias Renováveis', 'ambiente', 1, GETDATE(), GETDATE(), NULL),
(8, 'Intercâmbio', 'intercambio', '#A855F7', 'Programas de Intercâmbio', 'internacional', 1, GETDATE(), GETDATE(), NULL);
