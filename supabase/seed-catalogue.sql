-- ============================================================================
--  Angad Ayurveda — current catalogue, as SQL
--
--  Run this in the NEW Supabase project AFTER setup-all.sql, so the shop has
--  its product and coupons the moment you point the site at it. The id and
--  created_at columns are left out on purpose — the new database assigns its
--  own.
--
--  Regenerate whenever the catalogue changes; this is a snapshot, not a
--  source of truth.
-- ============================================================================

-- ---------------------------------------------------------------- products --

insert into public.products (slug, name, subtitle, description, benefits, ingredients, how_to_use, mrp, price, image, gallery, stock, active, bundle_items)
values ('ayurvedic-supplement', 'Ayurvedic Supplement', '100% herbal formula for metabolism, digestion & daily energy', 'Angad Ayurveda''s Ayurvedic Supplement is a classical Ayurvedic formulation built for today''s busy lifestyle. It brings together a balanced blend of time-tested herbs — Garcinia, Green Tea, Triphala, Guggul and Ginger — that support your metabolism, improve digestion and keep your energy steady through the day.

Every batch is manufactured in a GMP-certified facility and tested by a third-party lab. No added sugar, no preservatives, 100% vegetarian.', '["Naturally supports a healthy metabolism","Improves digestion and gut health","Helps reduce bloating and heaviness","Sustained energy all day, with no crash","100% vegetarian, no added sugar, no preservatives","GMP certified facility, third-party lab tested"]'::jsonb, 'Garcinia Cambogia (500mg), Green Tea Extract (200mg), Triphala (150mg), Guggul (100mg), Ginger Extract (50mg), Black Pepper Extract (5mg)', 'Take 1 capsule in the morning and 1 capsule in the evening, 30 minutes before meals, with lukewarm water. For best results, use consistently for 90 days.', 1499, 899, '/img/product-1.svg', '["/img/product-1.svg","/img/product-2.svg","/img/product-3.svg"]'::jsonb, 245, true, '[]'::jsonb)
on conflict do nothing;

-- ----------------------------------------------------------------- coupons --

insert into public.coupons (code, type, value, min_order, max_discount, expires_at, usage_limit, used_count, active, per_customer_limit)
values ('FLAT100', 'flat', 100, 799, 0, null, 0, 0, true, 0)
on conflict do nothing;

insert into public.coupons (code, type, value, min_order, max_discount, expires_at, usage_limit, used_count, active, per_customer_limit)
values ('AYULEAN10', 'percent', 10, 499, 200, null, 0, 0, true, 0)
on conflict do nothing;
