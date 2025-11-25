-- ===================================================================
-- REMAINING CUSTOM FIELD VALUES - WITH ENTIDADES
-- ===================================================================

-- Add entidades to NEWS (custom_field_config_id = 1 for news)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, created_at, updated_at)
VALUES
(1, 'news', 7, 'antoniosergio,marco,praia', GETDATE(), GETDATE()),
(1, 'news', 9, 'marco,pedras,marquessantos', GETDATE(), GETDATE()),
(1, 'news', 11, 'antoniosergio,qntchas,stamarinha', GETDATE(), GETDATE());

-- Add entidades to BANNER (custom_field_config_id = 5 for banner)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, created_at, updated_at)
VALUES
(5, 'banner', 13, 'antoniosergio,marco,praia,pedras,marquessantos,qntchas,stamarinha', GETDATE(), GETDATE()),
(5, 'banner', 15, 'praia,pedras,qntchas', GETDATE(), GETDATE());

-- EVENT: Semana da Ciência - Custom Fields (content_id 17)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, value_date, created_at, updated_at)
VALUES
(2, 'event', 17, 'antoniosergio,marco,praia,pedras,marquessantos,qntchas,stamarinha', NULL, GETDATE(), GETDATE());  -- entidades (custom_field_config_id = 2 for event)

-- EVENT: Conferência de Orientação Vocacional (content_id 19)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, value_date, created_at, updated_at)
VALUES
(2, 'event', 19, 'antoniosergio,stamarinha', NULL, GETDATE(), GETDATE());  -- entidades

-- EVENT: Showcasing de Projetos Finais (content_id 21)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, value_date, created_at, updated_at)
VALUES
(2, 'event', 21, 'marco,praia,pedras,qntchas', NULL, GETDATE(), GETDATE());  -- entidades

-- Add entidades to PROJECT (custom_field_config_id = 3 for project)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, created_at, updated_at)
VALUES
(3, 'project', 23, 'antoniosergio', GETDATE(), GETDATE()),  -- LabMaker (ES only)
(3, 'project', 25, 'antoniosergio,marco,praia,pedras,marquessantos,qntchas,stamarinha', GETDATE(), GETDATE()),  -- Educação Ambiental (all)
(3, 'project', 27, 'marco,pedras,marquessantos,qntchas', GETDATE(), GETDATE());  -- Intercâmbio


-- Add entidades to FAQ (custom_field_config_id = 4 for faq)
INSERT INTO custom_field_value (custom_field_config_id, entity_type, entity_id, value_text, created_at, updated_at)
VALUES
(4, 'faq', 29, 'antoniosergio,marco,praia,pedras,marquessantos,qntchas,stamarinha', GETDATE(), GETDATE()),
(4, 'faq', 31, 'antoniosergio,pedras,marquessantos,qntchas,stamarinha', GETDATE(), GETDATE()),
(4, 'faq', 33, 'praia,marco,qntchas', GETDATE(), GETDATE());

-- ===================================================================
-- END OF INSERTS
-- ===================================================================
