-- إضافة حقل `manual_override` لجدول `matches`
-- يقبل القيم: 'auto', 'open', 'closed'
-- الافتراضي 'auto'

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS manual_override text DEFAULT 'auto';

-- إذا كنت تريد إلغاء الحقل القديم is_manually_locked يمكنك تنفيذ هذا السطر (اختياري، يمكنك تركه لعدم التسبب بأخطاء لنسخ أقدم إن وجدت):
-- ALTER TABLE matches DROP COLUMN IF EXISTS is_manually_locked;
