-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.routes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  theme_id smallint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  total_distance real,
  estimated_time text,
  thumbnail_url text,
  paths ARRAY,
  CONSTRAINT routes_pkey PRIMARY KEY (id),
  CONSTRAINT routes_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id)
);
CREATE TABLE public.sessions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  route_id bigint,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  actual_distance double precision,
  actual_duration double precision,
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT sessions_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id)
);
CREATE TABLE public.themes (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text,
  description text,
  color_code text,
  icon_url text,
  CONSTRAINT themes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_infos (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  password text,
  CONSTRAINT user_infos_pkey PRIMARY KEY (id),
  CONSTRAINT user_info_id_fkey FOREIGN KEY (id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  username text NOT NULL,
  avatar_url text NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);